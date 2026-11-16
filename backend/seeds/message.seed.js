import { faker } from "@faker-js/faker";
import mongoose from "mongoose";
import { DirectChat } from "../src/models/directChat.model.js";
import { GroupMembership } from "../src/models/groupMembership.model.js";
import { Message } from "../src/models/message.model.js";
import { getRandomItem } from "./utils.js";

const generateMessages = async (count = 1000) => {
    const BATCH_SIZE = 100000;
    const CONCURRENCY = 8;
    const now = Date.now();
    const start = new Date('2026-01-01').getTime();
    const timeSpan = now - start;

    console.log("Loading lightweight sample of direct chats from database...");
    const chatPool = await DirectChat.find({}, { _id: 1, participants: 1 }).limit(25000).lean();

    console.log("Loading lightweight sample of group memberships from database...");
    const groupMemberships = await GroupMembership.find({ isRemoved: false }, { groupId: 1, userId: 1 }).limit(50000).lean();

    const groupMap = new Map();
    for (const gm of groupMemberships) {
        const gId = gm.groupId.toString();
        if (!groupMap.has(gId)) {
            groupMap.set(gId, []);
        }
        groupMap.get(gId).push(gm.userId);
    }

    const groupPool = Array.from(groupMap.entries())
        .filter(([_, members]) => members.length > 0)
        .map(([groupId, members]) => ({ _id: new mongoose.Types.ObjectId(groupId), members }));

    if (chatPool.length === 0 && groupPool.length === 0) {
        throw new Error("Cannot seed messages: no direct chats or groups found in database.");
    }

    // Pre-generate lorem sentences so faker isn't executed millions of times
    const sampleSentences = Array.from({ length: 200 }, () => faker.lorem.sentence());

    let insertedCount = 0;

    while (insertedCount < count) {
        const promises = [];

        for (let c = 0; c < CONCURRENCY && insertedCount < count; c++) {
            const currentBatchSize = Math.min(BATCH_SIZE, count - insertedCount);
            const batch = new Array(currentBatchSize);

            for (let i = 0; i < currentBatchSize; i++) {
                const sentAt = new Date(start + Math.random() * timeSpan);
                const isGroup = groupPool.length > 0 && (chatPool.length === 0 || Math.random() < 0.2);

                if (isGroup) {
                    const group = getRandomItem(groupPool);
                    const sender = getRandomItem(group.members);

                    batch[i] = {
                        _id: new mongoose.Types.ObjectId(),
                        chatType: 'group',
                        groupId: group._id,
                        senderId: sender?._id || sender,
                        content: sampleSentences[i % sampleSentences.length],
                        isDeleted: false,
                        sentAt: sentAt,
                        createdAt: sentAt,
                        updatedAt: sentAt,
                    };
                } else {
                    const chat = getRandomItem(chatPool);
                    const sender = getRandomItem(chat.participants);

                    batch[i] = {
                        _id: new mongoose.Types.ObjectId(),
                        chatType: 'direct',
                        directChat: chat._id,
                        senderId: sender?._id || sender,
                        content: sampleSentences[i % sampleSentences.length],
                        isDeleted: false,
                        sentAt: sentAt,
                        createdAt: sentAt,
                        updatedAt: sentAt,
                    };
                }
            }

            promises.push(Message.collection.insertMany(batch, { ordered: false }));
            insertedCount += currentBatchSize;
        }

        await Promise.all(promises);
        console.log(`Inserted ${insertedCount.toLocaleString()} / ${count.toLocaleString()} messages...`);
    }

    return insertedCount;
};

export { generateMessages };
