import mongoose from "mongoose";


const ConversationReadStateSchema = new mongoose.Schema(
    {
        chatType: {
            type: String,
            enum: ['direct', 'group'],
            required: true,
        },
        directChat: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "DirectChat",
            required: function () {
                return this.chatType === "direct";
            },
        },
        groupId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Group",
            required: function () {
                return this.chatType === "group";
            },
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        lastReadMessageId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message",
            default: null
        },
        lastReadAt: {
            type: Date,
            default: null
        },
    },
    {
        timestamps: true,
    }
);

conversationReadStateSchema.index(
    { directChat: 1, userId: 1 },
    {
        unique: true,
        partialFilterExpression: {
            directChat: { $exists: true },
        },
    }
);

conversationReadStateSchema.index(
    { groupId: 1, userId: 1 },
    {
        unique: true,
        partialFilterExpression: {
            groupId: { $exists: true },
        },
    }
);

export const ConversationReadState = mongoose.model("ConversationReadState", ConversationReadStateSchema);