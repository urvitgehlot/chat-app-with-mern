import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { User } from '../src/models/user.model.js';

const generateUsers = async (count = 1000) => {
    const BATCH_SIZE = 5000;
    const CONCURRENCY = 6;

    console.log(`Pre-hashing passwords for seeding...`);
    const defaultPassword = process.env.USER_PASS || "Password@123";
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const testUser1Pass = process.env.USER1_PASS ? await bcrypt.hash(process.env.USER1_PASS, 10) : hashedPassword;
    const testUser2Pass = process.env.USER2_PASS ? await bcrypt.hash(process.env.USER2_PASS, 10) : hashedPassword;

    const sampleAvatars = Array.from({ length: 50 }, () => faker.image.avatar());

    let insertedCount = 0;

    // Always include test accounts first
    const testUsers = [
        {
            _id: new mongoose.Types.ObjectId(),
            username: "test1",
            displayName: "Test User 1",
            email: process.env.USER1_EMAIL || "test1@example.com",
            password: testUser1Pass,
            avatarUrl: sampleAvatars[0],
            aboutMe: "Just a test user",
            lastActiveAt: new Date(),
            isDeleted: false,
            isBanned: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            _id: new mongoose.Types.ObjectId(),
            username: "test2",
            displayName: "Test User 2",
            email: process.env.USER2_EMAIL || "test2@example.com",
            password: testUser2Pass,
            avatarUrl: sampleAvatars[1],
            aboutMe: "Just a test user",
            lastActiveAt: new Date(),
            isDeleted: false,
            isBanned: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        }
    ];

    await User.collection.insertMany(testUsers, { ordered: false });
    insertedCount += testUsers.length;

    while (insertedCount < count) {
        const promises = [];

        for (let c = 0; c < CONCURRENCY && insertedCount < count; c++) {
            const currentBatchSize = Math.min(BATCH_SIZE, count - insertedCount);
            const batch = new Array(currentBatchSize);

            for (let i = 0; i < currentBatchSize; i++) {
                const id = new mongoose.Types.ObjectId();
                const suffix = id.toString().slice(-6);
                batch[i] = {
                    _id: id,
                    username: `${faker.internet.username()}_${suffix}`,
                    displayName: faker.person.fullName(),
                    email: `${suffix}_${faker.internet.email()}`,
                    password: hashedPassword,
                    avatarUrl: sampleAvatars[i % sampleAvatars.length],
                    aboutMe: faker.person.bio(),
                    lastActiveAt: faker.date.recent({ days: 7 }),
                    isDeleted: false,
                    isBanned: false,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
            }

            promises.push(User.collection.insertMany(batch, { ordered: false }));
            insertedCount += currentBatchSize;
        }

        await Promise.all(promises);
        console.log(`Inserted ${insertedCount.toLocaleString()} / ${count.toLocaleString()} users...`);
    }

    return insertedCount;
};

export { generateUsers };