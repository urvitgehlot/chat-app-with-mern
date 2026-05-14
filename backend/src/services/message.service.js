import mongoose from "mongoose";
import ApiError from "../utils/ApiError.js";
import { Message } from "../models/message.model.js";
import { DirectChat } from "../models/directChat.model.js";

export const createMessage = async ({
    senderId,
    content,
    chatType,
    chatId,
    sentTo,
    replyToMessageId

}) => {

    if (!content?.trim() || !chatType?.trim() || !sentTo?.trim()) {
        throw new ApiError(400, "All fields are required");
    }

    const normalizedChatType = chatType.trim().toLowerCase();

    if (normalizedChatType !== "direct" && normalizedChatType !== "group") {
        throw new ApiError(400, "chatType must be 'direct' or 'group'");
    }

    if (normalizedChatType === 'direct' && !mongoose.isValidObjectId(sentTo)) {
        throw new ApiError(400, "sentTo is not valid")
    }

    if (normalizedChatType === 'group' && !mongoose.isValidObjectId(chatId)) {
        throw new ApiError(400, "chatId is not valid")
    }

    if (normalizedChatType === 'direct') {
        const sortedParticipants = [senderId.toString(), sentTo.toString()].sort();

        let directChat = await DirectChat.findOne({
            participants: sortedParticipants
        });

        if (!directChat) {
            directChat = await DirectChat.create({
                participants: sortedParticipants,
                chatCreatedBy: senderId,
            })
        }

        const message = await Message.create({
            directChat: directChat._id,
            chatType: "direct",
            senderId,
            content: content.trim(),
            replyToMessageId: replyToMessageId || null,
        });

        await message.populate("senderId", "_id displayName username avatarUrl");

        return { message, directChat };
    } else {
        // TODO: handle group chat message creation
    }
}