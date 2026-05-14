export const DB_NAME = "ug_chat"

export const httpsOptions = {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
}