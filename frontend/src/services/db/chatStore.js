import db from "./db";

export const chatStore = {
    async put(chat) {
        return db.chats.put(chat);
    },

    async bulkPut(chats) {
        return db.chats.bulkPut(chats);
    },

    async getById(chatKey) {
        return db.chats
            .where("_id")
            .equals(chatKey)
            .first();
    },

    async getRecentChat() {
        return db.chats
            .toArray();
    },

    async updateLastMessage({ chatKey, lastMessageId, unreadCount }) {
        return db.chats
            .where("_id")
            .equals(chatKey)
            .modify({ lastMessageId: lastMessageId, unreadCount, updatedAt: new Date() })
    },

    async clearAll() {
        return db.chats.clear();
    }

}