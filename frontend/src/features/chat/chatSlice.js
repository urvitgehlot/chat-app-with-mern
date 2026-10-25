import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as chatAPI from "./chatAPI.js"
import { MESSAGE_STATUS } from "./chat.constants.js";
import { createChatKey } from "../../utils/chatKey.js";
import { chatStore } from "../../services/db/chatStore.js";
import { messageStore } from "../../services/db/messageStore.js";
import { userStore } from "../../services/db/userStore.js";
import { validateAndCreateMessage } from "./message.schema.js";


/*
const initialState = {
    chats: {
        id: ["direct:chat1", "group:chat5"],

        entities: {
            "direct:chat1": {
                _id: "chat1",
                participants: ["u1", "u2"],
                lastMessageId: "m1",
                unreadCount: 0,
                updatedAt: "...",
            },

            "group:chat5": {
                _id: "chat5",
                participants: ["u1", "u2", "u3", "u4"],
                groupId: "group5",
                lastMessageId: "m5",
                unreadCount: 0,
                updatedAt: "...",
            }
        },

        loading: false,

        error: null,
    },
    messages: {
        byChatKey: {
            "direct:chat1": {
                ids: ["m1", "m2", "m3", "m4"],
                typingUsers: [],
                hasMore: true,
                loading: false,
            },
            "group:chat5": {
                ids: ["temp1", "m5"],
                typingUsers: [],
                hasMore: true,
                loading: false,
            },
        },

        entities: {
            "m1": {
                _id: "m1",
                content: "Hi there",
                senderId: "u1",
                createdAt: "....",
                chatType: "direct",
                chatId: "chat1"
            },
            "m2": {
                _id: "m2",
                content: "Hello",
                senderId: "u2",
                createdAt: "....",
                chatType: "direct",
                chatId: "chat1"
            },
            "m3": {
                _id: "m3",
                content: "How are you?",
                senderId: "u1",
                createdAt: "....",
                chatType: "direct",
                chatId: "chat1"
            },
            "m4": {
                _id: "m4",
                content: "I'm fine",
                senderId: "u2",
                createdAt: "....",
                chatType: "direct",
                chatId: "chat1"
            },
            "m5": {
                tempId: "temp1",
                content: "What are you doing?",
                senderId: "u1",
                createdAt: "....",
                chatType: "group",
                chatId: "chat5"
            }
        }
    },
    users: {
        entities: {
            u1: {},
            u2: {},
        },
    },

    onlineUsers: {
        u1: true,
        u2: true,
    },

    queuedMessages: [],

    activeChatKey: "direct:chat1",
}
    */

const initialState = {
    chats: {
        id: [],

        entities: {},

        loading: false,

        error: null,
    },
    messages: {
        byChatKey: {},

        entities: {}
    },
    users: {
        entities: {},
    },

    onlineUsers: {},

    queuedMessages: [],

    activeChatKey: null,
}


export const sendMessageAsync = createAsyncThunk('chat/sendMessage', async (data, { rejectWithValue, getState }) => {
    try {
        console.log("data: ", data.message);
        const message = data.message;
        const chatKey = createChatKey(message.chatType, message.chatId);

        const validatedMessage = validateAndCreateMessage({
            _id: message.tempId,
            tempId: message.tempId,
            content: message.content,
            chatType: message.chatType,
            chatId: message.chatId,
            senderId: message.senderId,
            sentTo: message.sentTo,
            sendByMe: message.sendByMe,
            replyToMessageId: message.replyToMessageId,
            sentAt: message.sentAt,
            isRead: message.isRead,
            isDelivered: message.isDelivered,
        });

        const isChatExistsInDexie = await chatStore.getById(chatKey)

        if (!isChatExistsInDexie) {
            await chatStore.put({
                _id: chatKey,
                chatType: message.chatType,
                chatId: message.chatId,
                lastMessageId: validatedMessage.tempId,
                createdAt: validatedMessage.createdAt,
                updatedAt: validatedMessage.createdAt,
                unreadCount: message.sendByMe ? 0 : 1,
                // TODO: isko dekhna hai baad me isme gadbad hai
                participants: message.chatType == 'direct' ? [[message.senderId, message.sentTo._id]].toSorted() : null,
            });
        } else {
            await chatStore.updateLastMessage({
                chatKey: chatKey,
                lastMessageId: validatedMessage.tempId,
                unreadCount: 0,
            });
        }

        if (message.chatType == 'direct') {
            const isUserCached = await userStore.getById(message.sentTo._id);
            if (!isUserCached) {
                await userStore.put({
                    ...message.sentTo,
                })
            }
        }

        await messageStore.put(validatedMessage);

        if (getState().app.isOnline) {
            const response = await chatAPI.sendMessage({ ...validatedMessage, sentTo: validatedMessage.sentTo._id });
            console.log("response: ", response);
            return response;
        }
        else {
            // push message into queued messages to send it later

            return {
                validatedMessage,
                userOffline: true,
            };
        }
    } catch (error) {
        // TODO: remove if already stored in dexie
        console.error("failed to cache message", error);
        return rejectWithValue(error.response.data.message || "send message failed");
    }

});


