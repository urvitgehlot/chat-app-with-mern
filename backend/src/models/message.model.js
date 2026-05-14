import mongoose, { Schema } from "mongoose"

const messageSchema = new Schema(
    {
        groupId: {
            type: Schema.Types.ObjectId,
            ref: "Group",
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
            required: true,
        },
        senderId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        sentAt: {
            type: Date,
            default: Date.now,
        }
    },
    {
        timestamps: true,
    }
);

messageSchema.pre("save", function () {
    if (this.chatType === "direct") {
        this.groupId = undefined;
    } else if (this.chatType === "group") {
        this.directChat = undefined;
    }
});

messageSchema.index({
    directChat: 1,
    sentAt: 1
});

messageSchema.index({
    groupId: 1,
    sentAt: 1
});

messageSchema.index({
    senderId: 1
});

export const Message = mongoose.model('Message', messageSchema)