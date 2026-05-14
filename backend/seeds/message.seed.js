import { faker } from "@faker-js/faker";
import { Message } from "../src/models/message.model.js";
import { getRandomItem } from "./utils.js";


const generateMessages = async (chats, count = 10) => {
    const messages = [];

    for (let i = 0; i < count; i++) {
        const chat = getRandomItem(chats);
        const sender = getRandomItem(chat.participants);

        messages.push({
            chatType: 'direct',
            directChat: chat._id,
            senderId: sender._id,
            content: faker.lorem.sentence(),
            sentAt: faker.date.between({
                from: new Date('2026-01-01'),
                to: new Date(),
            }),
        })
    }

    return await Message.insertMany(messages);
}

export { generateMessages };