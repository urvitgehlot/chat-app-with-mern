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

        loading: true,

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


export const sendMessageAsync = createAsyncThunk("chat/sendMessage", async (data, { rejectWithValue, getState }) => {
    try {
        const chatKey = createChatKey(data.chatType, data.chatId);

        const message = {
            _id: data.tempId,
            tempId: data.tempId,
            content: data.content,
            chatType: data.chatType,
            chatId: data.chatId,
            senderId: data.senderId,
            replyToMessageId: data.replyToMessageId,
            status: MESSAGE_STATUS.SENDING,
            sendByMe: data.sendByMe,
            sentTo: data.sentTo._id,
            createdAt: new Date().toISOString(),
            isRead: false,
            isDelivered: false,
        }

        const isChatExistsInDexie = await chatStore.getById(chatKey);
        if (!isChatExistsInDexie) {
            await chatStore.put({
                _id: chatKey,
                chatType: data.chatType,
                chatId: data.chatId,
                lastMessageId: message.tempId,
                updatedAt: message.createdAt,
                unreadCount: data.sendByMe ? 0 : 1,
            })
        } else {
            await chatStore.updateLastMessage({
                chatKey: chatKey,
                lastMessageId: message.tempId,
                unreadCount: 0,
            });
        }

        if (data.chatType == 'direct') {
            const isUserCached = await userStore.getById(data.sentTo._id);
            if (!isUserCached) {
                await userStore.put({
                    ...data.sentTo,
                })
            }
        }

        await messageStore.put(message);

        return {
            message
        };

    } catch (error) {
        console.error("failed to cache message", error);
        return rejectWithValue(error.response.data.message || "send message failed");
    }
});


export const messageSentAsync = createAsyncThunk("chat/messageSent", async (payloadData, { rejectWithValue, getState }) => {
    try {
        const user = getState().auth.userData;
        const { tempId, chat, isNewChat, message } = payloadData;

        if (tempId) {
            messageStore.confirmMessage(tempId, {
                _id: message._id,
                ...message,
                sendByMe: true,
                directChat: message.directChat || payloadData.chatId,
            }).catch(err => console.error("Dexie confirm error: ", err));
        }

        return {
            currentUser: user,
            tempId,
            ...payloadData
        };
    } catch (error) {
        return rejectWithValue(error.response.data.message || "send message failed");
    }
})

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
                lastMessage: message._id,
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

