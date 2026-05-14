import mongoose, { Schema } from "mongoose";

const groupMembershipSchema = new Schema(
    {
        isAdmin: {
            type: Boolean,
            default: false,
        },
        groupId: {
            type: Schema.Types.ObjectId,
            ref: "Group",
            required: true,
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        joinedAt: {
            type: Date,
            default: Date.now,
        },
        invitedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        leftAt: {
            type: Date,
        },
        isRemoved: {
            type: Boolean,
            default: false,
        },
        removedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },

    },
    {
        timestamps: true,
    }
);

groupMembershipSchema.index({
    groupId: 1,
    userId: 1
}, { unique: true });

groupMembershipSchema.index({
    userId: 1
});

export const GroupMembership = mongoose.model("GroupMembership", groupMembershipSchema)