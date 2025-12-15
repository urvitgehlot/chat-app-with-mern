import express from "express"

const app = express()

// routes imports
import userRouter from "./routes/user.routes.js"


// routes declaration
app.use('/api/v1/users', userRouter)



export { app }