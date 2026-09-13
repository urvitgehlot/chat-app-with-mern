import Dexie from "dexie";
import db from "./db";
import { createChatKey } from "../../utils/chatKey";


export const messageStore = {
    async bulkPut({ messages = [] }) {
        return db.messages.bulkPut(messages);
    },

    async put(message) {
        return db.messages.put(message);
    },

    async getByTempId(tempId) {
        return db.messages.where("tempId").equals(tempId).first();
    },

    async confirmMessage(tempId, serverMessage) {
        return db.transaction('rw', db.messages, async () => {
            const existingMessage = await this.getByTempId(tempId);
            if (!existingMessage) {
                return;
            }
            await db.messages.put({ ...serverMessage, status: "sent" });
        })
    },

    async markFailed(tempId) {
        return db.messages.where("tempId").equals(tempId).modify({ status: "failed" });
    },

    async getByDirectChat(chatKey, { limit = 50, offset = 0 }) {
        return db.messages
            .where('[chatKey+createdAt]')
            .between(
                [chatKey, Dexie.minKey],
                [chatKey, Dexie.maxKey],
            )
            .reverse()
            .offset(offset)
            .limit(limit)
            .toArray();
    },

    async clearAll() {
        return db.messages.clear();
    }
}