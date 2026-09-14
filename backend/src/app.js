import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"
import swaggerUI from "swagger-ui-express"
import swaggerSpecs from "../config/swagger.js"

const app = express()

app.set("trust proxy", 1);


console.log("client url: ", process.env.CLIENT_URL || "http://localhost:5173");
// Add this right after const app = express()
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true // This is essential since you are sending/receiving cookies (accessToken, refreshToken)
}))


// body-parsing middlewares BEFORE routes
app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(cookieParser())


app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpecs))


/**
 * @swagger
 * /api/v1/ping:
 *   get:
 *     summary: Health check / ping endpoint
 *     description: Simple endpoint to test if the backend server is running.
 *     tags: [Utility]
 *     responses:
 *       200:
 *         description: Server is online and responding.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: pong
 */
app.get("/api/v1/ping", (req, res) => {
    res.status(200).json({ message: "pong", });
})

// routes imports
import userRouter from "./routes/user.routes.js"
import directChatRouter from "./routes/directChat.routes.js"
import groupRouter from './routes/group.routes.js'
import messageRouter from "./routes/message.routes.js"

import { authLimiter, limiter } from "./middlewares/ratelimit.middleware.js"


// routes declaration
app.use('/api/v1/users', userRouter)
app.use('/api/v1/direct-chat', directChatRouter)
app.use('/api/v1/group', groupRouter)
app.use("/api/v1/message", messageRouter)



export { app }