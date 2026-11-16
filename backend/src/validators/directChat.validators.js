import { z } from "zod";
import { objectIdSchema } from "./common.validators.js";

export const createDirectChatValidator = z.object({
    body: z.object({
        userId: objectIdSchema("User ID"),
    }),
});

