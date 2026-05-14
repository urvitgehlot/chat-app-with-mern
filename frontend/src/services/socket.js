import { io } from "socket.io-client";

let socket;

export const initialsSocketConnection = () => {
    if (socket) {
        console.log('Socket already connected');
        return;
    }
    socket = io(import.meta.env.VITE_BACKEND_URL, {
        withCredentials: true,
        transports: ["websocket"],
    })
    console.log('Connecting Socket....')
}

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
        console.log('Socket Disconnected')
    }
}

export const getSocket = () => socket;