import { faker } from "@faker-js/faker";
import mongoose from "mongoose";
import { User } from "../src/models/user.model.js";
import { Group } from "../src/models/group.model.js";
import { GroupMembership } from "../src/models/groupMembership.model.js";
import { Message } from "../src/models/message.model.js";
import { getRandomItem } from "./utils.js";

const generateGroups = async (count = 10) => {
    const BATCH_SIZE = 500;
    let insertedCount = 0;

    // Ensure a default group exists for test users if test1 & test2 exist
    const testUsers = await User.find({ username: { $in: ["test1", "test2"] } }, { _id: 1, username: 1 }).lean();
    if (testUsers.length >= 2) {
        try {
            await Group.collection.insertOne({
                _id: new mongoose.Types.ObjectId(),
                name: "General Group",
                description: "Default group for test users",
                lastMessageId: null,
                isBanned: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            insertedCount++;
        } catch {
            // ignore if already exists
        }
    }

    while (insertedCount < count) {
        const currentBatchSize = Math.min(BATCH_SIZE, count - insertedCount);
        const batch = [];

        for (let i = 0; i < currentBatchSize; i++) {
            batch.push({
                name: faker.lorem.words(2),
                description: faker.lorem.sentence(),
                lastMessageId: null,
                isBanned: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        }

        await Group.collection.insertMany(batch, { ordered: false });
        insertedCount += currentBatchSize;
    }

    return insertedCount;
};

const generateGroupMemberships = async () => {
    const userPool = await User.find({}, { _id: 1 }).limit(10000).lean();
    const groups = await Group.find({}, { _id: 1, name: 1 }).lean();

    if (userPool.length === 0 || groups.length === 0) return;

    const allMemberships = [];

    // Ensure test1 & test2 are added to the "General Group" if it exists
    const generalGroup = groups.find(g => g.name === "General Group");
    const testUsers = await User.find({ username: { $in: ["test1", "test2"] } }, { _id: 1, username: 1 }).lean();
    const test1 = testUsers.find(u => u.username === "test1");
    const test2 = testUsers.find(u => u.username === "test2");

    if (generalGroup && test1 && test2) {
        allMemberships.push({
            groupId: generalGroup._id,
            userId: test1._id,
            isAdmin: true,
            unreadCount: 0,
            joinedAt: new Date(),
            invitedBy: null,
            isRemoved: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        allMemberships.push({
            groupId: generalGroup._id,
            userId: test2._id,
            isAdmin: false,
            unreadCount: 0,
            joinedAt: new Date(),
            invitedBy: test1._id,
            isRemoved: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }

    for (const group of groups) {
        if (generalGroup && group._id.toString() === generalGroup._id.toString()) continue;

        const memberCount = Math.floor(Math.random() * 5) + 2;
        const usedUsers = new Set();
        let adminUser = null;

        for (let i = 0; i < memberCount; i++) {
            const user = getRandomItem(userPool);
            const userIdStr = user._id.toString();

            if (usedUsers.has(userIdStr)) continue;
            usedUsers.add(userIdStr);

            const isAdmin = i === 0;
            if (isAdmin) {
                adminUser = user;
            }

            allMemberships.push({
                groupId: group._id,
                userId: user._id,
                isAdmin: isAdmin,
                unreadCount: 0,
                joinedAt: new Date(),
                invitedBy: isAdmin ? null : adminUser?._id || null,
                isRemoved: false,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        }
    }

    if (allMemberships.length > 0) {
        // Insert in chunks of 5000
        for (let i = 0; i < allMemberships.length; i += 5000) {
            const chunk = allMemberships.slice(i, i + 5000);
            await GroupMembership.collection.insertMany(chunk, { ordered: false });
        }
    }
};

const updateGroupsLastMessage = async () => {
    console.log("Aggregating latest messages and streaming updates to groups...");
    const BATCH_SIZE = 2000;
    let ops = [];
    let updatedTotal = 0;

    const cursor = Message.aggregate([
        { $match: { chatType: "group", groupId: { $ne: null }, isDeleted: { $ne: true } } },
        { $sort: { sentAt: -1 } },
        {
            $group: {
                _id: "$groupId",
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
                        updatedAt: doc.lastSentAt,
                    }
                }
            }
        });

        if (ops.length >= BATCH_SIZE) {
            await Group.bulkWrite(ops);
            updatedTotal += ops.length;
            ops = [];
            console.log(`Updated ${updatedTotal.toLocaleString()} groups with lastMessageId...`);
        }
    }

    if (ops.length > 0) {
        await Group.bulkWrite(ops);
        updatedTotal += ops.length;
    }

    console.log(`Finished updating ${updatedTotal.toLocaleString()} groups with lastMessageId.`);
};

export {
    generateGroups,
    generateGroupMemberships,
    updateGroupsLastMessage,
};
