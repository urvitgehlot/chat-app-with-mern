import api from "../../services/api";

const directChatApi = '/direct-chat'

const messageApi = '/message'

export const getRecentChats = async () => api.get(`${directChatApi}/get-recent-chats`).then((res) => res.data);

export const getUserDirectChatMessages = async (data) => api.get(`${messageApi}/get-user-all-message`, { params: data }).then((res) => res.data);

// const sendMessage = async (message) => axios.post("/api/chat/send-message", message);