export const receiveMessageAsync = createAsyncThunk("chat/receiveMessage", async (data, { rejectWithValue }) => {
    try {
        const chatKey = createChatKey(data.message.chatType, data.chat._id);

        const message = {
            _id: data.message._id,
            content: data.message.content,
            chatType: data.message.chatType,
            chatId: data.chat._id,
            senderId: data.message.senderId._id,
            sendByMe: false,
            replyToMessageId: data.message.replyToMessageId,
            sentAt: data.message.sentAt,
            isRead: false, // not implemented yet
        }

        if (data.isNewChat) {
            await chatStore.put({
                _id: chatKey,
                chatId: data.chat._id,
                chatType: data.message.chatType,
                lastMessageId: message._id,
                updatedAt: message.updatedAt,
                sentAt: message.sentAt,
                unreadCount: 1,
            });

            const otherUser = data.chat?.participants.filter(user => user._id !== data.currentUser._id)[0];
            const isUserCachedExists = await userStore.getById(otherUser?._id)

            if (!isUserCachedExists && otherUser) {
                await userStore.put(otherUser);
            }
        } else {
            await chatStore.updateLastMessage({
                chatKey: chatKey,
                lastMessageId: message._id,
                unreadCount: 1,
            });
        }

        await messageStore.put(message);

        return { message, isNewChat: data.isNewChat, chat: data.chat };
    } catch (error) {
        return rejectWithValue(error.response.data.message || "receive message failed");
    }
});

export const createDirectChatAsync = createAsyncThunk("chat/createDirectChat", async ({ userId }, { rejectWithValue }) => {
    try {
        const response = await chatAPI.createDirectChat(userId);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || "Failed to create direct chat");
    }
});

export const getRecentChatsAsync = createAsyncThunk('chat/getRecentChats', async (_, { rejectWithValue }) => {
    try {
        const response = await chatAPI.getRecentChats();
        return response;
    } catch (error) {
        return rejectWithValue(error.response.data.message || "get recent chats failed");
    }
}, {
    condition: (_, { getState }) => {
        const { chats } = getState().chat;
        console.log('Chats inside getRecentChatAsync Condition: ', chats);
        if (chats?.loading) return false;
        return true;
    }
})

export const getUserDirectChatMessagesAsync = createAsyncThunk("chat/getUserDirectChatMessages", async (data, { rejectWithValue, getState }) => {
    try {
        const response = await chatAPI.getUserDirectChatMessages(data);
        const loggedInUserId = getState().auth.userData._id;

        const messages = response.data.messages;
        if (messages?.length > 0) {
            messageStore.bulkPut(
                messages.map((msg) => ({
                    ...msg,
                    chatKey: createChatKey("direct", msg.directChat),
                    chatType: "direct",
                    sendByMe: msg.senderId === loggedInUserId,
                    status: "sent",
                }))
            ).catch(err => console.error("Dexie Messages bulkPut error: ", err));
        }

        console.log("Logged In User: ", loggedInUserId);
        return { ...response, loggedInUserId };
    } catch (error) {
        return rejectWithValue(error.response.data.message || "get user direct chat messages failed");
    }
});

export const getChatMessagesByPageAsync = createAsyncThunk("chat/getChatMessagesByPage", async (data, { rejectWithValue, getState }) => {
    try {
        const response = await chatAPI.getChatMessagesByPage(data);
        const loggedInUserId = getState().auth.userData._id;
        console.log("Logged In User: ", loggedInUserId);

        return { ...response, loggedInUserId };
    } catch (error) {
        return rejectWithValue(error.response.data.message || "get user direct chat messages failed");
    }
});

