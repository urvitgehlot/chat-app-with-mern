/**
 * Schema and validation helper for Chat Messages in the frontend.
 * Enforces correct shape and type safety for messages sent/received.
 */

/**
 * Validates message data and returns a structured, plain message object.
 * Throws a detailed error if any required field is missing or invalid.
 *
 * @param {Object} data
 * @param {string} [data._id] - Optional message ID
 * @param {string} [data.tempId] - Optional temporary ID (UUID generated if not provided)
 * @param {string} data.content - The message text content
 * @param {'direct'|'group'} data.chatType - The type of the chat
 * @param {string} data.chatId - The ID of the chat
 * @param {string} data.senderId - The ID of the sender
 * @param {Object} [data.sentTo] - Required for direct chat. The recipient user object.
 * @param {boolean} [data.sendByMe=true] - Whether the message is sent by the current user
 * @param {string} [data.replyToMessageId=null] - Optional ID of the message being replied to
 * @param {Date} [data.sentAt] - The timestamp of the message
 * @param {Date} [data.updatedAt] - The timestamp of the message
 * @returns {Object} A validated, plain message object
 */
export const validateAndCreateMessage = ({
    _id,
    tempId,
    content,
    chatType,
    chatId,
    senderId,
    sentTo,
    sendByMe = true,
    replyToMessageId = null,
    sentAt,
    updatedAt,
} = {}) => {
    const errors = [];

    if (!tempId && !_id) {
        errors.push("'tempId' or '_id' is required")
    }

    // 1. Content validation
    if (content === undefined || content === null) {
        errors.push("'content' is required");
    } else if (typeof content !== "string" || content.trim() === "") {
        errors.push("'content' must be a non-empty string");
    }

    // 2. Chat type validation
    if (!chatType) {
        errors.push("'chatType' is required");
    } else if (chatType !== "direct" && chatType !== "group") {
        errors.push("'chatType' must be either 'direct' or 'group'");
    }

    // 3. Chat ID validation
    if (!chatId) {
        errors.push("'chatId' is required");
    } else if (typeof chatId !== "string" || chatId.trim() === "") {
        errors.push("'chatId' must be a non-empty string");
    }

    // 4. Sender ID validation
    if (!senderId) {
        errors.push("'senderId' is required");
    } else if (typeof senderId !== "string" || senderId.trim() === "") {
        errors.push("'senderId' must be a non-empty string");
    }

    // 5. Recipient validation for direct chats
    if (chatType === "direct" && !sentTo) {
        errors.push("'sentTo' is required when 'chatType' is 'direct'");
    }

    // // 6. Sent at validation
    // if (sentAt && !(sentAt instanceof Date)) {
    //     errors.push("'sentAt' must be a Date object");
    // }

    // // 7. Updated at validation
    // if (updatedAt && !(updatedAt instanceof Date)) {
    //     errors.push("'updatedAt' must be a Date object");
    // }

    // If there are any validation errors, throw a clear exception to catch them during dev
    if (errors.length > 0) {
        throw new Error(
            `[MessageSchema Validation Failed]:\n${errors.map(err => `  - ${err}`).join("\n")}`
        );
    }

    // Return a validated, plain object suitable for Redux state/actions
    return {
        tempId: tempId ? tempId : null,
        _id: _id ? _id : null,
        content: content.trim(),
        chatType,
        chatId,
        senderId,
        sendByMe,
        sentTo,
        replyToMessageId
    };
};
