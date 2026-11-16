import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { markMessageAsReadValidator } from "../validators/readReceipt.validators.js";
import { markMessageAsRead } from "../controllers/readReceipt.controller.js";

/**
 * @swagger
 * tags:
 *   name: ConversationReadState
 *   description: Read receipt and conversation read cursor management APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ConversationReadState:
 *       type: object
 *       required:
 *         - chatType
 *         - userId
 *       properties:
 *         _id:
 *           type: string
 *           description: The unique auto-generated Mongoose ID of the read state record
 *         chatType:
 *           type: string
 *           enum: [direct, group]
 *         directChat:
 *           type: string
 *           description: DirectChat ID (present when chatType is 'direct')
 *         groupId:
 *           type: string
 *           description: Group ID (present when chatType is 'group')
 *         userId:
 *           type: string
 *           description: User ID who read up to lastReadMessageId
 *         lastReadMessageId:
 *           type: string
 *           description: Latest Message ID read by the user in this conversation
 *         lastReadAt:
 *           type: string
 *           format: date-time
 */

const router = Router();

/**
 * @swagger
 * /api/v1/read-receipt:
 *   post:
 *     summary: Mark messages read up to lastReadMessageId
 *     description: Advances the authenticated user's read cursor in ConversationReadState if lastReadMessageId is newer than the current cursor, and emits a Socket.IO message_read event to other chat participants.
 *     tags: [ConversationReadState]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - chatType
 *               - lastReadMessageId
 *             properties:
 *               chatType:
 *                 type: string
 *                 enum: [direct, group]
 *               directChat:
 *                 type: string
 *               groupId:
 *                 type: string
 *               lastReadMessageId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Read state updated or already marked as read
 *       400:
 *         description: Validation error or invalid message/chat mismatch
 *       401:
 *         description: Unauthorized request
 *       403:
 *         description: Not a participant or active member of the chat
 *       404:
 *         description: Message not found
 */
router
    .route("/")
    .post(verifyJWT, validate(markMessageAsReadValidator), markMessageAsRead);

export default router;
