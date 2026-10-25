import mongoose from "mongoose";
import { Message } from "../models/message.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { ReadReceipt } from "../models/readReceipt.model.js";
import { ConversationReadState } from "../models/ConversationReadState.model.js";



const readReceiptAllMessages = asyncHandler(async (req, res) => {
    const { chatId, chatType } = req.query;
    const userId = req.user._id;

    if (!chatId || !chatType || (chatType !== "direct" && chatType !== "group")) {
        throw new ApiError(400, "ChatId and ChatType are required");
    }

    // [
    //     {
    //         $match: {
    //             chatId: "6aa68f5786bac79417c9f6ba",
    //             chatType: "direct",
    //             senderId: {
    //                 $ne: "6aa68f5686bac79417c9f5db"
    //             }
    //         }
    //     },
    //     {
    //         $lookup: {
    //             from: "readreceipts",
    //             let: {
    //                 msgId: "$_id"
    //             },
    //             pipeline: [
    //                 {
    //                     $match: {
    //                         $expr: {
    //                             $and: [
    //                                 {
    //                                     $eq: ["$messageId", "$$msgId"]
    //                                 },
    //                                 {
    //                                     $eq: [
    //                                         "$userId",
    //                                         "6aa68f5686bac79417c9f5db"
    //                                     ]
    //                                 }
    //                             ]
    //                         }
    //                     }
    //                 }
    //             ],
    //             as: "readReceipts"
    //         }
    //     },
    //     {
    //         $match: {
    //             readReceipts: {
    //                 $size: 0
    //             }
    //         }
    //     }
    // ]


    const messageUnreadPipeline = [
        {
            $match: {
                directChat: chatType === "direct" && new mongoose.Types.ObjectId(chatId),
                groupId: chatType === "group" && new mongoose.Types.ObjectId(chatId),
                chatType: chatType,
                senderId: { $ne: new mongoose.Types.ObjectId(userId) },
                isDeleted: false,
            },
        },
        {
            $lookup: {
                from: "readreceipts",
                let: { msgId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$messageId", "$$msgId"] },
                                    { $eq: ["$userId", new mongoose.Types.ObjectId(userId)] }
                                ]
                            }
                        }
                    }
                ],
                as: "readReceipts"
            }
        },
        {
            $match: {
                readReceipts: {
                    $size: 0,
                },
            },
        },
    ];

    const messageUnread = await Message.aggregate(messageUnreadPipeline);

    const readReceipts = messageUnread.map((message) => {
        return {
            messageId: message._id,
            userId: userId,
        };
    });

    const acknowledged = await ReadReceipt.insertMany(readReceipts);
    console.log("acknowledged: ", acknowledged);

    console.log("messageUnread: ", messageUnread);

    return res.status(200)
        .json(new ApiResponse(
            200,
            { messageUnread: messageUnread, acknowledged: acknowledged },
            "Messages Marked Read Successfully",
        ));
});

const readReceiptMessageById = asyncHandler(async (req, res) => {
    const { messageId, chatType } = req.body;
    const userId = req.user._id;

    if (!messageId || !chatType || (chatType !== "direct" && chatType !== "group")) {
        throw new ApiError(400, "MessageId and ChatType are required");
    }

    const message = await Message.findOne({
        _id: new mongoose.Types.ObjectId(messageId),
        chatType: chatType,
        senderId: { $ne: new mongoose.Types.ObjectId(userId) },
        isDeleted: false,
    });

    if (!message) {
        throw new ApiError(404, "Message not found");
    }

    const readReceipt = await ReadReceipt.create({
        messageId: messageId,
        userId: userId,
    });

    return res.status(200)
        .json(new ApiResponse(
            200,
            { readReceipt: readReceipt },
            "Message Marked Read Successfully",
        ));
});




const markMessageAsRead = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id;

        const {
            chatType,
            directChat,
            groupId,
            lastReadMessageId,
        } = req.body;

        if (!chatType || (chatType !== "direct" && chatType !== "group")) {
            throw new ApiError(400, "ChatType is required");
        }

        if (chatType === "direct") {
            if (!directChat) {
                throw new ApiError(400, "DirectChat is required");
            }
        } else if (chatType === "group") {
            if (!groupId) {
                throw new ApiError(400, "GroupId is required");
            }
        }

        const message = await Message.findById(lastReadMessageId);

        if (!message) {
            throw new ApiError(404, "Message not found");
        }

        if (message.senderId.toString() === userId) {
            throw new ApiError(400, "You cannot mark your own message as read");
        }

        if (
            (
                message.chatType !== 'direct' &&
                message.directChat.toString() !== directChat
            ) ||
            (
                message.chatType !== 'group' &&
                message.groupId.toString() !== groupId
            )
        ) {
            throw new ApiError(400, "Message does not belong to same chat");
        }

        const filter = {
            chatType: chatType,
            userId: userId,
        };

        if (chatType === "direct") {
            filter.directChat = new mongoose.Types.ObjectId(directChat);
        } else if (chatType === "group") {
            filter.groupId = new mongoose.Types.ObjectId(groupId);
        }

        const existing = await ConversationReadState.findOne(filter);

        if (
            existing?.lastReadMessageId &&
            existing.createdAt >= message.createdAt
        ) {

        }


        const conversationReadState = await ConversationReadState.create({
            chatType: chatType,
            directChat: directChat,
            groupId: groupId,
            userId: userId,
            lastReadMessageId: lastReadMessageId,
        });

        return res.status(200)
            .json(new ApiResponse(
                200,
                { conversationReadState: conversationReadState },
                "Message Marked Read Successfully",
            ));

    } catch (error) {
        throw new ApiError(500, error.message);
    }
});



export {
    readReceiptAllMessages,
    readReceiptMessageById,
}