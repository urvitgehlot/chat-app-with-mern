import mongoose, {Schema} from "mongoose";

const groupSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        }
    },
    {
        timestamps: true,
    }
)

export const Group = mongoose.model("Group", groupSchema)