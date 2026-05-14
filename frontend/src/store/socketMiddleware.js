import { refreshTokenAsync } from "../features/auth/authSlice";
import { messageReceived, messageSentAckAsync } from "../features/chat/chatSlice";
import { initialsSocketConnection, disconnectSocket, getSocket } from "../services/socket";

let isInitialized = false;

const socketMiddleware = (store) => (next) => (action) => {
    if (
        action.type === 'auth/login/fulfilled' ||
        action.type === 'auth/register/fulfilled' ||
        action.type === 'auth/refresh-token/fulfilled' ||
        action.type === 'chat/restoreAuth'
    ) {
        if (!isInitialized) {
            isInitialized = true;
            initialsSocketConnection();

            const socket = getSocket();

            if (socket) {
                socket.on('connect_error', (err) => {
                    console.log("Socket connection error:", err.message);

                    if (err.data?.type === 401) {
                        store.dispatch(refreshTokenAsync());
                    }
                })

                socket.on('connect', () => {
                    const state = store.getState();
                    const userId = state.auth.userData?._id;

                    if (userId) {
                        socket.emit('join', userId);
                        console.log("user Joined", userId);
                    }

                    console.log('Socket connected:', socket.id);
                })

                socket.on('message_sent', (data) => {
                    store.dispatch(messageSentAckAsync(data));
                });

                socket.on('receive_message', (message) => {
                    store.dispatch(messageReceived(message));
                })


                socket.on('get_typing_users', ({ typing }) => {
                })

                socket.on('get_typing_users_error', ({ error }) => {
                    console.log(error);
                })
            }
        }
    }

    if (action.type === 'auth/logout/fulfilled') {
        disconnectSocket();
        isInitialized = false;
    }

    if (action.type === 'chat/sendMessage') {
        const socket = getSocket();
        if (socket) {
            socket.emit('send_message', action.payload);
        }
    }

    if (action.type === 'chat/joinChat') {
        const socket = getSocket();
        if (socket) {
            socket.emit('join_chat', action.payload);
        }
    }

    return next(action);
}

export default socketMiddleware;