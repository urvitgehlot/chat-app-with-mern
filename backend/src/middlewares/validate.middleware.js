import ApiError from "../utils/ApiError.js";

/**
 * Express middleware that validates req.body, req.query, or req.params against a Zod schema.
 * Automatically extracts errors and invokes next(new ApiError(400, ...)) with clear messages.
 *
 * @param {import("zod").ZodSchema} schema
 * @returns {import("express").RequestHandler}
 */
export const validate = (schema) => (req, res, next) => {
    try {
        const parsed = schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        });

        // Mutate properties without reassigning getter-only references (e.g. req.query in Express 5)
        if (parsed.body !== undefined && typeof req.body === "object" && req.body !== null) {
            req.body = parsed.body;
        }
        if (parsed.query !== undefined && typeof req.query === "object" && req.query !== null) {
            Object.keys(req.query).forEach((key) => delete req.query[key]);
            Object.assign(req.query, parsed.query);
        }
        if (parsed.params !== undefined && typeof req.params === "object" && req.params !== null) {
            Object.keys(req.params).forEach((key) => delete req.params[key]);
            Object.assign(req.params, parsed.params);
        }

        req.validated = parsed;

        return next();
    } catch (error) {
        if (error?.errors && Array.isArray(error.errors)) {
            const formattedErrors = error.errors.map((err) => ({
                field: err.path.slice(1).join("."), // e.g. "body.name" -> "name"
                message: err.message,
            }));

            const combinedMessage = formattedErrors
                .map((e) => (e.field ? `${e.field}: ${e.message}` : e.message))
                .join(", ");

            return next(new ApiError(400, combinedMessage || "Validation failed", formattedErrors));
        }

        return next(new ApiError(400, error.message || "Invalid request parameters"));
    }
};

export default validate;

