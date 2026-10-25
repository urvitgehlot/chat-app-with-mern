import { configureStore } from "@reduxjs/toolkit"
import authSlice from "../features/auth/authSlice"
import chatSlice from "../features/chat/chatSlice"
import socketMiddleware from "./socketMiddleware"
import { injectStore } from "../services/api"
import appSlice from "./appSlice"

const store = configureStore({
    reducer: {
        app: appSlice,
        auth: authSlice,
        chat: chatSlice,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(socketMiddleware),
    devTools: true,
})

injectStore(store);

export default store