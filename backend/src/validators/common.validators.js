import { z } from "zod";

export const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const objectIdSchema = (fieldName = "ID") =>
    z.string().trim().regex(objectIdRegex, `Invalid ${fieldName} format (must be 24-character hexadecimal)`);

export const paginationSchema = z.object({
    page: z.coerce.number().int().min(1, "Page must be at least 1").default(1),
    limit: z.coerce.number().int().min(1).max(100, "Limit cannot exceed 100").default(20),
});