export const getRecentChatsAsync = createAsyncThunk('chat/getRecentChats', async (_, { rejectWithValue }) => {
    try {
        const response = await chatAPI.getRecentChats();
        return response;
    } catch (error) {
        return rejectWithValue(error.response.data.message || "get recent chats failed");
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

        if (isNewChat) {
            chatStore.put({
                _id: chat._id,
                chatType: "direct",
                unreadCount: 1,
                lastMessageId: message._id,
            });
        } else {
            await chatStore.updateLastMessage({
                chatId: chat._id,
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
            state.activeChatKey = createChatKey(action.payload.chatType, action.payload.chatId);
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


                for (const value of action.payload.data) {
                    if (value.lastMessage.chatType === "direct") {
                        const chatKey = createChatKey("direct", value._id);
                        if (state.users.entities[value.participants[0]._id] == null) {
                            state.users.entities[value.participants[0]._id] = value.participants[0];
                        }

                        if (state.users.entities[value.participants[1]._id] == null) {
                            state.users.entities[value.participants[1]._id] = value.participants[1];
                        }

                        if (state.chats.entities[chatKey] == null) {
                            state.chats.id.push(chatKey);
                        }

                        if (state.messages.byChatKey[chatKey] == null && value.lastMessage != null) {
                            state.messages.byChatKey[chatKey] = {
                                ids: [value.lastMessage._id],
                                typingUsers: [],
                                hasMore: true,
                                loading: false,
                                error: null,
                            }

                            state.messages.entities[value.lastMessage._id] = {
                                chatId: value._id,
                                ...value.lastMessage,
                            }
                        }

                        state.chats.entities[chatKey] = {
                            chatType: "direct",
                            chatId: value._id,
                            lastMessageId: value.lastMessage?._id,
                            chatCreatedBy: value.chatCreatedBy,
                            participants: value.participants,
                            createdAt: value.createdAt,
                            updatedAt: value.updatedAt,
                            unreadCount: value.unreadCount,
                        }
                    }

                }

                state.chats.loading = false;
                state.chats.error = null;
            })
            .addCase(getRecentChatsAsync.rejected, (state, action) => {
                state.chats.error = action.payload;
                state.chats.loading = false;
            })
            // getChatMessagesByPageAsync
            .addCase(getChatMessagesByPageAsync.pending, (state, action) => {
                const args = action.meta.arg;

                const chatKey = createChatKey(args.chatType, args.chatId);
                state.messages.byChatKey[chatKey].loading = true;
            })
            .addCase(getChatMessagesByPageAsync.fulfilled, (state, action) => {
                const { data, loggedInUserId } = action.payload;
                const args = action.meta.arg;

                const chatKey = createChatKey(args.chatType, args.chatId);

                if (args.chatType == "direct") {
                    var otherUser = null;

                    // if (state.chats.entities[chatKey] != null) {
                    otherUser = state.chats.entities[chatKey].participants.find((participant) => participant._id !== loggedInUserId);

                    // }
                    //  else {
                    //     state.chats.entities[chatKey] = {
                    //         chatType: "direct",
                    //         chatId: args.chatId,
                    //         participants: data.directChat.participants,
                    //         lastMessageId: null,
                    //         unreadCount: 0,
                    //     }
                    //     otherUser = state.chats.entities[chatKey].participants.find((participant) => participant._id !== loggedInUserId);

                    // }

                    state.users.entities[otherUser._id] = otherUser;

                    state.messages.byChatKey[chatKey].loading = false;
                    state.messages.byChatKey[chatKey].currentPage = args.page ?? 1;

                    data.messages.forEach(message => {
                        if (args.page == 1 && state.chats.entities[chatKey].lastMessageId == message._id) {
                            return;
                        }
                        if (state.messages.entities[message._id] == null) {
                            state.messages.byChatKey[chatKey].ids.push(message._id);
                            state.messages.entities[message._id] = {
                                ...message,
                                sendByMe: message.senderId === loggedInUserId,
                            }
                        }
                    });


                    if (data.total == (args.page ?? 1) * (args.limit ?? 10)) {
                        state.messages.byChatKey[chatKey].hasMore = false;
                    } else {
                        state.messages.byChatKey[chatKey].hasMore = true;
                    }

                    state.chats.entities[chatKey].lastMessageId = data.messages[0]._id;
                    state.chats.entities[chatKey].unreadCount = 0;

                    state.currentChat = { user: { ...otherUser }, chatId: args.chatId, chatType: args.chatType };

                } else {

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
                    }
                }
            })

            .addCase(sendMessageAsync.fulfilled, (state, action) => {
                const { message } = action.payload;
                const chatKey = createChatKey(message.chatType, message.chatId);

                console.log("Send Message tempId: ", message.tempId)

                if (!state.messages.byChatKey[chatKey]) {
                    state.messages.byChatKey[chatKey] = {
                        ids: [message.tempId],
                        typingUsers: [],
                        hasMore: true,
                        loading: false,
                        error: null,
                    }
                } else {
                    state.messages.byChatKey[chatKey].ids.unshift(message.tempId);
                }

                // if (!state.chats.entities[chatKey]) {
                //     state.chats.entities[chatKey] = {
                //         chatType: message.chatType,
                //         chatId: message.chatId,
                //         lastMessageId: message._id,
                //         // participants: 
                //         unreadCount: 0,
                //     }
                //     state.messages.byChatKey[chatKey] = {
                //         ids: [],
                //         typingUsers: [],
                //         hasMore: false,
                //         loading: false,
                //         error: null,
                //     }
                // } else {
                // state.chats.entities[chatKey].lastMessageId = message._id;
                // }

                // state.messages.byChatKey[chatKey].ids.unshift(message.tempId);
                state.messages.entities[message.tempId] = message;

                state.chats.entities[chatKey].lastMessageId = message.tempId;
                state.chats.entities[chatKey].unreadCount = 0;

                // state.queuedMessages = state.queuedMessages.filter(id => id !== message.tempId);
            })

            // messageSentAsync ( Message Sent Acknowledgement)
            .addCase(messageSentAsync.fulfilled, (state, action) => {
                const payloadData = action.payload;
                const chatKey = createChatKey(payloadData.message.chatType, payloadData.chat._id);
                console.log("Payload data of message sent ack: ", payloadData);

                const message = {
                    _id: payloadData.message._id,
                    content: payloadData.message.content,
                    chatType: payloadData.message.chatType,
                    chatId: payloadData.chat._id,
                    senderId: payloadData.message.senderId._id,
                    sendByMe: true,
                    replyToMessageId: payloadData.message.replyToMessageId,
                    sentAt: payloadData.message.sentAt,
                    isRead: false,
                    isDelivered: false,
                }

                if (state.chats.entities[chatKey]) {
                    console.log("message sent ack when chat is not present in redux store");
                    // state.chats.id.unshift(chatKey);
                    state.chats.entities[chatKey].lastMessageId = message._id;

                    console.log(`payload temp id: ${payloadData.tempId}`)
                    console.log(`message ids before filtering: ${state.messages.byChatKey[chatKey].ids}`)
                    // state.messages.byChatKey[chatKey].ids = state.messages.byChatKey[chatKey].ids.filter(id => id !== payloadData.tempId);
                    console.log(`message ids after filtering: ${state.messages.byChatKey[chatKey].ids}`)
                    state.messages.byChatKey[chatKey].ids.unshift(message._id);


                    state.messages.entities[message._id] = message;
                    // delete state.messages.entities[payloadData.tempId];

                    state.queuedMessages = state.queuedMessages.filter(id => id !== payloadData.tempId);
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

export const { addMessage, sendMessage, joinChat, messageReceived } = chatSlice.actions;
export default chatSlice.reducer;