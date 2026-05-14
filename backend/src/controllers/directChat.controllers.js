import mongoose from "mongoose";
import { DirectChat } from "../models/directChat.model.js";
import { Message } from "../models/message.model.js";
import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";


const createDirectChat = asyncHandler(async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        throw new ApiError(400, "User ID is required");
    }

    const user = await User.findById(userId);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const existedDirectChat = await DirectChat.findOne({
        participants: {
            $all: [req.user._id, userId],
        },
    });

    if (existedDirectChat) {
        return res.status(200).json(new ApiResponse(200, existedDirectChat, "Direct Chat already exists"));
    }

    const directChat = await DirectChat.create({
        participants: [req.user._id, userId],
    });

    return res.status(201).json(new ApiResponse(201, directChat, "Direct Chat created successfully"));
});

const getUserDirectChats = asyncHandler(async (req, res) => {

    const directChats = await DirectChat.find({
        participants: req.user._id,
    }).populate("participants", "_id displayName username avatarUrl lastActiveAt");

    return res.status(200).json(new ApiResponse(200, directChats, "Direct Chats fetched successfully"));
});

const getRecentChats = asyncHandler(async (req, res) => {
    const userId = new mongoose.Types.ObjectId(req.user._id);

    const directChats = await DirectChat.find({
        participants: userId,
    }).populate("participants", "displayName username avatarUrl lastActiveAt");

    const otherUser = new Map();
    directChats.forEach(chat => {
        otherUser.set(chat._id.toString(), chat.participants.find(
            u => u._id.toString() !== req.user._id.toString()
        ));
    });

    const directChatIds = directChats.map(chat => chat._id);

    const recentChats = await Message.aggregate([
        {
            $match: {
                directChat: { $in: directChatIds },
            },
        },
        {
            $sort: { sentAt: -1 },
        },
        {
            $group: {
                _id: "$directChat",
                lastMessage: {
                    $first: "$$ROOT",
                },
            }
        },
    ]);

    const lastMessage = new Map();
    directChatIds.map((chatId) => {
        lastMessage.set(chatId.toString(), null);
    });
    recentChats.map((chat) => {
        lastMessage.set(chat._id.toString(), {
            ...chat.lastMessage,
            user: otherUser.get(chat._id.toString()),
        });
    });

    return res.status(200)
        .json(new ApiResponse(200, Object.fromEntries(lastMessage), "Recent chats fetched successfully",));
});

export {
    createDirectChat,
    getUserDirectChats,
    getRecentChats,
}