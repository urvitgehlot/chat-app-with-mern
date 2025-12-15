import dotenv from "dotenv"
import connectDB from "./db/index.js"
import { app } from "./app.js"

dotenv.config({
    path: ".env",
})

connectDB()
.then( () => {
    app.on("error", (error)=> {
        console.log("Error: ",error)
        throw error
    })
    app.listen(process.env.PORT || 8000, ()=> {
        console.log(`listning at port: ${process.env.PORT || 8000}`)
    })

})
.catch( (error) => {
    console.error("Database Connection Failed: ", error)
})