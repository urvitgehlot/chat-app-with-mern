import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"

const app = express()

// Add this right after const app = express()
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true // This is essential since you are sending/receiving cookies (accessToken, refreshToken)
}))


// body-parsing middlewares BEFORE routes
app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(cookieParser())

// testing ping api
app.get("/api/v1/ping", (req, res) => {
    res.status(200).json({ message: "pong", });
})

// routes imports
import userRouter from "./routes/user.routes.js"
import directChatRouter from "./routes/directChat.routes.js"
import groupRouter from './routes/group.routes.js'
import messageRouter from "./routes/message.routes.js"


// routes declaration
app.use('/api/v1/users', userRouter)
app.use('/api/v1/direct-chat', directChatRouter)
app.use('/api/v1/group', groupRouter)
app.use("/api/v1/message", messageRouter)



export { app }