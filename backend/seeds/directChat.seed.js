import mongoose from "mongoose";
import { DirectChat } from "../src/models/directChat.model.js";
import { Message } from "../src/models/message.model.js";
import { getTwoRandomUsers } from "./utils.js";


const generateDirectChats = async (users, count = 10) => {

    const chats = [];

    const directChatUsers = new Set();

    for (let i = 0; i < count; i++) {
        const [user1, user2] = getTwoRandomUsers(users);

        const participants = [user1._id, user2._id].map(id => id.toString()).sort();
        console.log("participants: ", participants);

        const key = participants.join("_");

        if (directChatUsers.has(key)) {
            console.log("continue");
            i--;
            continue;
        }

        directChatUsers.add(key);

        chats.push({
            participantsKey: key,
            participants: participants.map(id => new mongoose.Types.ObjectId(id)),
            chatCreatedBy: user1._id,
            lastMessageId: null,
            unreadCount: 0,
        })
    }

    return await DirectChat.create(chats);
}

const updateDirectChatsLastMessage = async (chats) => {
    const targetChats = chats && chats.length > 0 ? chats : await DirectChat.find({}, { _id: 1 });

    const BATCH_SIZE = 100;
    let updatedTotal = 0;

    for (let i = 0; i < targetChats.length; i += BATCH_SIZE) {
        const chunk = targetChats.slice(i, i + BATCH_SIZE);

        const chunkOps = await Promise.all(
            chunk.map(async (chat) => {
                const lastMessage = await Message.findOne(
                    { directChat: chat._id, chatType: "direct" },
                    { _id: 1, sentAt: 1 }
                ).sort({ sentAt: -1 });

                if (lastMessage) {
                    const unreadCount = Math.floor(Math.random() * 5); // random realistic unread count (0-4)
                    return {
                        updateOne: {
                            filter: { _id: chat._id },
                            update: {
                                $set: {
                                    lastMessageId: lastMessage._id,
                                    unreadCount,
                                    updatedAt: lastMessage.sentAt,
                                }
                            }
                        }
                    };
                }
                return null;
            })
        );

        const validOps = chunkOps.filter(Boolean);
        if (validOps.length > 0) {
            await DirectChat.bulkWrite(validOps);
            updatedTotal += validOps.length;
        }
    }

    console.log(`Updated ${updatedTotal} direct chats with lastMessageId and unreadCount.`);
};

export { generateDirectChats, updateDirectChatsLastMessage };