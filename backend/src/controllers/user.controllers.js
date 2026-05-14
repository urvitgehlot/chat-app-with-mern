import { httpsOptions } from "../constants.js";
import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import jwt from "jsonwebtoken"

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

const registerUser = asyncHandler(async (req, res) => {
    const { email, password, displayName } = req.body


    if ([email, password, displayName].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All feild is required")
    }

    const existedUser = await User.findOne({
        $or: [{ email }],
    })

    if (existedUser) {
        throw new ApiError(409, "User with username or email Already Existed")
    }

    const username = await generateUniqueUserName({ displayName });

    const user = await User.create({
        username,
        email,
        password,
        displayName,
    });

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
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

    const loginedUser = await User.findById(user._id).select("-password -refreshToken")

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
        .cookie("accessToken", httpsOptions)
        .cookie("refreshToken", httpsOptions)
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
        throw new ApiError(401, error?.message || "Something went wrong while refreshing access token")
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

const updateAvatar = asyncHandler(async (req, res) => {
    const avatarLocalUrl = req.file?.path;

    if (!avatarLocalUrl) {
        throw new ApiError(400, "Avatar is requred")
    }

    const avatar = await uploadOnCloudinary(avatarLocalUrl)

    if (!avatar) {
        throw new ApiError(400, "Avatar is required")
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

export {
    loginUser,
    registerUser,
    logoutUser,
    refreshAccessToken,
    getCurrentUser,
    updateAvatar,
    updateDisplayName,
    updateAboutMe,
}