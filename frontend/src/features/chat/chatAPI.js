import api from "../../services/api";

const users = '/users'
const directChatApi = '/direct-chat'
const groupApi = '/group'
const messageApi = '/message'
const readReceiptApi = '/read-receipt'

export const getRecentChats = async () => api.get(`${users}/get-recent-chats`).then((res) => res.data);

export const getUserDirectChatMessages = async (data) => api.get(`${messageApi}/get-user-all-message`, { params: data }).then((res) => res.data);

export const getChatMessagesByPage = async (data) => api.get(`${messageApi}/get-messsages-by-pages`, { params: data }).then((res) => res.data);

export const sendMessage = async (message) => api.post(`${messageApi}/send-message`, message).then((res) => res.data);

export const createDirectChat = async (userId) => api.post(`${directChatApi}/create-direct-chat`, { userId }).then((res) => res.data);

export const createGroup = async (groupData) => api.post(`${groupApi}/create-group`, groupData).then((res) => res.data);

export const addUserToGroup = async ({ groupId, userId }) => api.post(`${groupApi}/add-user`, { groupId, userId }).then((res) => res.data);

export const getGroup = async (groupId) => api.get(`${groupApi}/${groupId}`).then((res) => res.data);

export const updateGroup = async (groupId, formData) =>
    api.patch(`${groupApi}/${groupId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
    }).then((res) => res.data);

export const getUserAllGroups = async () => api.get(`${groupApi}/get-user-groups`).then((res) => res.data);

export const markMessageAsRead = async (data) => api.post(`${readReceiptApi}`, data).then((res) => res.data);



