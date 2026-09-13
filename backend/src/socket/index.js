import { Server } from "socket.io";
import cookie from "cookie"
import jwt from "jsonwebtoken"
import { registerMessageHandlers } from "./handlers/message.handler.js";
import { DirectChat } from "../models/directChat.model.js";


let io = null;

// userId -> socketId lookup
let onlineUsers = {};

// userId -> {chatDetails: {directChatId,}, startsAt: Timestamp}
let typingUsers = {};

let typingState = {
    chat: {},
    group: {},
}

export function initSocketIO(httpServer) {

    // Attach Socket.IO to the server
    io = new Server(httpServer, {
        cors: {
            origin: process.env.CLIENT_URL,
            methods: ["GET", "POST"],
            credentials: true,
        },
    })

    // Middleware to authenticate Socket.IO connections
    io.use((socket, next) => {
        const cookies = socket.handshake.headers.cookie;
        if (!cookies) {
            console.log('Socket Authentication Error: No cookies provided')
            const err = new Error("Authentication Error: No cookies provided");
            err.data = { type: 401 };
            return next(err);
        }

        const parsedCookies = cookie.parse(cookies);
        const token = parsedCookies.accessToken;
        if (!token) {
            console.log('Socket Authentication Error: No token provided')
            const err = new Error("Authentication Error: No token provided");
            err.data = { type: 401 };
            return next(err);
        }

        try {
            const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            socket.user = decodedToken; // Attach user info
            next();
        } catch (error) {
            console.log('Socket Authentication Error: ', error)
            const err = new Error("Authentication Error: Invalid token");
            err.data = { type: 401 };
            return next(err);
        }
    });

    io.on("connection", (socket) => {
        console.log("A user connected: ", socket.id)

        // online users:- I want all users that been done chat with the user i want all who is online right now

        // Join Event
        socket.on("join", async (userId) => {
            onlineUsers[userId] = socket.id
            console.log(`User ${userId} joined with socket ID: ${socket.id}`)

            try {
                const userChats = await DirectChat.find({
                    participants: userId
                });

                const chattedUserIds = new Set();
                userChats.forEach(chat => {
                    chat.participants.forEach(participantId => {
                        const idStr = participantId.toString();
                        if (idStr !== userId) {
                            chattedUserIds.add(idStr);
                        }
                    });
                });

                const onlineFriends = Array.from(chattedUserIds).filter(id => onlineUsers[id]);

                socket.emit("online_users", onlineFriends)

                onlineFriends.forEach(friendId => {
                    const friendSocketId = onlineUsers[friendId];
                    if (friendSocketId) {
                        io.to(friendSocketId).emit("user_online", userId);
                    }
                });

            } catch (error) {
                console.error("Error fetching online friends: ", error);
            }

        });

        // Send Message Event
        // socket.on("send_message", ({ senderId, receiverId, content }) => {
        //     const receiverSocketId = users[receiverId]
        //     console.log(users);

        //     if (receiverSocketId) {
        //         io.to(receiverSocketId).emit("receive_message", {
        //             senderId,
        //             content,
        //         })
        //         console.log(`Message from ${senderId} to ${receiverId}: ${content}`)
        //     } else {
        //         console.log(`User ${receiverId} is not connected. Message from ${senderId} could not be delivered.`)
        //     }
        // });


        // Register event handlers
        registerMessageHandlers(io, socket, onlineUsers, typingUsers, typingState);

        // Disconnect Event
        socket.on("disconnect", async () => {
            console.log("A user disconnected: ", socket.id)

            let disconnectedUserId = null;

            // Remove the user from the users object
            for (const user in onlineUsers) {
                if (onlineUsers[user] === socket.id) {
                    disconnectedUserId = user;
                    delete onlineUsers[user]
                    console.log(`User ${user} with socket ID ${socket.id} has been removed from the users list.`)
                    break
                }
            }

            if (disconnectedUserId) {

                try {
                    const userChats = await DirectChat.find({
                        participants: disconnectedUserId
                    });

                    const chattedUserIds = new Set();
                    userChats.forEach(chat => {
                        chat.participants.forEach(participantId => {
                            const idStr = participantId.toString();
                            if (idStr !== disconnectedUserId) {
                                chattedUserIds.add(idStr);
                            }
                        });
                    });

                    Array.from(chattedUserIds).forEach(friendId => {
                        const friendSocketId = onlineUsers[friendId];
                        if (friendSocketId) {
                            io.to(friendSocketId).emit("user_offline", disconnectedUserId);
                        }
                    });

                } catch (error) {
                    console.error("Error notifying friends of disconnect: ", error);
                }
            }
        });
    });

    return io;
}

export const getIO = () => {
    if (!io) throw new Error("Socket.IO has not been initialized");
    return io;
}

export const getOnlineUsers = () => onlineUsers