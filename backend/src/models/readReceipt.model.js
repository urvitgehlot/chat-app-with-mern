import mongoose, { Schema } from "mongoose"

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
);

readReceiptSchema.index({
    messageId: 1,
    userId: 1
}, { unique: true });

export const ReadReceipt = mongoose.model("ReadReceipt", readReceiptSchema)