import mongoose, {Schema} from "mongoose"

const readReceiptSchema = new Schema(
    {
        messageId: {
            type: Schema.Types.ObjectId,
            ref: "Message",
            required: true,
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    {
        timestamps: true,
    }
)

export const ReadReceipt = mongoose.model("ReadReceipt", readReceiptSchema)