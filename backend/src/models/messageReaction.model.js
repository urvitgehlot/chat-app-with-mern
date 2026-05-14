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
);

messageReactionSchema.index({
    messageId: 1,
    userId: 1
}, { unique: true });

export const MessageReaction = mongoose.model('MessageReaction', messageReactionSchema)