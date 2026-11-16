import mongoose from "mongoose";
import { User } from "../src/models/user.model.js";
import { DirectChat } from "../src/models/directChat.model.js";
import { Message } from "../src/models/message.model.js";
import { getTwoRandomUsers } from "./utils.js";

const generateDirectChats = async (count = 10) => {
    const BATCH_SIZE = 5000;
    const CONCURRENCY = 6;

    console.log("Loading lightweight sample of user IDs from database...");
    const userPool = await User.find({}, { _id: 1 }).limit(25000).lean();

    if (userPool.length < 2) {
        throw new Error("Cannot seed direct chats: at least 2 users are required in database.");
    }

    let insertedCount = 0;
    // Sliding set capped at 50k to prevent high memory usage and avoid V8 Set limit
    const recentKeys = new Set();

    // Ensure a chat exists between test1 and test2 if both exist
    const testUsers = await User.find({ username: { $in: ["test1", "test2"] } }, { _id: 1 }).lean();
    if (testUsers.length >= 2) {
        const p = [testUsers[0]._id.toString(), testUsers[1]._id.toString()].sort();
        const key = p.join("_");
        recentKeys.add(key);

        try {
            await DirectChat.collection.insertOne({
                _id: new mongoose.Types.ObjectId(),
                participantsKey: key,
                participants: p.map(id => new mongoose.Types.ObjectId(id)),
                chatCreatedBy: testUsers[0]._id,
                lastMessageId: null,
                unreadCount: 0,
                isBlocked: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            insertedCount++;
        } catch {
            // Ignore if already exists
        }
    }

    while (insertedCount < count) {
        const promises = [];

        for (let c = 0; c < CONCURRENCY && insertedCount < count; c++) {
            const currentBatchSize = Math.min(BATCH_SIZE, count - insertedCount);
            const batch = [];

            for (let i = 0; i < currentBatchSize; i++) {
                const [user1, user2] = getTwoRandomUsers(userPool);
                const participants = [user1._id.toString(), user2._id.toString()].sort();
                const key = participants.join("_");

                if (recentKeys.has(key)) {
                    continue;
                }

                if (recentKeys.size > 50000) {
                    recentKeys.clear(); // Reset sliding window to keep memory < 5MB
                }
                recentKeys.add(key);

                batch.push({
                    _id: new mongoose.Types.ObjectId(),
                    participantsKey: key,
                    participants: participants.map(id => new mongoose.Types.ObjectId(id)),
                    chatCreatedBy: user1._id,
                    lastMessageId: null,
                    unreadCount: 0,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
            }

            if (batch.length > 0) {
                // ordered: false ignores duplicate key collisions if any occur
                promises.push(
                    DirectChat.collection.insertMany(batch, { ordered: false }).catch(() => {
                        // Ignore duplicate key errors in unordered bulk insert
                    })
                );
                insertedCount += batch.length;
            }
        }

        if (promises.length > 0) {
            await Promise.all(promises);
            console.log(`Inserted ${insertedCount.toLocaleString()} / ${count.toLocaleString()} direct chats...`);
        }
    }

    return insertedCount;
};

const updateDirectChatsLastMessage = async () => {
    console.log("Aggregating latest messages and streaming updates to direct chats...");
    const BATCH_SIZE = 2000;
    let ops = [];
    let updatedTotal = 0;

    // Use aggregation cursor to stream results without holding millions of records in memory
    const cursor = Message.aggregate([
        { $match: { chatType: "direct" } },
        { $sort: { sentAt: -1 } },
        {
            $group: {
                _id: "$directChat",
                lastMessageId: { $first: "$_id" },
                lastSentAt: { $first: "$sentAt" }
            }
        }
    ]).cursor({ batchSize: BATCH_SIZE });

    for await (const doc of cursor) {
        ops.push({
            updateOne: {
                filter: { _id: doc._id },
                update: {
                    $set: {
                        lastMessageId: doc.lastMessageId,
                        unreadCount: Math.floor(Math.random() * 5),
                        updatedAt: doc.lastSentAt,
                    }
                }
            }
        });

        if (ops.length >= BATCH_SIZE) {
            await DirectChat.bulkWrite(ops);
            updatedTotal += ops.length;
            ops = [];
            console.log(`Updated ${updatedTotal.toLocaleString()} direct chats with lastMessageId...`);
        }
    }

    if (ops.length > 0) {
        await DirectChat.bulkWrite(ops);
        updatedTotal += ops.length;
    }

    console.log(`Finished updating ${updatedTotal.toLocaleString()} direct chats with lastMessageId.`);
};

export { generateDirectChats, updateDirectChatsLastMessage };