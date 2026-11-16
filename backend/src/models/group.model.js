import mongoose, { Schema } from "mongoose";

const groupSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        avatarUrl: {
            type: String,
            default: null,
        },
        lastMessageId: {
            type: Schema.Types.ObjectId,
            ref: "Message",
        },
        isBanned: {
            type: [Schema.Types.ObjectId],
            ref: "User",
            default: [],
            validate: (val) => val.length <= 1,
        }
    },
    {
        timestamps: true,
    }
)

export const Group = mongoose.model("Group", groupSchema)