import fs from "fs";
import { httpsOptions } from "../constants.js";
import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadOnCloudinary, deleteOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import { generateOTP, generateVerificationToken, verifyVerificationToken } from "../utils/otp.js";
import { sendEmail } from "../emails/mailer.js";
import { otpTemplate } from "../emails/templates.js";

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        user.save({ validateBeforeSave: false })
        return { accessToken, refreshToken }

    } catch (error) {
        console.error("Error generating access and refresh token: ", error)
        throw new ApiError(500, "Error while generating access and refresh token")
    }
}


// not in use right now
const generateUniqueUserName = async ({ displayName }) => {
    try {
        let username = displayName.toLowerCase().trim();

        username = username.replace(/\s+/g, "_");

        let existedUser = await User.findOne({
            username,
        })

        while (existedUser) {
            const randomSuffix = Math.floor(Math.random() * 1000) + 1;
            username = `${username}_${randomSuffix}`;
            existedUser = await User.findOne({
                username,
            });
        }

        return username;

    } catch (error) {
        console.error("Error generating username: ", error)
        throw new ApiError(500, "Error while generating username")
    }

}

const sendRegistrationOTP = asyncHandler(async (req, res) => {
    const { email } = req.body
    if (!email || !email.trim()) {
        throw new ApiError(400, "Email is required")
    }

    try {
        const existedUser = await User.findOne({
            email: email.trim().toLowerCase()
        })
        if (existedUser) {
            throw new ApiError(409, "User with email Already Existed")
        }

        const otp = generateOTP();
        const verificationToken = generateVerificationToken(email, otp, 10);

        if (process.env.NODE_ENV === "development") {
            console.log('[DEV Only] OTP: ', otp)
            console.log('[DEV Only] Verification Token: ', verificationToken)

        } else {
            const { subject, text, html } = otpTemplate({ email, otp })
            await sendEmail({
                to: email.trim().toLowerCase(),
                subject,
                text,
                html,
            })
        }


        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { verificationToken },
                    "OTP sent successfully"
                )
            )
    } catch (error) {
        console.error("Error in sendRegistrationOTP: ", error);
        throw new ApiError(500, "Error while sending OTP");
    }
})


// TODO: otp verification in registration
const registerUser = asyncHandler(async (req, res) => {
    const { email, otp, verificationToken, password } = req.body


    if ([email, otp, verificationToken, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All feild is required")
    }

    const existedUser = await User.findOne({
        $or: [{ email }],
    })

    if (existedUser) {
        throw new ApiError(409, "User with email Already Existed")
    }

    // TODO: otp verification
    const verificationResult = verifyVerificationToken(email, otp, verificationToken);
    if (!verificationResult.isValid) {
        throw new ApiError(401, verificationResult.message);
    }

    const user = await User.create({
        email,
        password,
    });

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

    const createdUser = await User
        .findById(user._id)
        .select(
            "-password -refreshToken -__v -isDeleted -isBanned -createdAt -updatedAt"
        )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201)
        .cookie("accessToken", accessToken, httpsOptions)
        .cookie("refreshToken", refreshToken, httpsOptions)
        .json(
            new ApiResponse(
                201,
                {
                    user: createdUser,
                    accessToken,
                    refreshToken,
                },
                "User register Successfully",
            )
        )
})

const loginUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body

    if ((!email && !username) || !password) {
        throw new ApiError(400, "All Feild are required")
    }

    const user = await User.findOne({
        $or: [{ email }, { username }]
    })

    if (!user) {
        throw new ApiError(400, "User not exist")
    }

    if (!await user.isPasswordCorrect(password)) {
        throw new ApiError(401, "Invalid User Credential")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

    const loginedUser = await User
        .findById(user._id)
        .select("-password -refreshToken -__v -isDeleted -isBanned -createdAt -updatedAt")

    return res
        .status(200)
        .cookie("accessToken", accessToken, httpsOptions)
        .cookie("refreshToken", refreshToken, httpsOptions)
        .json(
            new ApiResponse(
                200,
                {
                    user: loginedUser,
                    accessToken,
                    refreshToken,
                },
                "Login Successfull"
            )
        )
})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1,
            }
        },
        {
            new: true,
        }
    )

    return res
        .status(200)
        .clearCookie("accessToken", httpsOptions)
        .clearCookie("refreshToken", httpsOptions)
        .json(
            new ApiResponse(200, {}, "Logout Successfull")
        )

})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        const user = await User.findById(decodedToken?._id).select(
            '-password'
        );

        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }

        console.log("incomingRefreshToken: ", incomingRefreshToken)
        console.log("user.refreshToken: ", user.refreshToken)

        if (user.refreshToken !== incomingRefreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
        }

        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

        return res
            .status(200)
            .cookie("accessToken", accessToken, httpsOptions)
            .cookie("refreshToken", refreshToken, httpsOptions)
            .json(
                new ApiResponse(200, { accessToken, refreshToken, user }, "Access token refreshed successfully")
            )

    } catch (error) {
        return res
            .status(401)
            .clearCookie("accessToken", httpsOptions)
            .clearCookie("refreshToken", httpsOptions)
            .json(
                new ApiResponse(401, {}, "Something went wrong while refreshing access token")
            )
    }
})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { user: req.user },
                "User fetched successfully"
            )
        );
})

