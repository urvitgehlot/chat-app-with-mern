import { z } from "zod";
import { objectIdSchema } from "./common.validators.js";

export const markMessageAsReadValidator = z.object({
    body: z
        .object({
            chatType: z.enum(["direct", "group"], {
                errorMap: () => ({ message: "chatType must be either 'direct' or 'group'" }),
            }),
            directChat: objectIdSchema("Direct Chat ID").optional(),
            groupId: objectIdSchema("Group ID").optional(),
            chatId: objectIdSchema("Chat ID").optional(),
            lastReadMessageId: objectIdSchema("Last Read Message ID"),
        })
        .superRefine((data, ctx) => {
            if (data.chatType === "direct" && !data.directChat && !data.chatId) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["directChat"],
                    message: "directChat (or chatId) is required when chatType is 'direct'",
                });
            }
            if (data.chatType === "group" && !data.groupId && !data.chatId) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["groupId"],
                    message: "groupId (or chatId) is required when chatType is 'group'",
                });
            }
        }),
});

