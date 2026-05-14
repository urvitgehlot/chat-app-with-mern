import mongoose, { mongo, Schema } from "mongoose";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { DirectChat } from "../models/directChat.model.js";
import { Message } from "../models/message.model.js";
import { Attachment } from "../models/attachment.model.js";
import { GroupMembership } from "../models/groupMembership.model.js";
import ApiResponse from "../utils/ApiResponse.js";

const sendMessage = asyncHandler(async (req, res) => {
    // get content, chatType, sentToId, replyToMessageId

    // check if any attachment

    // upload attachments on cloudinary

    // if chatType is group then check does user is in group if yes then sendToId is GroupId
    // else create DirectChat object and put sendToId in user2Id

    // check if replyToMessageId then it should point to Messsage Object itself with id replytoMessageId

    const { content, chatType, sentTo, replyToMessageId } = req.body;
    const attachmentsLocalPath = [];
    const attachments = [];

    if ([content, chatType, sentTo].some((field) => field.trim() === "")) {
        throw new ApiError(400, "All fields are required")
    }

    chatType = chatType.trim().lowerCase()

    if (chatType !== "group" || chatType !== 'direct') {
        throw new ApiError(400, "Invalid chatType Value")
    }

    if (!mongoose.isValidObjectId(sentTo)) {
        throw new ApiError(400, "Invalid SentTo Id")
    }

    if (chatType == "group") {
        const groupMembership = await GroupMembership.findOne({ groupId, userId });
        if (!groupMembership) {
            return true;
        } else {
            return false
        }
    }


    if (req.files && Array.isArray(req.files.attachments) && req.files.attachments.length > 0) {
        req.files.attachments.forEach(async (attachment) => {
            attachmentsLocalPath.push(attachment.path)
            attachments.push(await uploadOnCloudinary(attachment.path))
        });
    }

    if (chatType.trim().lowerCase() === "direct") {
        const directChat = await DirectChat.create({
            user1Id: req.user._id,
            user2Id: new mongoose.Types.ObjectId(sentTo)
        })

        const message = await Message.create({
            directChat: directChat._id,
            replyToMessageId: replyToMessageId ? replyToMessageId : undefined,
            content,
        });

        attachments.forEach(async (attachment) => {
            await Attachment.create({
                publicId: attachment.public_id,
                fileUrl: attachment.url,
                fileType: attachment.type,
                fileSize: attachment.bytes,
                messageId: message._id,
            })

        });

    } else {

        Groups

        attachments.forEach(async (attachment) => {
            await Attachment.create({
                publicId: attachment.public_id,
                fileUrl: attachment.url,
                fileType: attachment.type,
                fileSize: attachment.bytes,
                messageId: message._id,
            })

        });
    }

})

const getUserAllMessages = asyncHandler(async (req, res) => {
    const { chatId } = req.query;

    if (!chatId) {
        throw new ApiError(400, "Chat Id is required");
    }

    const directChat = await DirectChat.findById(chatId)
        .populate("participants", "_id displayName username avatarUrl lastActiveAt");

    const messages = await Message.find({
        directChat: chatId,
        chatType: "direct",
    }).sort({ sentAt: -1 }).populate("senderId", "_id displayName username avatarUrl lastActiveAt");

    return res.status(200).json(new ApiResponse(200, { directChat: directChat, messages: messages }, "Messages fetched successfully"));
});

export {
    sendMessage,
    getUserAllMessages
}