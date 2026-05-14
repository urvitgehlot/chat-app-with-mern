import api from '../../services/api';
import axios from 'axios';

const usersApi = '/users';

export const loginUser = (data) => api.post(`${usersApi}/login`, data).then((res) => res.data);

export const registerUser = (data) => api.post(`${usersApi}/register`, data).then((res) => res.data);

export const logoutUser = (data) => api.post(`${usersApi}/logout`, data).then((res) => res.data);

export const getCurrentUser = () => api.get(`${usersApi}/current-user`).then((res) => res.data);

export const refreshAccessToken = () => axios.post(
    `${import.meta.env.VITE_BACKEND_API_URL}/users/refresh-token`,
    {},
    { withCredentials: true }
).then((res) => res.data);