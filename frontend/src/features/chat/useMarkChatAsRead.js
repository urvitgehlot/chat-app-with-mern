import { useEffect, useMemo, useRef, useState } from "react";
import { createChatKey } from "../../utils/chatKey";

const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

/**
 * Automatically advances the authenticated user's ConversationReadState cursor
 * to the latest received message in the active chat whenever the tab is visible.
 */
export function useMarkChatAsRead({
    chatType,
    chatId,
    messageIds,
    messageEntities,
    currentUserId,
    existingChat,
    markMessageAsRead,
}) {
    const [isTabActive, setIsTabActive] = useState(
        () => typeof document === "undefined" || document.visibilityState === "visible"
    );

    const lastMarkedRef = useRef({
        chatKey: null,
        messageId: null,
        sentAtMs: -1,
    });

    const chatKey = useMemo(
        () => (chatType && chatId ? createChatKey(chatType, chatId) : null),
        [chatType, chatId]
    );

    useEffect(() => {
        lastMarkedRef.current = {
            chatKey,
            messageId: null,
            sentAtMs: -1,
        };
    }, [chatKey]);

    useEffect(() => {
        const handleVisibilityOrFocus = () => {
            setIsTabActive(document.visibilityState === "visible");
        };

        document.addEventListener("visibilitychange", handleVisibilityOrFocus);
        window.addEventListener("focus", handleVisibilityOrFocus);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
            window.removeEventListener("focus", handleVisibilityOrFocus);
        };
    }, []);

    const latestReceivedMessage = useMemo(() => {
        if (!currentUserId || !Array.isArray(messageIds) || messageIds.length === 0) {
            return null;
        }

        let latest = null;
        let latestTime = -1;

        for (const msgId of messageIds) {
            const msg = messageEntities?.[msgId];
            if (!msg?._id || !OBJECT_ID_REGEX.test(msg._id)) continue;

            const senderIdStr = typeof msg.senderId === "object" ? msg.senderId?._id : msg.senderId;
            if (!senderIdStr || senderIdStr === currentUserId) continue;

            const msgTime = new Date(msg.sentAt || msg.createdAt || 0).getTime();
            if (msgTime >= latestTime) {
                latestTime = msgTime;
                latest = msg;
            }
        }

        return latest;
    }, [messageIds, messageEntities, currentUserId]);

    useEffect(() => {
        if (!isTabActive || !chatType || !chatId || !latestReceivedMessage) {
            return;
        }

        const msgId = latestReceivedMessage._id;
        const msgSentAtMs = new Date(
            latestReceivedMessage.sentAt || latestReceivedMessage.createdAt || 0
        ).getTime();

        if (lastMarkedRef.current.chatKey === chatKey) {
            if (
                lastMarkedRef.current.messageId === msgId ||
                msgSentAtMs < lastMarkedRef.current.sentAtMs
            ) {
                return;
            }
        }

        const storedLastReadId = existingChat?.myLastReadMessageId;
        const storedLastReadSentAtMs = existingChat?.myLastReadSentAt
            ? new Date(existingChat.myLastReadSentAt).getTime()
            : -1;

        if (
            latestReceivedMessage.isRead ||
            storedLastReadId === msgId ||
            (storedLastReadSentAtMs !== -1 && msgSentAtMs < storedLastReadSentAtMs)
        ) {
            return;
        }

        lastMarkedRef.current = {
            chatKey,
            messageId: msgId,
            sentAtMs: msgSentAtMs,
        };

        markMessageAsRead({
            chatType,
            chatId,
            lastReadMessageId: msgId,
        }).catch(() => {
            if (lastMarkedRef.current.messageId === msgId) {
                lastMarkedRef.current.messageId = null;
                lastMarkedRef.current.sentAtMs = -1;
            }
        });
    }, [
        isTabActive,
        chatKey,
        chatType,
        chatId,
        latestReceivedMessage,
        existingChat?.myLastReadMessageId,
        existingChat?.myLastReadSentAt,
        markMessageAsRead,
    ]);
}

