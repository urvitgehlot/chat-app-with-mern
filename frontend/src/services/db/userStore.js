import db from "./db";

export const userStore = {
    async put(user) {
        return db.users.put(user);
    },

    async bulkPut(users) {
        return db.users.bulkPut(users);
    },

    async getById(userId) {
        return db.users
            .where("_id")
            .equals(userId)
            .first();
    },

    async clearAll() {
        return db.users.clear();
    }

}