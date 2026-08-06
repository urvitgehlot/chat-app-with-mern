import { useDispatch, useSelector } from "react-redux"
import {
    getRecentChatsAsync,
    getUserDirectChatMessagesAsync,
    getChatMessagesByPageAsync,
    joinChat as joinChatAction,
    // toggleTyping as toggleTypingAction,
    sendMessage as sendMessageAction,
    messageReceived as messageReceivedAction
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

    // const toggleTyping = ({ startTyping = true }) => {
    //     dispatch(toggleTypingAction({ chatId, type }));
    // }

    const sendMessage = ({ tempId, content, chatType, chatId, sentTo, senderId, replyToMessageId }) => {
        dispatch(sendMessageAction({ tempId, content, chatType, chatId, sentTo, senderId, replyToMessageId }));
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
        sendMessage,
    }
}