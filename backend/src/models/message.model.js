import mongoose, {Schema} from "mongoose"

const messageSchema = new Schema(
    {
        groupId: {
            type: Schema.Types.ObjectId,
            ref: "Groups",
            // required: true,
        },
        replyToMessageId: {
            type: Schema.Types.ObjectId,
            ref: "Message",
        },
        directChat: {
            type: Schema.Types.ObjectId,
            ref: "DirectChat",
        },
        chatType: {
            type: String,
            enum: ["direct", "group"],
            required: true,
        },
        content: {
            type: String,
        },
        senderId: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        sentAt: {
            type: Date,
            default: Date.now,
        }
    },
    {
        timestamps: true,
    }
)

export const Message = mongoose.model('Message', messageSchema)