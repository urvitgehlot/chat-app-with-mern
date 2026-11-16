import mongoose from "mongoose";
import { Message } from "../models/message.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { ConversationReadState } from "../models/conversationReadState.model.js";
import { DirectChat } from "../models/directChat.model.js";
import { GroupMembership } from "../models/groupMembership.model.js";
import ApiError from "../utils/ApiError.js";
import { getIO, getOnlineUsers } from "../socket/index.js";
import { isMessageCoveredByCursor } from "../utils/readState.js";

/**
 * Advances the authenticated user's read cursor (ConversationReadState) for a direct or group chat.
 * Rejects invalid chat/message mismatches and guarantees monotonic (forward-only) cursor progression.
 */
const markMessageAsRead = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const {
        chatType,
        directChat,
        groupId,
        chatId,
        lastReadMessageId,
    } = req.body;

    if (!chatType || (chatType !== "direct" && chatType !== "group")) {
        throw new ApiError(400, "chatType must be 'direct' or 'group'");
    }

    const resolvedDirectChatId = chatType === "direct" ? (directChat || chatId) : undefined;
    const resolvedGroupId = chatType === "group" ? (groupId || chatId) : undefined;

    if (chatType === "direct" && !mongoose.isValidObjectId(resolvedDirectChatId)) {
        throw new ApiError(400, "Valid directChat ID is required");
    }

    if (chatType === "group" && !mongoose.isValidObjectId(resolvedGroupId)) {
        throw new ApiError(400, "Valid groupId is required");
    }

    if (!mongoose.isValidObjectId(lastReadMessageId)) {
        throw new ApiError(400, "Invalid lastReadMessageId");
    }

    const message = await Message.findOne({
        _id: lastReadMessageId,
        isDeleted: { $ne: true },
    });

    if (!message) {
        throw new ApiError(404, "Message not found");
    }

    if (message.senderId.equals(userId)) {
        throw new ApiError(400, "You cannot mark your own message as read");
    }

    if (message.chatType !== chatType) {
        throw new ApiError(400, "Message chatType does not match");
    }

    let recipientIds = [];

    if (chatType === "direct") {
        if (!message.directChat || message.directChat.toString() !== resolvedDirectChatId.toString()) {
            throw new ApiError(400, "Message does not belong to this direct chat");
        }

        const directChatDoc = await DirectChat.findOne({
            _id: resolvedDirectChatId,
            participants: userId,
        })
            .select("participants")
            .lean();

        if (!directChatDoc) {
            throw new ApiError(403, "You are not a participant of this direct chat");
        }

        recipientIds = directChatDoc.participants
            .map((id) => id.toString())
            .filter((id) => id !== userId.toString());
    } else {
        if (!message.groupId || message.groupId.toString() !== resolvedGroupId.toString()) {
            throw new ApiError(400, "Message does not belong to this group chat");
        }

        const membership = await GroupMembership.findOne({
            groupId: resolvedGroupId,
            userId,
            isRemoved: false,
        })
            .select("_id")
            .lean();

        if (!membership) {
            throw new ApiError(403, "You are not an active member of this group");
        }

        const activeMembers = await GroupMembership.find({
            groupId: resolvedGroupId,
            isRemoved: false,
        })
            .select("userId")
            .lean();

        recipientIds = activeMembers
            .map((m) => m.userId?.toString())
            .filter((id) => id && id !== userId.toString());
    }

    const filter = {
        chatType,
        userId,
        ...(chatType === "direct"
            ? { directChat: new mongoose.Types.ObjectId(resolvedDirectChatId) }
            : { groupId: new mongoose.Types.ObjectId(resolvedGroupId) }),
    };

    const existing = await ConversationReadState.findOne(filter)
        .populate("lastReadMessageId", "_id sentAt createdAt");

    if (existing?.lastReadMessageId && isMessageCoveredByCursor(message, existing.lastReadMessageId)) {
        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    conversationReadState: existing,
                    alreadyRead: true,
                    updated: false,
                },
                "Already read this message"
            )
        );
    }

    const now = new Date();
    const conversationReadState = await ConversationReadState.findOneAndUpdate(
        filter,
        {
            $set: {
                lastReadMessageId: message._id,
                lastReadAt: now,
            },
        },
        { upsert: true, new: true }
    );

    const remainingUnread = await Message.countDocuments({
        ...(chatType === "direct"
            ? { directChat: new mongoose.Types.ObjectId(resolvedDirectChatId) }
            : { groupId: new mongoose.Types.ObjectId(resolvedGroupId) }),
        chatType,
        senderId: { $ne: userId },
        isDeleted: false,
        $or: [
            { sentAt: { $gt: message.sentAt } },
            {
                sentAt: message.sentAt,
                $or: [
                    { createdAt: { $gt: message.createdAt } },
                    { createdAt: message.createdAt, _id: { $gt: message._id } },
                ],
            },
        ],
    });

    if (chatType === "direct") {
        await DirectChat.findByIdAndUpdate(resolvedDirectChatId, {
            $set: { unreadCount: remainingUnread },
        });
    } else {
        await GroupMembership.findOneAndUpdate(
            { groupId: resolvedGroupId, userId, isRemoved: false },
            { $set: { unreadCount: remainingUnread } }
        );
    }

    try {
        const io = getIO();
        const onlineUsers = getOnlineUsers();

        const readReceiptPayload = {
            chatType,
            chatId: (chatType === "direct" ? resolvedDirectChatId : resolvedGroupId).toString(),
            userId: userId.toString(),
            lastReadMessageId: message._id.toString(),
            lastReadMessageSentAt: message.sentAt,
            lastReadAt: conversationReadState.lastReadAt,
        };

        recipientIds.forEach((recipientId) => {
            const recipientSocketId = onlineUsers[recipientId];
            if (recipientSocketId) {
                io.to(recipientSocketId).emit("message_read", readReceiptPayload);
            }
        });
    } catch (socketError) {
        console.error("Failed to emit message_read socket event:", socketError.message);
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                conversationReadState,
                alreadyRead: false,
                updated: true,
                unreadCount: remainingUnread,
            },
            "Message marked read successfully"
        )
    );
});

export { markMessageAsRead };
