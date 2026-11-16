/**
 * Determines whether a message is covered by (at or before) a user's read cursor.
 * Compares _id equality first, then sentAt, then createdAt, then lexicographic _id tie-breaker.
 */
export function isMessageCoveredByCursor(message, cursor) {
    if (!message || !cursor) return false;

    const msgId = message._id?.toString();
    const cursorId = cursor._id?.toString();
    if (msgId && cursorId && msgId === cursorId) return true;

    const msgSentAt = new Date(message.sentAt || message.createdAt || 0).getTime();
    const cursorSentAt = new Date(cursor.sentAt || cursor.createdAt || 0).getTime();

    if (cursorSentAt > msgSentAt) return true;
    if (cursorSentAt < msgSentAt) return false;

    const msgCreatedAt = new Date(message.createdAt || message.sentAt || 0).getTime();
    const cursorCreatedAt = new Date(cursor.createdAt || cursor.sentAt || 0).getTime();

    if (cursorCreatedAt > msgCreatedAt) return true;
    if (cursorCreatedAt < msgCreatedAt) return false;

    return Boolean(msgId && cursorId && cursorId >= msgId);
}

/**
 * Computes boolean isRead status for a message from the perspective of currentUserId.
 * - For messages sent by currentUserId: true if at least one other participant's cursor covers the message.
 * - For messages sent by others: true if currentUserId's own read cursor covers the message.
 */
export function getMessageReadStatus({ message, currentUserId, myReadCursor, otherReadCursors = [] }) {
    if (!message || !currentUserId) return false;

    const currentUserIdStr = currentUserId.toString();
    const senderIdStr =
        typeof message.senderId === "object" && message.senderId !== null
            ? message.senderId._id?.toString()
            : message.senderId?.toString();

    if (senderIdStr === currentUserIdStr) {
        return otherReadCursors.some((cursor) => isMessageCoveredByCursor(message, cursor));
    }

    return isMessageCoveredByCursor(message, myReadCursor);
}

