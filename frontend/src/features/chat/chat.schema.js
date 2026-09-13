/**
 * Schema and validation helper for Chat Messages in the frontend.
 * Enforces correct shape and type safety for messages sent/received.
 */

/**
 * Validates message data and returns a structured, plain message object.
 * Throws a detailed error if any required field is missing or invalid.
 *
 * @param {Object} data
 * @param {string} [data._id] - ID
 * @param {'direct'|'group'} data.chatType - The type of the chat
 * @param {string} data.chatId - The ID of the chat
 * @param {string} data.lastMessageId - The ID of the last message
 * @param {Array} data.participants - The array of participants in the chat
 * @param {number} data.unreadCount - The number of unread messages
 * @param {string} data.updatedAt - The timestamp of the last update
 * @returns {Object} A validated, plain message object
 */
export const validateAndCreateChat = ({
    _id,
    chatType,
    chatId,
    participants,
    unreadCount,
    updatedAt,
} = {}) => {
    const errors = [];

    if (!_id) {
        errors.push("'_id' is required")
    }

    if (!chatType) {
        errors.push("'chatType' is required");
    } else if (chatType !== "direct" && chatType !== "group") {
        errors.push("'chatType' must be either 'direct' or 'group'");
    }

    if (!chatId) {
        errors.push("'chatId' is required");
    } else if (typeof chatId !== "string" || chatId.trim() === "") {
        errors.push("'chatId' must be a non-empty string");
    }

    if (chatType === "direct" && !sentTo) {
        errors.push("'sentTo' is required when 'chatType' is 'direct'");
    }

    if (participants) {
        if (!Array.isArray(participants)) {
            errors.push("'participants' must be an array");
        }
    } else {
        errors.push("'participants' is required");
    }

    if (!unreadCount || typeof unreadCount !== 'number') {
        errors.push("'unreadCount' must be a number");
    }

    if (!updatedAt || !(updatedAt instanceof Date)) {
        errors.push("'updatedAt' must be a Date object");
    }
}

// If there are any validation errors, throw a clear exception to catch them during dev
if (errors.length > 0) {
    throw new Error(
        `[MessageSchema Validation Failed]:\n${errors.map(err => `  - ${err}`).join("\n")}`
    );
}

// Return a validated, plain object suitable for Redux state/actions
return {
    _id,
    chatType,
    chatId,
    lastMessageId,
    participants,
    unreadCount,
    updatedAt
};
