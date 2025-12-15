import mongoose, {Schema} from "mongoose";

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
        }
    },
    {
        timestamps: true,
    }
)

export const GroupMembership = mongoose.model("GroupMembership", groupMembershipSchema)