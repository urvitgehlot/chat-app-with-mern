import api from '../../services/api';
import axios from 'axios';

const usersApi = '/users';

export const loginUser = (data) => api.post(`${usersApi}/login`, data).then((res) => res.data);

export const registerUser = (data) => api.post(`${usersApi}/register`, data).then((res) => res.data);

export const sendRegistrationOTP = (data) => api.post(`${usersApi}/send-registration-otp`, data).then((res) => res.data);

export const logoutUser = (data) => api.post(`${usersApi}/logout`, data).then((res) => res.data);

export const getCurrentUser = () => api.get(`${usersApi}/current-user`).then((res) => res.data);

export const completeProfileSetup = (formData) =>
    api.post(`${usersApi}/complete-profile-setup`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }).then((res) => res.data);

export const refreshAccessToken = () => axios.post(
    `${import.meta.env.VITE_BACKEND_API_URL}/users/refresh-token`,
    {},
    { withCredentials: true }
).then((res) => res.data);

export const searchUsers = (query, limit = 20) =>
    api.get(`${usersApi}/find-users`, { params: { query, limit } }).then((res) => res.data);