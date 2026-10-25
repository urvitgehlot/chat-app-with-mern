import nodemailer from "nodemailer";

import asyncHandler from "../utils/asyncHandler.js";

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export const sendEmail = async ({ to, subject, text, html }) => {
    return transporter.sendMail({
        from: `Chatter <${process.env.EMAIL_FROM}>`,
        to,
        subject,
        text,
        html
    })
}
