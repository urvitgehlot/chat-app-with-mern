import { createMessage } from "../../services/message.service.js";


export function registerMessageHandlers(io, socket, onlineUsers, typingUsers, typingState) {

    socket.on("join_chat", ({ chatId, chatType }) => {
        if (chatType !== 'direct' && chatType !== 'group') {
            throw new Error("Invalid chat type");
        }
        socket.join(`${chatType}:${chatId}`);
        socket.data.chatType = chatType;
        socket.data.chatId = chatId;
    })

    socket.on("toggle_typing", async ({ startTyping = true }) => {
        try {
            const { chatType, chatId } = socket.data;
            const userId = socket.user?._id;

            if (!chatType || !chatId) {
                throw new Error("Invalid chat type or chat Id");
            }

            if (chatType === 'direct') {
                if (!typingState[chatType]) typingState[chatType] = {}
                if (!typingState[chatType][chatId]) {
                    typingState[chatType][chatId] = new Set();
                }
                if (startTyping) {
                    typingState[chatType][chatId].add(userId);
                } else {
                    typingState[chatType][chatId].delete(userId);
                    if (typingState[chatType][chatId]?.size === 0) {
                        delete typingState[chatType][chatId];
                    }
                }

                setTimeout(() => {
                    typingState[chatType][chatId]?.delete(userId);
                    if (typingState[chatType][chatId]?.size === 0) {
                        delete typingState[chatType][chatId];
                    }
                    console.log(`Typing State ${chatType}:${chatId} -> ${userId} deleted by Timeout`)
                }, 3000);
            } else {
                // TODO: group logic not written

            }
        } catch (error) {
            console.error("toggle_typing error: ", error.message);
            io.emit("toggle_typing_error", { error: error.message });
        }
    });

    socket.on("send_message", async ({ content, chatType, chatId, sentTo, replyToMessageId }) => {
        try {
            const senderId = socket.user?._id;

            if (chatType === 'direct' && !sentTo) {
                throw new Error("sentTo is required for direct chat");
            }

            if (chatType === 'group' && !chatId) {
                throw new Error("chatId is required for group chat");
            }

            if (chatType === 'direct') {
                const { message, directChat } = await createMessage({
                    senderId,
                    chatType,
                    chatId,
                    sentTo,
                    content,
                    replyToMessageId,
                });

                const receiverSocketId = onlineUsers[sentTo];
                if (receiverSocketId) {
                    io.to(`${chatType}:${directChat._id}`).emit("receive_message", {
                        message,
                        chatType,
                        chatId: directChat._id
                    });
                }

                io.emit("message_sent", {
                    message,
                    chatType,
                    chatId: directChat._id
                });

            } else {
                // TODO: group logic not written
            }

        } catch (error) {
            console.error("send_message error: ", error);
            io.emit("message_error", { error: error.message });
        }
    });
}