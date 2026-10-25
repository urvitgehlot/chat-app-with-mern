import mongoose, { mongo, Schema } from "mongoose";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { DirectChat } from "../models/directChat.model.js";
import { Message } from "../models/message.model.js";
import { Attachment } from "../models/attachment.model.js";
import { GroupMembership } from "../models/groupMembership.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import { ReadReceipt } from "../models/readReceipt.model.js";
import { Group } from "../models/group.model.js";
import { getIO, getOnlineUsers } from "../socket/index.js";

const sendMessage = asyncHandler(async (req, res) => {
    // get content, chatType, sentToId, replyToMessageId

    // check if any attachment

    // upload attachments on cloudinary

    // if chatType is group then check does user is in group if yes then sendToId is GroupId
    // else create DirectChat object and put sendToId in user2Id

    // check if replyToMessageId then it should point to Messsage Object itself with id replytoMessageId

    const { content, chatType, chatId, replyToMessageId, sentTo, senderId } = req.body;
    const attachmentsLocalPath = [];
    const attachments = [];

    if ([
        content,
        chatType,
        chatId,
        senderId,
        sentTo
    ].some((field) => !field?.trim())) {
        throw new ApiError(400, "All fields are required")
    }

    const trimmedChatType = chatType.trim().toLowerCase()

    if (trimmedChatType !== "group" && trimmedChatType !== 'direct') {
        throw new ApiError(400, "Invalid chatType Value")
    }

    if (!mongoose.isValidObjectId(chatId)) {
        throw new ApiError(400, "Invalid Chat Id")
    }

    if (trimmedChatType === "group") {
        const groupMembership = await GroupMembership.findOne({ groupId: chatId, userId });
        if (!groupMembership) {
            throw new ApiError(400, "You are not a member of this group");
        }
    }

    const io = getIO();
    const onlineUsers = getOnlineUsers();
    const receiverSocketId = onlineUsers[sentTo.toString()];


    const dbSession = await mongoose.startSession();
    try {
        await dbSession.withTransaction(async () => {

            if (req.files && Array.isArray(req.files.attachments) && req.files.attachments.length > 0) {
                req.files.attachments.forEach(async (attachment) => {
                    attachmentsLocalPath.push(attachment.path)
                    attachments.push(await uploadOnCloudinary(attachment.path))
                });
            }

            if (trimmedChatType === "direct") {


                const sortedParticipants = [senderId.toString(), sentTo.toString()].sort();

                let directChat = await DirectChat.findOne({
                    participants: sortedParticipants
                });

                let isNewChat = false;

                if (!directChat) {
                    directChat = await DirectChat.create({
                        participants: sortedParticipants,
                        chatCreatedBy: senderId,
                        unreadCount: 0,
                        lastMessageId: null,
                    });

                    await directChat.populate("participants", "_id displayName username avatarUrl lastActiveAt");
                    isNewChat = true;
                }

                const message = await Message.create({
                    directChat: directChat._id,
                    chatType: "direct",
                    senderId,
                    content: content.trim(),
                    replyToMessageId: replyToMessageId || null,
                });

                directChat = await DirectChat.findByIdAndUpdate(directChat._id, {
                    $set: {
                        lastMessageId: message._id
                    },
                    $inc: {
                        unreadCount: 1
                    }
                }, {
                    new: true
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

                await directChat.populate('participants', "_id displayName username avatarUrl lastActiveAt");
                await directChat.populate({
                    path: 'lastMessageId',
                    populate: {
                        path: 'senderId',
                        select: '_id displayName username avatarUrl',
                    },
                });

                await message.populate("senderId", "_id displayName username avatarUrl");
                // await message.populate("replyToMessageId", "_id content attachments.fileType attachments.fileUrl senderId");

                if (receiverSocketId) {
                    io.to(receiverSocketId).emit('receive_message', {
                        message,
                        chat: directChat,
                        attachments,
                        isNewChat
                    })
                } else {
                    console.log('receiver is offline')
                }

                return res.status(200).json(new ApiResponse(
                    200,
                    {
                        message,
                        directChat,
                        attachments,
                        isNewChat
                    },
                    "Message sent successfully"
                ));


            } else {

                // Groups

                const group = await Group.findById(chatId);
                if (!group) {
                    throw new ApiError(400, "Group not found");
                }

                const groupMembership = await GroupMembership.findOne({
                    userId: req.user._id,
                    groupId: chatId,
                    isRemoved: false
                });
                if (!groupMembership) {
                    throw new ApiError(400, "You are not a member of this group");
                }


                const message = await Message.create({
                    groupId: chatId,
                    chatType: "group",
                    senderId: req.user._id,
                    content: content.trim(),
                    replyToMessageId: replyToMessageId || null,
                });

                attachments.forEach(async (attachment) => {
                    await Attachment.create({
                        publicId: attachment.public_id,
                        fileUrl: attachment.url,
                        fileType: attachment.type,
                        fileSize: attachment.bytes,
                        messageId: message._id,
                    });
                });

                await message.populate("senderId", "_id displayName username avatarUrl lastActiveAt");

                return res.status(200).json(new ApiResponse(
                    200,
                    {
                        message,
                        group: group,
                        attachments
                    },
                    "Message sent successfully"
                ));
            }
        })


    } catch (error) {
        // await dbSession.endSession();
        // we need to remove the media that are uploaded to cloudinary
        console.error("Error creating message:", error);
        throw new ApiError(500, "Failed to create message");

    } finally {
        await dbSession.endSession();
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

const getChatMessagesByPage = asyncHandler(async (req, res) => {
    const { chatId, chatType, page = 1, limit = 20 } = req.query;

    if (!chatId || !chatType || (chatType !== "direct" && chatType !== "group")) {
        throw new ApiError(400, "Chat Id and Chat Type are required");
    }
    var directChat;

    if (chatType === "direct") {
        directChat = await DirectChat.findById(chatId)
            .populate("participants", "_id displayName username avatarUrl lastActiveAt");
    }
    else {

    }

    const pipeline = [
        {
            $match: {
                directChat: new mongoose.Types.ObjectId(chatId),
                chatType: "direct",
            }
        },
        {
            $sort: {
                sentAt: -1,
            }
        },
        {
            $facet: {
                messages: [
                    {
                        $skip: (page - 1) * limit,
                    },
                    {
                        $limit: parseInt(limit),
                    },
                ],
                totalCount: [
                    {
                        $count: "count"
                    }
                ],
            }
        }
    ];

    const messages = await Message.aggregate(pipeline);

    // testing fast way to load messages
    // const messages = await Message.find({
    //     $or: [
    //         { directChat: chatId },
    //         { groupId: chatId }
    //     ],
    //     chatType,
    // })
    //     .sort({ sentAt: -1 })
    //     .skip((page - 1) * limit)
    //     .limit(Number(limit))
    //     .populate("senderId", "_id displayName username avatarUrl lastActiveAt")
    //     .lean();

    // const [messages, totalCount] = await Promise.all([
    //     Message.find({ directChat: chatId, chatType: "direct" })
    //         .sort({ sentAt: -1 })
    //         .skip((page - 1) * limit)
    //         .limit(Number(limit))
    //         .lean(),
    //     Message.countDocuments({ directChat: chatId, chatType: "direct" })
    // ]);


    // const readReceipts = messages[0]['messages'].filter((message) => message.senderId.toString() !== req.user._id.toString()).map((message) => {
    //     return {
    //         messageId: message._id,
    //         userId: req.user._id,
    //     }
    // })

    // const acknowledged = await ReadReceipt.insertMany(readReceipts);
    // console.log("acknowledged: ", acknowledged);


    // const total = 1000;
    const total = messages[0].totalCount[0]?.count || 0;
    const totalPages = Math.ceil(total / limit);

    return res.status(200).json(
        new ApiResponse(
            200,
            { messages: messages[0]['messages'], directChat: directChat, total: total, totalPages: totalPages },
            "Messages fetched successfully"
        )
    );
});

const getChatUnreadMessagesByPage = asyncHandler(async (req, res) => {
    const { chatId, chatType, page = 1, limit = 20 } = req.query;

    if (!chatId || !chatType || (chatType !== "direct" && chatType !== "group")) {
        throw new ApiError(400, "Chat Id and Chat Type are required");
    }
    var directChat;

    if (chatType === "direct") {
        directChat = await DirectChat.findById(chatId)
            .populate("participants", "_id displayName username avatarUrl lastActiveAt");
    }
    else {

    }

    const pipeline = [
        {
            $match: {
                directChat: new mongoose.Types.ObjectId(chatId),
                chatType: "direct",
            }
        },
        {
            $sort: {
                sentAt: -1,
            }
        },
        {
            $facet: {
                messages: [
                    {
                        $skip: (page - 1) * limit,
                    },
                    {
                        $limit: parseInt(limit),
                    },
                ],
                totalCount: [
                    {
                        $count: "count"
                    }
                ],
            }
        }
    ];

    const messages = await Message.aggregate(pipeline);

    // const readReceipts = messages[0]['messages'].filter((message) => message.senderId.toString() !== req.user._id.toString()).map((message) => {
    //     return {
    //         messageId: message._id,
    //         userId: req.user._id,
    //     }
    // })

    // const acknowledged = await ReadReceipt.insertMany(readReceipts);
    // console.log("acknowledged: ", acknowledged);


    const total = messages[0].totalCount[0]?.count || 0;
    const totalPages = Math.ceil(total / limit);

    return res.status(200).json(
        new ApiResponse(
            200,
            { messages: messages[0]['messages'], directChat: directChat, total: total, totalPages: totalPages },
            "Messages fetched successfully"
        )
    );
});

export {
    sendMessage,
    getUserAllMessages,
    getChatMessagesByPage
}