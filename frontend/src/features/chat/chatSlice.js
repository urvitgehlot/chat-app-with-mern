import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as chatAPI from "./chatAPI.js"

const initialState = {
    messages: [],

    currentChat: null,
    currentChatMessages: [],
    currentChatMessagesStatus: "idle",
    currentChatMessagesError: null,

    sendMessageStatus: "idle",
    sendMessageError: null,

    recentChats: {},
    recentChatsStatus: "not-fetched",
    recentChatsError: null,
}

export const messageSentAckAsync = createAsyncThunk("chat/messageSentAck", async (payloadData, { rejectWithValue, getState }) => {
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

const chatSlice = createSlice({
    name: "chat",
    initialState,
    reducers: {
        messageReceived: (state, action) => {
            // state.currentChatMessages.push(action.payload);
        },
        // messageSent: (state, action) => {
        //     const payloadData = action.payload;
        //     console.log("Message: ", payloadData.message);

        //     const message = {
        //         _id: payloadData.message._id,
        //         content: payloadData.message.content,
        //         chatType: payloadData.message.chatType,
        //         chatId: payloadData.message.chatId,
        //         sentTo: payloadData.message.sentTo,
        //         sendByMe: payloadData.message.senderId === getState().auth.userData._id ? true : false,
        //         replyToMessageId: payloadData.message.replyToMessageId,
        //         createdAt: new Date().toISOString(),
        //         isRead: false,
        //         isDelivered: false,
        //     }

        //     if (payloadData.chatType === 'direct' && state.currentChat?._id === payloadData.chatId) {
        //         state.currentChatMessages.push()
        //     }
        // },
        restoreAuth: (state, action) => {

        },
        joinChat: (state, action) => {
            state.chatType = action.payload.chatType;
            state.chatId = action.payload.chatId;
        },
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
                state.recentChatsStatus = "pending";
            })
            .addCase(getRecentChatsAsync.fulfilled, (state, action) => {
                state.recentChats = action.payload.data;
                state.recentChatsStatus = "idle";
                state.recentChatsError = null;
                console.log("getRecentChatsAsync fulfilled: ", action.payload.data);
            })
            .addCase(getRecentChatsAsync.rejected, (state, action) => {
                state.recentChatsError = action.payload;
                state.recentChatsStatus = "idle";
            })
            // getUserDirectChatMessagesAsync
            .addCase(getUserDirectChatMessagesAsync.pending, (state, action) => {
                state.currentChatMessagesStatus = "pending";
            })
            .addCase(getUserDirectChatMessagesAsync.fulfilled, (state, action) => {
                const { data, loggedInUserId } = action.payload;
                state.currentChatMessages = data.messages;

                // Filter out the logged-in user to get the other participant
                const otherUser = data.directChat.participants.find(
                    (participant) => participant._id !== loggedInUserId
                );
                state.currentChat = { user: { ...otherUser }, chatId: data.directChat._id, chatType: "direct" } || null;

                state.currentChatMessagesStatus = "idle";
                state.currentChatMessagesError = null;
                console.log("getUserDirectChatMessagesAsync fulfilled: ", data);
                console.log("currentChat (other user): ", otherUser);
            })
            .addCase(getUserDirectChatMessagesAsync.rejected, (state, action) => {
                state.currentChatMessagesError = action.payload;
                state.currentChatMessagesStatus = "idle";
            })
            //messageSent (acknoledgement after sending message)
            .addCase(messageSentAckAsync.fulfilled, (state, action) => {
                const payloadData = action.payload;
                console.log("Message: ", payloadData.message);

                const message = {
                    _id: payloadData.message._id,
                    content: payloadData.message.content,
                    chatType: payloadData.message.chatType,
                    chatId: payloadData.message.chatType === 'direct' ? payloadData.message.directChat : payloadData.message.groupId,
                    senderId: payloadData.message.senderId,
                    sendByMe: payloadData.message.senderId === payloadData.currentUser._id ? true : false,
                    replyToMessageId: payloadData.message.replyToMessageId,
                    sentAt: payloadData.message.sentAt,
                    isRead: false,
                    isDelivered: false,
                }

                console.log("if se phele")
                console.log("ChatType: ", payloadData.message.chatType);
                if (payloadData.message.chatType === 'direct' && state.currentChat?.chatId === payloadData.message.directChat) {
                    state.currentChatMessages = [message, ...state.currentChatMessages]
                    console.log("sahi hai if bhi")
                }
            })
    }
});

export const { addMessage, sendMessage, restoreAuth, joinChat } = chatSlice.actions;
export default chatSlice.reducer;