import mongoose from "mongoose"
import { DB_NAME } from "../constants.js"

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(
            process.env.MONGODB_URI,
            {
                // family: 4, // Use IPv4
                dbName: DB_NAME
            }
        )
        console.log("\n MongoDB connected !! DB HOST: ", connectionInstance.connection.host)
    } catch (error) {
        console.log("MONGODB connection FAILED ", error)
    }
}


export default connectDB;