import mongoose, {Schema} from "mongoose"

const directchatSchema = new Schema(
    {
        user1Id: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        user2Id: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        }
    },
    {
        timestamps: true,
    }
)

export const DirectChat = mongoose.model('DirectChat', directchatSchema)