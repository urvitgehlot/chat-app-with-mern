import { configureStore } from "@reduxjs/toolkit"
import authSlice from "../features/auth/authSlice"
import chatSlice from "../features/chat/chatSlice"
import socketMiddleware from "./socketMiddleware"
import { injectStore } from "../services/api"

const store = configureStore({
    reducer: {
        auth: authSlice,
        chat: chatSlice,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(socketMiddleware),
})

injectStore(store);

export default store