import { useDispatch, useSelector } from "react-redux";
import {
    getRecentChatsAsync,
    getUserDirectChatMessagesAsync,
    getChatMessagesByPageAsync,
    joinChat as joinChatAction,
    markChatAsRead as markChatAsAction,
    closeChat as closeChatAction,
    messageReceived as messageReceivedAction,
    sendMessageAsync
} from "./chatSlice";


export const useChat = () => {
    const dispatch = useDispatch();

    const { chats, messages, users, onlineUsers, queuedMessages, activeChatKey } = useSelector((state) => state.chat);

    const getRecentChats = () => {
        dispatch(getRecentChatsAsync());
    }

    const getUserDirectChatMessages = (data) => {
        dispatch(getUserDirectChatMessagesAsync(data));
    }

    const getChatMessagesByPage = (data) => {
        dispatch(getChatMessagesByPageAsync(data));
    }

    const joinChat = ({ chatId, chatType }) => {
        dispatch(joinChatAction({ chatId, chatType }));
    }

    const markChatAsRead = ({ chatId, chatType }) => {
        dispatch(markChatAsAction({ chatId, chatType }));
    }

    const closeChat = () => {
        dispatch(closeChatAction());
    }

    // const toggleTyping = ({ startTyping = true }) => {
    //     dispatch(toggleTypingAction({ chatId, type }));
    // }

    const sendMessage = (message) => {
        dispatch(sendMessageAsync(message));
    }

    return {
        chats,
        messages,
        users,
        onlineUsers,
        queuedMessages,
        activeChatKey,
        getRecentChats,
        getUserDirectChatMessages,
        getChatMessagesByPage,
        joinChat,
        markChatAsRead,
        closeChat,
        sendMessage,
    }
}