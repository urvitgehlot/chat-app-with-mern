import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as chatAPI from "./chatAPI.js"
import { MESSAGE_STATUS } from "./chat.constants.js";
import { createChatKey } from "../../utils/chatKey.js";


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

export const messageSentAsync = createAsyncThunk("chat/messageSent", async (payloadData, { rejectWithValue, getState }) => {
    try {
        const state = getState();
        const user = state.auth.userData;

        return {
            currentUser: user,
            ...payloadData
        };
    } catch (error) {
        return rejectWithValue(error.response.data.message || "send message failed");
    }
})

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

// export const get

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
        messageReceived: (state, action) => {
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

        },
        sendMessage: (state, action) => {
            const payloadData = action.payload;
            const chatKey = createChatKey(payloadData.chatType, payloadData.chatId);
            console.log(payloadData)

            const message = {
                tempId: payloadData.tempId,
                content: payloadData.content,
                chatType: payloadData.chatType,
                chatId: payloadData.chatId,
                senderId: payloadData.senderId,
                replyToMessageId: payloadData.replyToMessageId,
                status: MESSAGE_STATUS.SENDING,
                sendByMe: true,
                createdAt: new Date().toISOString(),
                isRead: false,
                isDelivered: false,
            }

            if (state.chats.entities[chatKey] != null) {
                state.messages.byChatKey[chatKey].ids.unshift(payloadData.tempId);
                state.messages.entities[payloadData.tempId] = message;
                state.chats.entities[chatKey].lastMessageId = payloadData.tempId;

                state.queuedMessages.unshift(payloadData.tempId);
            }
        },
        // messageSent: (state, action) => {
        //     const payloadData = action.payload;
        //     const chatKey = createChatKey(payloadData.chatType, payloadData.chat._id);

        //     const message = {
        //         _id: payloadData.message._id,
        //         content: payloadData.message.content,
        //         chatType: payloadData.chatType,
        //         chatId: payloadData.chat._id,
        //         senderId: payloadData.message.senderId,
        //         sendByMe: true,
        //         replyToMessageId: payloadData.message.replyToMessageId,
        //         sentAt: payloadData.message.sentAt,
        //         isRead: false,
        //         isDelivered: false,
        //     }

        //     if (state.chats.entities[chatKey] != null) {
        //         state.chats.id.unshift(chatKey);
        //         state.chats.entities[chatKey].lastMessageId = message._id;

        //         state.messages.byChatKey[chatKey].ids = state.messages.byChatKey[chatKey].ids.filter(id => id !== payloadData.tempId);
        //         state.messages.byChatKey[chatKey].ids.unshift(message._id);


        //         state.messages.entities[message._id] = message;
        //         delete state.messages.entities[payloadData.tempId];

        //         state.queuedMessages = state.queuedMessages.filter(id => id !== payloadData.tempId);
        //     }

        // },
        // toggleTyping: (state, action) => {

        // },
        // getTypingUsers: (state, action) => {
        //     const { userId, chatId, type } = action.payload;
        //     if (type === 'direct') {
        //         if (!state.typingState[type]) state.typingState[type] = {};
        //         if (!state.typingState[type][chatId]) {
        //             state.typingState[type][chatId] = new Set();
        //         }
        //         state.typingState[type][chatId].add(userId);
        //     } else {
        //         // TODO: group logic not written
        //     }
        // }
    },
    extraReducers: (builder) => {
        builder
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

            // messageSentAsync
            .addCase(messageSentAsync.fulfilled, (state, action) => {
                const payloadData = action.payload;
                const chatKey = createChatKey(payloadData.message.chatType, payloadData.chat._id);
                const tempChatKey = createChatKey(payloadData.message.chatType, payloadData.tempId);

                const message = {
                    _id: payloadData.message._id,
                    content: payloadData.message.content,
                    chatType: payloadData.message.chatType,
                    chatId: payloadData.chat._id,
                    senderId: payloadData.message.senderId,
                    sendByMe: true,
                    replyToMessageId: payloadData.message.replyToMessageId,
                    sentAt: payloadData.message.sentAt,
                    isRead: false,
                    isDelivered: false,
                }

                if (state.chats.entities[chatKey] != null) {
                    state.chats.id.unshift(chatKey);
                    state.chats.entities[chatKey].lastMessageId = message._id;

                    state.messages.byChatKey[chatKey].ids = state.messages.byChatKey[chatKey].ids.filter(id => id !== payloadData.tempId);
                    state.messages.byChatKey[chatKey].ids.unshift(message._id);


                    state.messages.entities[message._id] = message;
                    delete state.messages.entities[payloadData.tempId];

                    state.queuedMessages = state.queuedMessages.filter(id => id !== payloadData.tempId);
                }
            })
    }
});

export const { addMessage, sendMessage, restoreAuth, joinChat, messageReceived } = chatSlice.actions;
export default chatSlice.reducer;