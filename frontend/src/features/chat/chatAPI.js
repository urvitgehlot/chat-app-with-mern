import api from "../../services/api";

const directChatApi = '/direct-chat'

const messageApi = '/message'

export const getRecentChats = async () => api.get(`${directChatApi}/get-recent-chats`).then((res) => res.data);

export const getUserDirectChatMessages = async (data) => api.get(`${messageApi}/get-user-all-message`, { params: data }).then((res) => res.data);

export const getChatMessagesByPage = async (data) => api.get(`${messageApi}/get-messsages-by-pages`, { params: data }).then((res) => res.data);


export const sendMessage = async (message) => api.post(`${messageApi}/send-message`, message).then((res) => res.data);

export const createDirectChat = async (userId) => api.post(`${directChatApi}/create-direct-chat`, { userId }).then((res) => res.data);



