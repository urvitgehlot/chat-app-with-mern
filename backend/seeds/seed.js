import connectDB from "../src/db/index.js";
import mongoose from "mongoose";
import { generateUsers } from "./users.seed.js";
import { generateDirectChats, updateDirectChatsLastMessage } from "./directChat.seed.js";
import { generateMessages } from "./message.seed.js";
import { generateGroupMemberships, generateGroups, updateGroupsLastMessage } from "./groups.seed.js";

const runSeed = async () => {
    try {
        await connectDB();

        console.log("Deleting Old Data...");
        await mongoose.connection.db.dropDatabase();

        console.log("Syncing Indexes...");
        await mongoose.syncIndexes();

        const startTime = Date.now();

        // High scale targets
        const USER_COUNT = 100000;          // 100,000 users
        const DIRECT_CHAT_COUNT = 1000000;   // 1,000,000 chats
        const GROUP_COUNT = 2000;            // 2,000 groups
        const MESSAGE_COUNT = 10000000;      // 10,000,000 messages

        console.log(`\n--- Seeding ${USER_COUNT.toLocaleString()} Users ---`);
        await generateUsers(USER_COUNT);
        console.log("Users seeded successfully!");

        console.log(`\n--- Seeding ${DIRECT_CHAT_COUNT.toLocaleString()} Direct Chats ---`);
        await generateDirectChats(DIRECT_CHAT_COUNT);
        console.log("Direct Chats seeded successfully!");

        console.log(`\n--- Seeding ${GROUP_COUNT} Groups & Memberships ---`);
        await generateGroups(GROUP_COUNT);
        await generateGroupMemberships();
        console.log("Groups and Memberships seeded successfully!");

        console.log(`\n--- Seeding ${MESSAGE_COUNT.toLocaleString()} Messages ---`);
        await generateMessages(MESSAGE_COUNT);
        console.log("Messages seeded successfully!");

        console.log("\n--- Updating Direct Chats with lastMessageId and unreadCount ---");
        await updateDirectChatsLastMessage();
        console.log("Direct Chats updated successfully!");

        console.log("\n--- Updating Groups with lastMessageId ---");
        await updateGroupsLastMessage();
        console.log("Groups updated successfully!");

        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`\nSeeding completed successfully in ${elapsed}s!`);

        process.exit(0);

    } catch (error) {
        console.error("Error seeding database:", error);
        process.exit(1);
    }
};

runSeed();