const completeProfileSetup = asyncHandler(async (req, res) => {
    const { displayName, username, aboutMe } = req.body;
    const avatarFile = req.file || req.files?.avatar?.[0];
    const avatarLocalUrl = avatarFile?.path;
    let uploadedAvatar = null;

    try {
        if (!displayName?.trim() || !username?.trim() || !avatarLocalUrl) {
            throw new ApiError(400, "Display name, username and avatar are required");
        }

        if (aboutMe && aboutMe.trim().length > 100) {
            throw new ApiError(400, "About me must be less than 100 characters");
        }

        const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
        if (avatarFile?.mimetype && !allowedMimeTypes.includes(avatarFile.mimetype)) {
            throw new ApiError(400, "Avatar must be a jpeg, png, webp or jpg image");
        }

        const usernameExists = await User.findOne({ username: username.trim(), _id: { $ne: req.user._id } });
        if (usernameExists) {
            throw new ApiError(409, "Username already exists");
        }

        if (avatarLocalUrl) {
            uploadedAvatar = await uploadOnCloudinary(avatarLocalUrl);

            if (!uploadedAvatar?.url) {
                throw new ApiError(500, "Failed to upload avatar image");
            }
        }

        const user = await User.findById(req.user._id);

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        if (user.avatarUrl && uploadedAvatar) {
            await deleteOnCloudinary(user.avatarUrl);
        }

        user.avatarUrl = uploadedAvatar?.url ?? user.avatarUrl ?? null;
        user.username = username.trim();
        user.displayName = displayName.trim();
        user.aboutMe = aboutMe?.trim() ?? null;
        await user.save({ validateBeforeSave: false });

        const updatedUser = await User.findById(user._id).select(
            "-password -refreshToken -isDeleted -isBanned -createdAt -updatedAt"
        );

        return res
            .status(200)
            .json(
                new ApiResponse(200, updatedUser, "Profile Setup Completed successfully")
            );
    } catch (error) {
        // Clean up newly uploaded avatar from cloudinary if subsequent steps failed
        if (uploadedAvatar?.url) {
            try {
                await deleteOnCloudinary(uploadedAvatar.url);
            } catch (cleanupError) {
                console.error("Error in cleaning up avatar from Cloudinary", cleanupError);
            }
        }

        // Clean up temp local file if still present
        if (avatarLocalUrl && fs.existsSync(avatarLocalUrl)) {
            try {
                fs.unlinkSync(avatarLocalUrl);
            } catch (unlinkError) {
                console.error("Error unlinking local temp file", unlinkError);
            }
        }

        if (error instanceof ApiError) {
            throw error;
        }

        console.error("Profile setup error:", error);
        throw new ApiError(error.statusCode || 500, error.message || "Profile Setup Failed");
    }
});

const updateAvatar = asyncHandler(async (req, res) => {
    const avatarLocalUrl = req.file?.path;

    if (!avatarLocalUrl) {
        throw new ApiError(400, "Avatar is required");
    }

    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (req.file?.mimetype && !allowedMimeTypes.includes(req.file.mimetype)) {
        if (fs.existsSync(avatarLocalUrl)) {
            fs.unlinkSync(avatarLocalUrl);
        }
        throw new ApiError(400, "Avatar must be a jpeg, png, webp or jpg image");
    }

    const avatar = await uploadOnCloudinary(avatarLocalUrl);

    if (!avatar?.url) {
        throw new ApiError(500, "Avatar upload failed");
    }

    const user = await User.findById(req.user._id)

    if (!user) {
        throw new ApiError(404, "User not found")
    }

    if (user.avatarUrl) {
        await deleteOnCloudinary(user.avatarUrl)
    }

    user.avatarUrl = avatar.url
    await user.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "Avatar updated successfully")
        );
});

const updateDisplayName = asyncHandler(async (req, res) => {
    const { displayName } = req.body

    if (!displayName || displayName == "")
        return ApiError(400, "Display Name is required")

    const user = await User.findById(req.user._id);

    user.displayName = displayName;

    user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "Display Name updated successfully")
        );
});

const updateAboutMe = asyncHandler(async (req, res) => {
    const { aboutMe } = req.body;

    if (!aboutMe || aboutMe == "")
        return ApiError(400, "About Me is required");

    const user = await User.findById(req.user._id);

    user.aboutMe = aboutMe;

    user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "About Me updated successfully")
        );
});

const searchUsers = asyncHandler(async (req, res) => {
    const { query, limit } = req.query;

    if (!query || typeof query !== "string" || !query.trim()) {
        throw new ApiError(400, "Query is required");
    }

    const sanitizedQuery = query.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 50);

    const users = await User.find({
        _id: { $ne: req.user._id },
        $or: [
            { displayName: { $regex: sanitizedQuery, $options: "i" } },
            { username: { $regex: sanitizedQuery, $options: "i" } },
        ],
    })
        .limit(parsedLimit)
        .select("_id displayName username avatarUrl lastActiveAt aboutMe");

    return res.status(200).json(new ApiResponse(200, users, "Users fetched successfully"));
});


export {
    sendRegistrationOTP,
    loginUser,
    registerUser,
    logoutUser,
    refreshAccessToken,
    getCurrentUser,
    updateAvatar,
    updateDisplayName,
    updateAboutMe,
    completeProfileSetup,
    searchUsers
}