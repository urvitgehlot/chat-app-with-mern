import { useDispatch, useSelector } from "react-redux"
import {
    getRecentChatsAsync,
    getUserDirectChatMessagesAsync,
    joinChat as joinChatAction,
    // toggleTyping as toggleTypingAction,
    sendMessage as sendMessageAction
} from "./chatSlice";


export const useChat = () => {
    const dispatch = useDispatch();

    const { recentChats, recentChatsStatus, recentChatsError, currentChat, currentChatMessages, currentChatMessagesStatus, currentChatMessagesError } = useSelector((state) => state.chat);

    const getRecentChats = () => {
        dispatch(getRecentChatsAsync());
    }

    const getUserDirectChatMessages = (data) => {
        dispatch(getUserDirectChatMessagesAsync(data));
    }

    const joinChat = ({ chatId, chatType }) => {
        dispatch(joinChatAction({ chatId, chatType }));
    }

    // const toggleTyping = ({ startTyping = true }) => {
    //     dispatch(toggleTypingAction({ chatId, type }));
    // }

    const sendMessage = ({ content, chatType, chatId, sentTo, replyToMessageId }) => {
        dispatch(sendMessageAction({ content, chatType, chatId, sentTo, replyToMessageId }));
    }

    return {
        recentChats,
        recentChatsStatus,
        recentChatsError,
        currentChat,
        currentChatMessages,
        currentChatMessagesStatus,
        currentChatMessagesError,
        getRecentChats,
        getUserDirectChatMessages,
        joinChat,
        sendMessage,
    }
}