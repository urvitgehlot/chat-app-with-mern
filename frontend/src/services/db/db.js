import Dexie from "dexie";

const db = new Dexie("ChatAppDB");


// Tables

/**
 * chats:
 *  - _id: unique
 *  - lastMessageId: string
 *  - unreadCount: number
 *  - updatedAt: date
 *  - 
 * messages:
 *  - _id: unique
 *  - chatId: string
 *  - chatType: ["direct", "group"]
 *  - content: string
 *  - senderId: string
 *  - sentAt: date
 *  - createdAt: date
 * 
 * users:
 *  - _id: unique
 *  - username: string
 *  - displayName: string
 *  - avatarUrl: string
 * 
 * chatParticipants:
 *  - _id: unique
 *  - chatKey: string
 *  - userId: string
 *  - role: "admin" | "member"
 * 
 * queuedMessages:
 *  - tempId: unique
 *  - chatKey: string
 *  - createdAt: date
 *  - status: "pending" | "sent" | "failed"
 *  
 * 
 * 
 */

db.version(1).stores({
    chats: `
        _id,
        chatKey,
        type,
        updatedAt
    `,
    messages: `
        _id,
        [chatKey+createdAt],
        chatKey,
        senderId,
        createdAt,
        content,
        chatType,
        status,
        sendByMe,
        tempId     
    `,
    users: `
        _id
    `,
    chatParticipants: `
        [chatKey+userId],
        chatKey,
        userId
    `,
    queuedMessages: `
        tempId,
        chatKey,
        createdAt,
        status
    `,
});

export default db;
