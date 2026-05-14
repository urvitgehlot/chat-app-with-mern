import dotenv from "dotenv"
import connectDB from "./db/index.js"
import { app } from "./app.js"
import { createServer } from "http"
import { initSocketIO } from "./socket/index.js"

dotenv.config({
    path: ".env",
})

const server = createServer(app)

initSocketIO(server);


connectDB()
    .then(() => {
        server.on("error", (error) => {
            console.log("Server Error: ", error)
            throw error
        })
        server.listen(process.env.PORT || 8000, () => {
            console.log(`listning at port: ${process.env.PORT || 8000}`)
        })

    })
    .catch((error) => {
        console.error("Database Connection Failed: ", error)
    })