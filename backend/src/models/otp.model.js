import mongoose, { Schema } from "mongoose";


const otpSchema = new Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
        },
        otp: {
            type: String,
            required: true,
        },
        attempts: {
            type: Number,
            required: true,
            default: 0
        },
        expiresAt: {
            type: Date,
            required: true,
        }
    },
    {
        timestamps: true,
    }
);

otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 10 }); // 10 minutes
otpSchema.index({ email: 1 }, { unique: true });

export const Otp = mongoose.model('Otp', otpSchema);