export const loadCachedRecentChatsAsync = createAsyncThunk("chat/loadCachedRecentChats", async (_, { rejectWithValue }) => {
    try {
        const cachedChats = await chatStore.getRecentChat();
        return { chats: cachedChats };

    } catch (error) {
        return rejectWithValue(error.response.data.message || "load cached recent chats failed");
    }
});

export const loadCachedMessagesAsync = createAsyncThunk("chat/loadCachedMessages", async ({ chatId, chatType }, { rejectWithValue }) => {
    try {
        const chatKey = createChatKey(chatType, chatId);
        if (chatType === 'direct') {
            const cachedMessages = await messageStore.getByDirectChat(chatKey, 50);
            console.log("Cached Messages: ", cachedMessages);
            return { chatType, chatId, messages: cachedMessages };
        } else {
            // TODO: group is to be implemented
            return { chatType, chatId, messages: [] };
        }
    } catch (error) {
        return rejectWithValue(error.response.data.message || "load cached messages failed");
    }
});

export const putCachedMessageAsync = createAsyncThunk("chat/putCachedMessage", async (data, { rejectWithValue, getState }) => {
    try {
        const { tempId, message, chat, isNewChat } = data;
        const loggedInUserId = getState().auth.userData._id;

        const chatKey = createChatKey(message.chatType, chat._id);
        if (isNewChat) {
            chatStore.put({
                _id: chatKey,
                chatType: message.chatType,
                unreadCount: 1,
                lastMessageId: message._id,
            });
        } else {
            await chatStore.updateLastMessage({
                chatKey,
                lastMessageId: message._id,
                unreadCount: 0,
            });
        }

        await messageStore.put({
            tempId,
            _id: message._id,
            chatId: message.chatId,
            chatType: message.chatType,
            senderId: message.senderId,
            sendByMe: message.senderId == loggedInUserId,
            replyToMessageId: message.replyToMessageId,
            sentAt: message.sentAt,
            isRead: message.isRead,
            content: message.content,
            createdAt: message.createdAt,
        });

    } catch (error) {
        return rejectWithValue(error.response.data.message || "put cached message failed");
    }
});

