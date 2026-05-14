import mongoose from "mongoose";
import { DirectChat } from "../src/models/directChat.model.js";
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


        // if (directChatUsers.includes({ user1: user1._id, user2: user2._id }) || directChatUsers.includes({ user1: user2._id, user2: user1._id })) {
        //     console.log("continue");
        //     i--;
        //     continue;
        // }

        // directChatUsers.push({ user1: user1._id, user2: user2._id });
        directChatUsers.add(key);

        chats.push({
            participantsKey: key,
            participants: participants.map(id => new mongoose.Types.ObjectId(id)),
            chatCreatedBy: user1._id,
        })
    }

    return await DirectChat.create(chats);
}


export { generateDirectChats };