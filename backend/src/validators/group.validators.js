import { z } from "zod";
import { objectIdSchema } from "./common.validators.js";

export const createGroupValidator = z.object({
    body: z.object({
        name: z
            .string({ required_error: "Group name is required" })
            .trim()
            .min(1, "Group name cannot be empty")
            .max(60, "Group name must be 60 characters or less"),
        description: z
            .string()
            .trim()
            .max(250, "Description cannot exceed 250 characters")
            .optional()
            .default(""),
        userIds: z
            .array(objectIdSchema("Member User ID"))
            .optional()
            .default([]),
    }),
});

export const addUserToGroupValidator = z.object({
    body: z.object({
        groupId: objectIdSchema("Group ID"),
        userId: objectIdSchema("User ID to add"),
    }),
});

export const getGroupValidator = z.object({
    params: z.object({
        groupId: objectIdSchema("Group ID"),
    }),
});

export const updateGroupValidator = z.object({
    params: z.object({
        groupId: objectIdSchema("Group ID"),
    }),
    body: z.object({
        name: z
            .string()
            .trim()
            .min(1, "Group name cannot be empty")
            .max(60, "Group name must be 60 characters or less")
            .optional(),
        description: z
            .string()
            .trim()
            .max(250, "Description cannot exceed 250 characters")
            .optional(),
    }),
});