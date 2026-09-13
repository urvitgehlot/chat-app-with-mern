export const DB_NAME = "ug_chat"

export const httpsOptions = {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production" ? true : false,
    maxAge: (process.env.COOKIE_MAX_AGE_DAYS || 1) * 24 * 60 * 60 * 1000,
}