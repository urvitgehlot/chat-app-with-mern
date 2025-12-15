import mongoose, { Schema } from "mongoose";

const messageReactionSchema = new Schema(
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
        reaction: {
            type: String,
            required: true,
        }
    },
    {
        timestamps: true,
    }
)

export const MessageReaction = mongoose.model('MessageReaction', messageReactionSchema)