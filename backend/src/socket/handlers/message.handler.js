import { createMessage } from "../../services/message.service.js";


export function registerMessageHandlers(io, socket, onlineUsers, typingUsers, typingState) {

    socket.on("join_chat", async ({ chatId, chatType }) => {
        if (chatType !== 'direct' && chatType !== 'group') {
            throw new Error("Invalid chat type");
        }
        await socket.join(`${chatType}:${chatId}`);
        // console.log("All sockets in room: ", (await io.in(`${chatType}:${chatId}`).fetchSockets()).map((s) => s.user));
        console.log("Joined room: ", `${chatType}:${chatId}`);
        socket.data.chatType = chatType;
        socket.data.chatId = chatId;
    })

    socket.on("start_typing", async ({ sentTo, chatType, chatId }) => {
        try {
            const chatKey = `${chatType}:${chatId}`;
            const userId = socket.user?._id;

            if (chatType === 'direct') {

                if (!typingState[chatType]) typingState[chatType] = {}
                if (!typingState[chatType][chatId]) {
                    typingState[chatType][chatId] = new Set();
                }
                typingState[chatType][chatId].add(userId);

                const receiverSocketId = onlineUsers[sentTo];
                if (receiverSocketId) {
                    io.to(chatKey).emit("get_typing_users", {
                        typing: Array.from(typingState[chatType][chatId])
                    })
                }

            } else if (chatType === "group") {
                // TODO: group logic not written
            } else {
                io.emit("start_typing_error", { error: "Invalid chat type" });
            }

        } catch (error) {
            console.error("start_typing error: ", error.message);
            io.emit("start_typing_error", { error: error.message });
        }

    });

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

    socket.on("send_message", async (data) => {
        try {
            console.log("send_message payload: ", data);
            const { tempId, content, chatType, chatId, sentTo, replyToMessageId } = data;
            const senderId = socket.user?._id;
            // console.log("All Payloads: ", tempId, content, chatType, chatId, sentTo, replyToMessageId)

            if (content === "") {
                throw new Error("Content cannot be empty");
            }
            if (!tempId) {
                throw new Error("TempId is required");
            }

            if (chatType === 'direct' && !sentTo?._id) {
                throw new Error("sentTo is required for direct chat");
            }

            if (chatType === 'group' && !chatId) {
                throw new Error("chatId is required for group chat");
            }

            if (chatType === 'direct') {
                const { message, directChat, isNewChat } = await createMessage({
                    senderId,
                    chatType,
                    chatId,
                    sentTo: sentTo._id,
                    content,
                    replyToMessageId,
                });

                const receiverSocketId = onlineUsers[sentTo._id];
                if (receiverSocketId) {
                    // io.to(`${chatType}:${directChat._id}`).emit("receive_message", {
                    //     message,
                    //     chat: directChat,
                    //     isNewChat
                    // });
                    // socket.to(`${chatType}:${directChat._id}`).emit("receive_message", {
                    //     message,
                    //     chat: directChat,
                    //     isNewChat
                    // });
                    io.to(receiverSocketId).emit("receive_message", {
                        message,
                        chat: directChat,
                        isNewChat
                    });
                }

                socket.emit("message_sent", {
                    tempId,
                    message,
                    chat: directChat,
                    isNewChat
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