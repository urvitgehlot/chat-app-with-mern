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

    // const pipeline = [
    //     {
    //         $match: {
    //             directChat: {
    //                 $in: directChatIds
    //             },
    //         },
    //     },
    //     {
    //         $group: {
    //             _id: "$directChat",
    //             lastMessage: {
    //                 $first: "$$ROOT",
    //             },
    //         }
    //     },
    //     {
    //         $lookup: {
    //             from: "directchats",
    //             localField: "_id",
    //             foreignField: "_id",
    //             as: "directChat"
    //         },
    //     },
    //     {
    //         $unwind: {
    //             path: "$directChat",
    //             preserveNullAndEmptyArrays: true,
    //         }
    //     },
    //     {
    //         $lookup: {
    //             from: "groups",
    //             localField: "lastMessage.groupId",
    //             foreignField: "_id",
    //             as: "group"
    //         },
    //     },
    //     {
    //         $unwind: {
    //             path: "$group",
    //             preserveNullAndEmptyArrays: true,
    //         }
    //     },
    //     {
    //         $lookup: {
    //             from: "users",
    //             let: {
    //                 participantIds: "$directChat.participants"
    //             },
    //             pipeline: [
    //                 {
    //                     $match: {
    //                         $expr: {
    //                             $in: ["$_id", "$$participantIds"]
    //                         }
    //                     }
    //                 },
    //                 {
    //                     $project: {
    //                         _id: 1,
    //                         username: 1,
    //                         displayName: 1,
    //                         avatarUrl: 1,
    //                         lastActiveAt: 1,
    //                         aboutMe: 1,
    //                     }
    //                 }
    //             ],
    //             as: "directChat.participants"
    //         }
    //     },
    //     {
    //         $lookup: {
    //             from: "messages",
    //             let: {
    //                 chatId: "$_id"
    //             },
    //             pipeline: [
    //                 {
    //                     $match: {
    //                         $expr: {
    //                             $eq: ["$directChat", "$$chatId"]
    //                         }
    //                     }
    //                 },
    //                 {
    //                     $lookup: {
    //                         from: "readreceipts",
    //                         let: {
    //                             msgId: "$_id"
    //                         },
    //                         pipeline: [
    //                             {
    //                                 $match: {
    //                                     $expr: {
    //                                         $and: [
    //                                             {
    //                                                 $eq: ["$messageId", "$$msgId"]
    //                                             },
    //                                             {
    //                                                 $eq: ["$userId", userId]
    //                                             }
    //                                         ]
    //                                     }
    //                                 }
    //                             }
    //                         ],
    //                         as: "readReceipts"
    //                     }
    //                 },
    //                 {
    //                     $match: {
    //                         readReceipts: {
    //                             $size: 0
    //                         }
    //                     }
    //                 },
    //                 {
    //                     $count: "count"
    //                 },
    //                 {
    //                     $sort: { sentAt: -1 },
    //                 },
    //             ],
    //             as: "unreadMessages"
    //         }
    //     },
    //     {
    //         $addFields: {
    //             unreadCount: {
    //                 $ifNull: [
    //                     {
    //                         $arrayElemAt: ["$unreadMessages.count", 0]
    //                     },
    //                     0
    //                 ]
    //             }
    //         }
    //     },
    //     {
    //         $project: {
    //             unreadMessages: 0
    //         }
    //     }
    // ];

    // const recentChats = await Message.aggregate(pipeline);


    /*
    What we need in output:
    - List of {directChats + lastMessage + unreadCount}

    steps:
    1: get all directChats of current user by participants
    2: embed last message in directChats
    3: populate users in participants field of directChats
    4: compute unreadCount for each directChat
    5: sort by lastMessage as timestamp
    */


    const pipeline = [

        {
            $match: {
                participants: userId,
            },
        },
        {
            $lookup: {
                from: "messages",
                localField: "_id",
                foreignField: "directChat",
                pipeline: [
                    {
                        $sort: {
                            sentAt: -1,
                        },
                    },
                    {
                        $limit: 1,
                    },
                ],
                as: "lastMessageArr",
            },
        },
        {
            $unwind: {
                path: "$lastMessageArr",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $lookup: {
                from: "users",
                let: {
                    participantsIds: "$participants",
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $in: ["$_id", "$$participantsIds"],
                            },
                        },
                    },
                    {
                        $project: {
                            _id: 1,
                            username: 1,
                            displayName: 1,
                            avatarUrl: 1,
                            lastActiveAt: 1,
                            aboutMe: 1,
                        },
                    }
                ],
                as: "participants",
            },
        },
        {
            $lookup: {
                from: "messages",
                let: { chatId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: ["$directChat", "$$chatId"],
                            },
                        },
                    },
                    {
                        $lookup: {
                            from: "readReceipts",
                            let: { msgId: "$_id" },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $and: [
                                                {
                                                    $eq: ["$messageId", "$$msgId"],
                                                    $eq: ["$userId", userId],
                                                },
                                            ]
                                        }
                                    }
                                }
                            ],
                            as: "readReceipts",
                        },
                    },
                    {
                        $count: "count",
                    }
                ],
                as: "unreadMessages"
            },
        },
        {
            $addFields: {
                lastMessage: "$lastMessageArr",
                unreadCount: {
                    $ifNull: [
                        { $arrayElemAt: ["$unreadMessages.count", 0] },
                        0
                    ],
                },
            }
        },
        {
            $project: {
                unreadMessages: 0,
                lastMessageArr: 0
            }
        },
        {
            $sort: {
                "lastMessage.sentAt": -1,
            },
        },
    ];


    const recentChats = await DirectChat.aggregate(pipeline);



    // const lastMessage = new Map();
    // directChatIds.map((chatId) => {
    //     lastMessage.set(chatId.toString(), null);
    // });
    // recentChats.map((chat) => {
    //     lastMessage.set(chat._id.toString(), {
    //         ...chat.lastMessage,
    //         user: otherUser.get(chat._id.toString()),
    //     });
    // });

    return res.status(200)
        .json(new ApiResponse(200, recentChats, "Recent chats fetched successfully",));
});

export {
    createDirectChat,
    getUserDirectChats,
    getRecentChats,
}