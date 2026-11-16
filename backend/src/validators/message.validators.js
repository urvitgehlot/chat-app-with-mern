import { z } from "zod";
import { objectIdSchema, paginationSchema } from "./common.validators.js";

export const sendMessageValidator = z.object({
    body: z.object({
        content: z
            .string({ required_error: "Message content is required" })
            .trim()
            .min(1, "Message content cannot be empty"),
        chatType: z.enum(["direct", "group"], {
            errorMap: () => ({ message: "chatType must be either 'direct' or 'group'" }),
        }),
        chatId: objectIdSchema("Chat ID"),
        sentTo: objectIdSchema("Recipient User ID").optional(),
        replyToMessageId: objectIdSchema("Reply Message ID").optional().nullable(),
        tempId: z.string().optional(),
    }),
});

export const getChatMessagesByPageValidator = z.object({
    query: paginationSchema.extend({
        chatId: objectIdSchema("Chat ID"),
        chatType: z.enum(["direct", "group"]),
    }),
});

export const getUserAllMessagesValidator = z.object({
    query: z.object({
        directChatId: objectIdSchema("Direct Chat ID"),
    }),
});

