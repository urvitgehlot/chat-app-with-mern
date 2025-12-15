import mongoose, {Schema} from "mongoose"

const attachmentSchema = new Schema(
    {
        publicId: {
            type: String,
            required: true,
        },
        fileUrl: {
            type: String,
            required: true,
        },
        fileType: {
            type: String,
            enum: ["image", "video", "document"],
            required: true,
        },
        fileSize: {
            type: Number,
            required: true,
        },
        messageId: {
            type: Schema.Types.ObjectId,
            ref: "Message",
            required: true,
        },
    },
    {
        timestamps: true,
    }
)

export const Attachment = mongoose.model('Attachment', attachmentSchema)