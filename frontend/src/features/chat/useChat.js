import { useDispatch, useSelector } from "react-redux";
import {
    getRecentChatsAsync,
    createDirectChatAsync,
    createGroupAsync,
    addUserToGroupAsync,
    getGroupAsync,
    updateGroupAsync,
    getUserDirectChatMessagesAsync,
    getChatMessagesByPageAsync,
    markMessageAsReadAsync,
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

    const markMessageAsRead = async ({ chatType, chatId, lastReadMessageId }) => {
        if (!chatType || !chatId || !lastReadMessageId) return null;
        return dispatch(markMessageAsReadAsync({ chatType, chatId, lastReadMessageId })).unwrap();
    }

    const closeChat = () => {
        dispatch(closeChatAction());
    }

    // const toggleTyping = ({ startTyping = true }) => {
    //     dispatch(toggleTypingAction({ chatId, type }));
    // }

    const createDirectChat = async (userId) => {
        const result = await dispatch(createDirectChatAsync({ userId })).unwrap();
        return result;
    }

    const createGroup = async (groupData) => {
        const result = await dispatch(createGroupAsync(groupData)).unwrap();
        return result;
    }

    const addUserToGroup = async ({ groupId, userId }) => {
        const result = await dispatch(addUserToGroupAsync({ groupId, userId })).unwrap();
        return result;
    }

    const getGroupDetails = async (groupId) => {
        const result = await dispatch(getGroupAsync(groupId)).unwrap();
        return result;
    }

    const updateGroup = async ({ groupId, formData }) => {
        const result = await dispatch(updateGroupAsync({ groupId, formData })).unwrap();
        return result;
    }

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
        createDirectChat,
        createGroup,
        addUserToGroup,
        getGroupDetails,
        updateGroup,
        getUserDirectChatMessages,
        getChatMessagesByPage,
        joinChat,
        markChatAsRead,
        markMessageAsRead,
        closeChat,
        sendMessage,
    }
}