const chatSlice = createSlice({
    name: "chat",
    initialState,
    reducers: {
        joinChat: (state, action) => {
            const chatKey = createChatKey(action.payload.chatType, action.payload.chatId);
            state.activeChatKey = chatKey;
            if (state.chats.entities[chatKey]) {
                state.chats.entities[chatKey].unreadCount = 0;
            }
        },
        markChatAsRead: (state, action) => {
            const chatKey = createChatKey(action.payload.chatType, action.payload.chatId);
            if (state.chats.entities[chatKey]) {
                state.chats.entities[chatKey].unreadCount = 0;
            }
        },
        closeChat: (state, action) => {
            state.activeChatKey = null;
        },
        setOnlineUsers: (state, action) => {
            const onlineUsers = action.payload.onlineUsers;

            onlineUsers.forEach(user => {
                // state.chats.entities[]

            });


            // state.onlineUsers = action.payload.onlineUsers;

        }
    },
    extraReducers: (builder) => {
        builder
            // .addCase(loadCachedRecentChatsAsync.pending, (state, action) => {
            //     state.chats.loading = true;
            // })
            .addCase(getRecentChatsAsync.pending, (state, action) => {
                state.chats.loading = true;
            })
            .addCase(getRecentChatsAsync.fulfilled, (state, action) => {


                for (const value of (action.payload?.data || [])) {
                    const chatKey = createChatKey("direct", value._id);

                    if (Array.isArray(value.participants)) {
                        for (const participant of value.participants) {
                            if (participant?._id && state.users.entities[participant._id] == null) {
                                state.users.entities[participant._id] = participant;
                            }
                        }
                    }

                    if (!state.chats.id.includes(chatKey)) {
                        state.chats.id.push(chatKey);
                    }

                    const lastMessage = value.lastMessageId && typeof value.lastMessageId === 'object'
                        ? value.lastMessageId
                        : null;
                    const lastMessageId = lastMessage ? lastMessage._id : (value.lastMessageId || null);

                    if (lastMessage) {
                        if (state.messages.byChatKey[chatKey] == null) {
                            state.messages.byChatKey[chatKey] = {
                                ids: [lastMessage._id],
                                typingUsers: [],
                                hasMore: true,
                                loading: false,
                                error: null,
                            };
                        } else if (!state.messages.byChatKey[chatKey].ids.includes(lastMessage._id)) {
                            state.messages.byChatKey[chatKey].ids.unshift(lastMessage._id);
                        }

                        state.messages.entities[lastMessage._id] = {
                            chatId: value._id,
                            chatType: "direct",
                            ...lastMessage,
                        };
                    }

                    state.chats.entities[chatKey] = {
                        chatType: "direct",
                        chatId: value._id,
                        lastMessageId: lastMessageId,
                        chatCreatedBy: value.chatCreatedBy,
                        participants: value.participants,
                        createdAt: value.createdAt,
                        updatedAt: value.updatedAt,
                        unreadCount: value.unreadCount || 0,
                    };
                }

                state.chats.loading = false;
                state.chats.error = null;
            })
            .addCase(getRecentChatsAsync.rejected, (state, action) => {
                state.chats.error = action.payload;
                state.chats.loading = false;
            })
            // createDirectChatAsync
            .addCase(createDirectChatAsync.fulfilled, (state, action) => {
                const directChat = action.payload;
                if (!directChat?._id) return;

                const chatKey = createChatKey("direct", directChat._id);
                if (Array.isArray(directChat.participants)) {
                    for (const participant of directChat.participants) {
                        if (participant?._id && state.users.entities[participant._id] == null) {
                            state.users.entities[participant._id] = participant;
                        }
                    }
                }

                if (!state.chats.id.includes(chatKey)) {
                    state.chats.id.unshift(chatKey);
                }

                if (!state.chats.entities[chatKey]) {
                    state.chats.entities[chatKey] = {
                        chatType: "direct",
                        chatId: directChat._id,
                        lastMessageId: directChat.lastMessageId?._id || directChat.lastMessageId || null,
                        chatCreatedBy: directChat.chatCreatedBy,
                        participants: directChat.participants,
                        createdAt: directChat.createdAt,
                        updatedAt: directChat.updatedAt,
                        unreadCount: directChat.unreadCount || 0,
                    };
                }
            })
            // getChatMessagesByPageAsync
            .addCase(getChatMessagesByPageAsync.pending, (state, action) => {
                const args = action.meta.arg;
                const chatKey = createChatKey(args.chatType, args.chatId);
                if (!state.messages.byChatKey[chatKey]) {
                    state.messages.byChatKey[chatKey] = {
                        ids: [],
                        typingUsers: [],
                        hasMore: true,
                        loading: true,
                        currentPage: 0,
                    };
                } else {
                    state.messages.byChatKey[chatKey].loading = true;
                }
            })
            .addCase(getChatMessagesByPageAsync.fulfilled, (state, action) => {
                const { data, loggedInUserId } = action.payload;
                const args = action.meta.arg;
                const chatKey = createChatKey(args.chatType, args.chatId);

                if (args.chatType === "direct") {
                    const otherUser = state.chats.entities[chatKey]?.participants?.find((participant) => participant._id !== loggedInUserId);

                    if (otherUser) {
                        state.users.entities[otherUser._id] = otherUser;
                    }

                    if (!state.messages.byChatKey[chatKey]) {
                        state.messages.byChatKey[chatKey] = {
                            ids: [],
                            typingUsers: [],
                            hasMore: true,
                            loading: false,
                            currentPage: 0,
                        };
                    }

                    state.messages.byChatKey[chatKey].loading = false;
                    const currentPage = Number(args.page) || 1;
                    state.messages.byChatKey[chatKey].currentPage = currentPage;

                    if (Array.isArray(data.messages) && data.messages.length > 0) {
                        data.messages.forEach(message => {
                            if (currentPage === 1 && state.chats.entities[chatKey]?.lastMessageId === message._id && state.messages.byChatKey[chatKey].ids.includes(message._id)) {
                                return;
                            }
                            if (!state.messages.byChatKey[chatKey].ids.includes(message._id)) {
                                state.messages.byChatKey[chatKey].ids.push(message._id);
                            }
                            state.messages.entities[message._id] = {
                                ...message,
                                sendByMe: message.senderId === loggedInUserId,
                            };
                        });
                    }

                    const limit = Number(args.limit) || 20;
                    const totalPages = data.totalPages ?? Math.ceil((data.total || 0) / limit);
                    const hasMore = Array.isArray(data.messages) && data.messages.length > 0 && currentPage < totalPages;
                    state.messages.byChatKey[chatKey].hasMore = hasMore;

                    if (currentPage === 1 && Array.isArray(data.messages) && data.messages.length > 0 && state.chats.entities[chatKey]) {
                        state.chats.entities[chatKey].lastMessageId = data.messages[0]._id;
                        state.chats.entities[chatKey].unreadCount = 0;
                    }

                    if (otherUser) {
                        state.currentChat = { user: { ...otherUser }, chatId: args.chatId, chatType: args.chatType };
                    }
                }
            })
            .addCase(getChatMessagesByPageAsync.rejected, (state, action) => {
                const args = action.meta.arg;
                const chatKey = createChatKey(args.chatType, args.chatId);
                if (state.messages.byChatKey[chatKey] != null) {
                    state.messages.byChatKey[chatKey].loading = false;
                    state.messages.byChatKey[chatKey].error = action.payload;
                } else {
                    state.messages.byChatKey[chatKey] = {
                        ids: [],
                        typingUsers: [],
                        hasMore: false,
                        loading: false,
                        error: action.payload,
                    };
                }
            })

            .addCase(sendMessageAsync.pending, (state, action) => {
                // steps
                // 1. create validated and plain message with tempId
                // 2. 
                // 3.

                console.log("idhar toh aaya")

                // const { message } = action.payload;
                const { message } = action.meta.arg;
                const chatKey = createChatKey(message.chatType, message.chatId);

                const validatedMessage = validateAndCreateMessage({
                    _id: message.tempId,
                    tempId: message.tempId,
                    content: message.content,
                    chatType: message.chatType,
                    chatId: message.chatId,
                    senderId: message.senderId,
                    sentTo: message.sentTo,
                    sendByMe: true,
                    replyToMessageId: message.replyToMessageId,
                    sentAt: Date.now(),
                    isRead: false,
                    isDelivered: false,
                })

                state.messages.byChatKey[chatKey].ids.unshift(validatedMessage._id);
                state.messages.entities[validatedMessage._id] = validatedMessage;

                state.chats.entities[chatKey].lastMessageId = validatedMessage._id;
                // state.chats.entities[chatKey].unreadCount = 0;
            })
            .addCase(sendMessageAsync.fulfilled, (state, action) => {
                const { tempId } = action.meta.arg;
                console.log(action);
                const payloadData = action.payload.data;
                const { message, directChat, group, attachments, isNewChat } = payloadData;
                let chatKey;
                let chatId;
                if (payloadData.directChat) {
                    chatKey = createChatKey(payloadData.message.chatType, payloadData.directChat._id);
                    chatId = payloadData.directChat._id;
                } else {
                    chatKey = createChatKey(payloadData.message.chatType, payloadData.group._id);
                    chatId = payloadData.group._id;
                }

                if (payloadData.message.chatType == 'direct') {

                    const sentTo = directChat.participants.find((participant) => participant._id !== message.senderId._id);

                    const validatedMessage = validateAndCreateMessage({
                        _id: message._id,
                        chatType: message.chatType,
                        content: message.content,
                        chatId: chatId,
                        senderId: message.senderId._id,
                        sentTo: sentTo,
                        sendByMe: true,
                        replyToMessageId: message.replyToMessageId,
                        sentAt: message.sentAt,
                        isRead: false,
                        isDelivered: true,
                    });

                    state.messages.entities[message._id] = validatedMessage;


                    const index = state.messages.byChatKey[chatKey].ids.indexOf(tempId);

                    if (index !== -1) {
                        state.messages.byChatKey[chatKey].ids[index] = message._id;
                    }

                    state.chats.entities[chatKey].lastMessageId = validatedMessage._id;
                    // TODO: unread count needs to be managed
                    // state.chats.entities[chatKey].unreadCount = message.unreadCount;

                } else {
                    const validatedMessage = validateAndCreateMessage({
                        _id: message._id,
                        chatType: message.chatType,
                        content: message.content,
                        chatId: chatId,
                        senderId: message.senderId._id,
                        sendByMe: true,
                        sentTo: message.sentTo,
                        replyToMessageId: message.replyToMessageId,
                        sentAt: message.sentAt,
                        isRead: false,
                        isDelivered: false,
                    });

                    state.messages.entities[validatedMessage._id] = validatedMessage;

                    const index = state.messages.byChatKey[chatKey].ids.indexOf(tempId);

                    if (index !== -1) {
                        state.messages.byChatKey[chatKey].ids[index] = validatedMessage._id;
                    }

                    state.chats.entities[chatKey].lastMessageId = validatedMessage._id;
                    // TODO: unread count needs to be managed
                    // state.chats.entities[chatKey].unreadCount = payloadData.group.unreadCount;
                }

                state.messages.entities[tempId] = undefined;
                delete state.messages.entities[tempId];
            })
            .addCase(sendMessageAsync.rejected, (state, action) => {

                console.error('rejected: ', action)
                const { tempId, chatType, chatId } = action.meta.arg || {};
                const chatKey = createChatKey(chatType, chatId);
                const errorMessage = action.payload || action.error?.message || "Failed to send message";

                if (state.messages.entities[tempId]) {
                    state.messages.entities[tempId].status = MESSAGE_STATUS.FAILED;
                    state.messages.entities[tempId].error = errorMessage;
                }

                if (state.messages.byChatKey[chatKey]) {
                    state.messages.byChatKey[chatKey].loading = false;
                    state.messages.byChatKey[chatKey].error = errorMessage;
                }
            })

            // receiveMessageAsync
            .addCase(receiveMessageAsync.fulfilled, (state, action) => {
                const { message, isNewChat, chat } = action.payload;
                const chatKey = createChatKey(message.chatType, message.chatId);
                console.log("Message received payload asd: ", action);

                if (isNewChat) {
                    const otherUser = chat?.participants.filter(user => user._id !== message.senderId)[0];
                    state.chats.id.unshift(chatKey);

                    state.chats.entities[chatKey] = {
                        ...chat,
                        chatId: chat._id,
                        chatType: message.chatType,
                        lastMessageId: message._id,
                        unreadCount: 1,
                        participants: chat.participants,
                    };

                    state.messages.byChatKey[chatKey].ids.unshift(message._id);
                    state.messages.entities[message._id] = message;
                } else {
                    state.chats.entities[chatKey].lastMessageId = message._id;
                    state.chats.entities[chatKey].unreadCount = 1;

                    state.messages.byChatKey[chatKey].ids.unshift(message._id);
                    state.messages.entities[message._id] = message;
                }
            })

            .addCase(loadCachedMessagesAsync.fulfilled, (state, action) => {
                const { messages } = action.payload;
                const chatKey = createChatKey(messages[0].chatType, messages[0].chatId);

                // if (state.messages.byChatKey[chatKey].loading && messages.length > 0) {
                //     state.messages.byChatKey[chatKey].ids.unshift(...messages.map(m => m._id));
                //     messages.forEach(message => {
                //         state.messages.entities[message._id] = message;
                //     });
                // }
            })
            .addCase(putCachedMessageAsync.fulfilled, (state, action) => {
                const payloadData = action.payload;
                const chatKey = createChatKey(payloadData.chatType, payloadData.chatId);

                const message = {
                    _id: payloadData.message._id,
                    content: payloadData.message.content,
                    chatType: payloadData.message.chatType,
                    chatId: payloadData.chat._id,
                    senderId: payloadData.message.senderId,
                    sendByMe: payloadData.message.senderId === payloadData.currentUser._id ? true : false,
                    replyToMessageId: payloadData.message.replyToMessageId,
                    sentAt: payloadData.message.sentAt,
                    isRead: false, // not implemented yet
                }
                if (payloadData.isNewChat) {

                    // await messageStore.put(message);

                    state.chats.id.unshift(chatKey);
                    state.chats.entities[chatKey] = {
                        ...payloadData.chat,
                        unreadCount: 1,
                        lastMessageId: message._id,
                    }

                    state.messages.byChatKey[chatKey] = {
                        ids: [message._id],
                        typingUsers: [],
                        hasMore: false,
                        loading: false,
                    }

                    state.messages.entities[message._id] = message;
                } else {
                    state.chats.id.unshift(chatKey);
                    state.chats.entities[chatKey].lastMessageId = message._id;
                    state.chats.entities[chatKey].unreadCount = (state.chats.entities[chatKey].unreadCount || 0) + 1;

                    state.messages.byChatKey[chatKey].ids.unshift(message._id);
                    state.messages.entities[message._id] = message;
                }

            })
    }
});

export const { addMessage, joinChat, markChatAsRead, closeChat, messageReceived } = chatSlice.actions;
export default chatSlice.reducer;