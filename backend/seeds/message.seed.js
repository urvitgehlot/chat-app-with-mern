import { faker } from "@faker-js/faker";
import { Message } from "../src/models/message.model.js";
import { getRandomItem } from "./utils.js";

const generateMessages = async (chats, count = 10) => {
    const BATCH_SIZE = 50000; // 10k messages per bulk insert batch
    const now = Date.now();
    const start = new Date('2026-01-01').getTime();
    const timeSpan = now - start;

    // Pre-generate 100 lorem sentences so faker isn't executed millions of times
    const sampleSentences = Array.from({ length: 100 }, () => faker.lorem.sentence());

    let insertedCount = 0;

    while (insertedCount < count) {
        const currentBatchSize = Math.min(BATCH_SIZE, count - insertedCount);
        const batch = new Array(currentBatchSize);

        for (let i = 0; i < currentBatchSize; i++) {
            const chat = getRandomItem(chats);
            const sender = getRandomItem(chat.participants);

            batch[i] = {
                chatType: 'direct',
                directChat: chat._id,
                senderId: sender._id,
                content: getRandomItem(sampleSentences),
                sentAt: new Date(start + Math.random() * timeSpan),
            };
        }

        await Message.collection.insertMany(batch, {
            ordered: false,
        });

        insertedCount += currentBatchSize;
        if (insertedCount % 50000 === 0 || insertedCount === count) {
            console.log(`Inserted ${insertedCount.toLocaleString()} / ${count.toLocaleString()} messages...`);
        }
    }

    return insertedCount;
};

export { generateMessages };