import axios from 'axios';
import { logoutAsync } from '../features/auth/authSlice';

const api = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_API_URL,
    withCredentials: true, // Crucial for sending HTTP-only cookies
});

// Flag to prevent multiple simultaneous refresh token requests
let isRefreshing = false;
let failedQueue = [];
let storeRef = null;

export const injectStore = (store) => {
    storeRef = store;
}

const processQueue = (error) => {
    failedQueue.forEach(prom => {
        if (error) prom.reject(error);
        else prom.resolve();
    });
    failedQueue = [];
};

// Response interceptor to catch global errors like 401
api.interceptors.response.use(
    (response) => {
        // Any status code within the range of 2xx cause this function to trigger
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // If the error is 401 and we haven't already retried this request
        if (error.response?.status === 401 && !originalRequest._retry) {

            // Skip interceptor for refresh-token AND logout to avoid infinite loops
            if (originalRequest.url.includes('/users/refresh-token') || originalRequest.url.includes('/users/logout')) {
                return Promise.reject(error);
            }

            // If a refresh is already in progress, queue this request
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(() => api(originalRequest))
                    .catch(err => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                await axios.post(`${import.meta.env.VITE_BACKEND_API_URL}/users/refresh-token`, {}, {
                    withCredentials: true
                });
                processQueue(null);

                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError);

                if (storeRef) {
                    storeRef.dispatch(logoutAsync());
                }

                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;
