import connectDB from "../src/db/index.js"
import mongoose from "mongoose";
import { generateUsers } from "./users.seed.js";
import { generateDirectChats } from "./directChat.seed.js";
import { generateMessages } from "./message.seed.js";
import { generateGroupMemberShip, generateGroups } from "./groups.seed.js";


const runSeed = async () => {
    try {
        await connectDB();

        console.log("Deleting Old Data...");
        await mongoose.connection.db.dropDatabase();

        console.log("Seeding users...");
        const users = await generateUsers(20);
        console.log("Users seeded successfully!");

        console.log("Seeding Direct Chats...");
        const directChats = await generateDirectChats(users, 200);
        console.log("Direct Chats seeded successfully!");

        console.log("Seeding Messages...");
        const messages = await generateMessages(directChats, 1000000);
        console.log("Messages seeded successfully!");

        console.log("Seeding Groups...");
        const groups = await generateGroups(users, 10);
        console.log("Groups seeded successfully!");

        console.log("Seeding Group Memberships...");
        for (const group of groups) {
            const randomUsersCount = Math.floor(Math.random() * 5) + 1;
            console.log("randomUsersCount: ", randomUsersCount);

            await generateGroupMemberShip(users, group._id, randomUsersCount);
        }
        console.log("Group Memberships seeded successfully!");

        process.exit();

    } catch (error) {
        console.log("Error seeding database:", error);
        process.exit(1);
    }
}

runSeed();