import mongoose, { Schema } from "mongoose"

const messageSchema = new Schema(
    {
        groupId: {
            type: Schema.Types.ObjectId,
            ref: "Group",
            required: function () {
                return this.chatType === "group";
            },
        },
        replyToMessageId: {
            type: Schema.Types.ObjectId,
            ref: "Message",
        },
        directChat: {
            type: Schema.Types.ObjectId,
            ref: "DirectChat",
            required: function () {
                return this.chatType === "direct";
            },
        },
        chatType: {
            type: String,
            enum: ["direct", "group"],
            required: true,
            trim: true,
            lowercase: true,
        },
        content: {
            type: String,
            required: true,
            // trim: true,
        },
        senderId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        isDeleted: {
            type: Schema.Types.Boolean,
            default: false,
        },
        deletedBy: {
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
);

// messageSchema.pre("save", function () {
//     if (this.chatType === "direct") {
//         this.groupId = undefined;
//     } else if (this.chatType === "group") {
//         this.directChat = undefined;
//     }
// });

messageSchema.index({
    directChat: 1,
    chatType: 1,
    sentAt: -1
});

messageSchema.index({
    groupId: 1,
    chatType: 1,
    sentAt: -1
});

messageSchema.index({
    senderId: 1
});

export const Message = mongoose.model('Message', messageSchema)