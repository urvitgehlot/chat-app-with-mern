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
import { DirectChat } from "../models/directChat.model.js";
import { GroupMembership } from "../models/groupMembership.model.js";
import { ConversationReadState } from "../models/conversationReadState.model.js";
import { getMessageReadStatus, isMessageCoveredByCursor } from "../utils/readState.js";
import mongoose from "mongoose";
import { redisClient } from "../../config/redis.js";

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

    if (user.isDeleted) {
        throw new ApiError(400, "User not found")
    }

    if (user.isBanned) {
        throw new ApiError(403, "Your account has been suspended by the administrator. Please contact support for assistance.")
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
        isBanned: false,
        isDeleted: false,
        $or: [
            { displayName: { $regex: sanitizedQuery, $options: "i" } },
            { username: { $regex: sanitizedQuery, $options: "i" } },
        ],
    })
        .limit(parsedLimit)
        .select("_id displayName username avatarUrl lastActiveAt aboutMe");

    return res.status(200).json(new ApiResponse(200, users, "Users fetched successfully"));
});




const getRecentChats = asyncHandler(async (req, res) => {
    try {

        const cachedKey = `user:${req.user._id}:recent-chats`;

        // Only read cache if Redis is connected
        if (redisClient.isOpen) {
            const cachedChats = await redisClient.get(cachedKey);

            if (cachedChats) {
                return res.status(200)
                    .json(
                        new ApiResponse(
                            200,
                            JSON.parse(cachedChats),
                            "Recent chats fetched successfully",
                            'redis'
                        ),
                    );
            }
        }

        const [directChats, groupChats] = await Promise.all([
            DirectChat.find({
                participants: req.user._id,
            })
                .sort({ updatedAt: -1 })
                .populate('participants', "_id displayName username avatarUrl lastActiveAt")
                .populate({
                    path: 'lastMessageId',
                    select: "_id content senderId directChat chatType isDeleted sentAt createdAt",
                    populate: {
                        path: 'senderId',
                        select: '_id displayName username avatarUrl',
                    },
                })
                .lean(),

            GroupMembership.find({
                userId: req.user._id,
                isRemoved: false,
            })
                .sort({ updatedAt: -1 })
                .populate({
                    path: 'groupId',
                    select: "_id name description avatarUrl lastMessageId updatedAt",
                    populate: {
                        path: 'lastMessageId',
                        select: "_id content senderId groupId chatType isDeleted sentAt createdAt",
                        populate: {
                            path: 'senderId',
                            select: '_id displayName username avatarUrl',
                        },
                    }
                })
                .lean(),
        ]);

        const currentUserIdStr = req.user._id.toString();
        const getMsgSenderId = (msg) =>
            typeof msg?.senderId === "object" && msg.senderId !== null
                ? msg.senderId._id?.toString()
                : msg?.senderId?.toString();

        const directChatIds = directChats
            .filter((c) => c.lastMessageId && typeof c.lastMessageId === "object")
            .map((c) => c._id);
        const activeGroupMemberships = groupChats.filter((m) => m.groupId);

        const mySentGroupIds = [];
        const otherSentGroupIds = [];
        for (const membership of activeGroupMemberships) {
            const lastMsg = membership.groupId.lastMessageId;
            if (!lastMsg || typeof lastMsg !== "object") continue;
            if (getMsgSenderId(lastMsg) === currentUserIdStr) {
                mySentGroupIds.push(membership.groupId._id);
            } else {
                otherSentGroupIds.push(membership.groupId._id);
            }
        }

        const readStateOr = [];
        if (directChatIds.length > 0) {
            readStateOr.push({ chatType: "direct", directChat: { $in: directChatIds } });
        }
        if (mySentGroupIds.length > 0) {
            readStateOr.push({ chatType: "group", groupId: { $in: mySentGroupIds } });
        }
        if (otherSentGroupIds.length > 0) {
            readStateOr.push({
                chatType: "group",
                groupId: { $in: otherSentGroupIds },
                userId: req.user._id,
            });
        }

        const readStates = readStateOr.length > 0
            ? await ConversationReadState.find({ $or: readStateOr })
                .select("chatType directChat groupId userId lastReadMessageId")
                .populate("lastReadMessageId", "_id sentAt createdAt")
                .lean()
            : [];

        const myCursorByKey = new Map();
        const otherCursorsByKey = new Map();

        for (const rs of readStates) {
            if (!rs.lastReadMessageId) continue;
            const targetId = rs.chatType === "direct" ? rs.directChat?.toString() : rs.groupId?.toString();
            if (!targetId) continue;
            const key = `${rs.chatType}:${targetId}`;

            if (rs.userId.toString() === currentUserIdStr) {
                myCursorByKey.set(key, rs.lastReadMessageId);
            } else {
                if (!otherCursorsByKey.has(key)) {
                    otherCursorsByKey.set(key, []);
                }
                otherCursorsByKey.get(key).push(rs.lastReadMessageId);
            }
        }

        const enrichChat = (chatObj, chatType, membershipUnreadCount) => {
            const key = `${chatType}:${chatObj._id.toString()}`;
            const myCursor = myCursorByKey.get(key) || null;
            const otherCursors = otherCursorsByKey.get(key) || [];
            const hasLastMessageObj = chatObj.lastMessageId && typeof chatObj.lastMessageId === "object";
            const lastMessage = hasLastMessageObj
                ? {
                    ...chatObj.lastMessageId,
                    isRead: getMessageReadStatus({
                        message: chatObj.lastMessageId,
                        currentUserId: req.user._id,
                        myReadCursor: myCursor,
                        otherReadCursors: otherCursors,
                    }),
                }
                : chatObj.lastMessageId;

            let unreadCount = 0;
            if (hasLastMessageObj) {
                if (myCursor && isMessageCoveredByCursor(lastMessage, myCursor)) {
                    unreadCount = 0;
                } else if (chatType === "group") {
                    unreadCount = membershipUnreadCount ?? 0;
                } else {
                    unreadCount = getMsgSenderId(lastMessage) === currentUserIdStr
                        ? 0
                        : (chatObj.unreadCount ?? 0);
                }
            }

            return {
                ...chatObj,
                chatType,
                lastMessageId: lastMessage,
                unreadCount,
                myLastReadMessageId: myCursor?._id || null,
                myLastReadSentAt: myCursor?.sentAt || null,
            };
        };

        const recentChats = [
            ...directChats.map((chat) => enrichChat(chat, "direct")),
            ...activeGroupMemberships.map((membership) =>
                enrichChat(membership.groupId, "group", membership.unreadCount)
            ),
        ].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

        // Only read cache if Redis is connected
        if (redisClient.isOpen) {
            await redisClient.setEx(
                cachedKey,
                300,
                JSON.stringify(recentChats),
            );
        }

        return res.status(200)
            .json(new ApiResponse(
                200,
                recentChats,
                "Recent chats fetched successfully",
            ));
    } catch (error) {
        console.error("Internal Server Error", error)
        throw ApiError(500, "Internal Server Error");

    }

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
    searchUsers,
    getRecentChats
}