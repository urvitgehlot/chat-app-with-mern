import db from "./db";

export const queuedMessageStore = {
    async put(message) {
        return db.queuedMessages.put(message);
    },

    async bulkPut(messages) {
        return db.queuedMessages.bulkPut(messages);
    },

    async getById(chatKey) {
        return db.queuedMessages
            .where("_id")
            .equals(chatKey)
            .first();
    },

    async getAll() {
        return db.queuedMessages
            .toArray();
    },

    async clearAll() {
        return db.queuedMessages.clear();
    }

}