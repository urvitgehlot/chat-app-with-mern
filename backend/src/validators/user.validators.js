import { z } from "zod";

export const sendOtpValidator = z.object({
    body: z.object({
        email: z
            .string({ required_error: "Email is required" })
            .trim()
            .email("Please provide a valid email address")
            .toLowerCase(),
    }),
});

export const registerUserValidator = z.object({
    body: z.object({
        email: z
            .string({ required_error: "Email is required" })
            .trim()
            .email("Please provide a valid email address")
            .toLowerCase(),
        password: z
            .string({ required_error: "Password is required" })
            .min(6, "Password must be at least 6 characters long"),
        otp: z
            .string({ required_error: "OTP is required" })
            .trim()
            .length(6, "OTP must be exactly 6 digits"),
    }),
});

export const loginUserValidator = z.object({
    body: z.object({
        email: z
            .string({ required_error: "Email is required" })
            .trim()
            .email("Please provide a valid email address")
            .toLowerCase(),
        password: z
            .string({ required_error: "Password is required" })
            .min(1, "Password cannot be empty"),
    }),
});

export const completeProfileValidator = z.object({
    body: z.object({
        username: z
            .string({ required_error: "Username is required" })
            .trim()
            .min(3, "Username must be at least 3 characters")
            .max(30, "Username cannot exceed 30 characters")
            .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain alphanumeric characters and underscores"),
        displayName: z
            .string()
            .trim()
            .max(50, "Display name cannot exceed 50 characters")
            .optional(),
        bio: z
            .string()
            .trim()
            .max(160, "Bio cannot exceed 160 characters")
            .optional(),
    }),
});

export const searchUsersValidator = z.object({
    query: z.object({
        query: z.string().trim().optional().default(""),
        limit: z.coerce.number().int().min(1).max(50).default(20),
    }),
});

