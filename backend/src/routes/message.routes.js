import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { getUserAllMessages, getChatMessagesByPage, sendMessage } from "../controllers/message.controllers.js";

/**
 * @swagger
 * tags:
 *   name: Messages
 *   description: Real-time chat messaging and attachment APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Message:
 *       type: object
 *       required:
 *         - chatType
 *         - content
 *         - senderId
 *       properties:
 *         _id:
 *           type: string
 *           description: The unique auto-generated Mongoose ID of the message
 *         groupId:
 *           type: string
 *           description: Reference to Group ID (only if chatType is 'group')
 *         replyToMessageId:
 *           type: string
 *           description: Reference to another Message ID that this is replying to
 *         directChat:
 *           type: string
 *           description: Reference to DirectChat ID (only if chatType is 'direct')
 *         chatType:
 *           type: string
 *           enum: [direct, group]
 *           description: The scope/type of the chat room
 *         content:
 *           type: string
 *           description: Text content of the message
 *         senderId:
 *           type: string
 *           description: Reference to the User ID of the sender
 *         sentAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the message was sent
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       example:
 *         _id: 60d0fe4f5311236168a109cf
 *         directChat: 60d0fe4f5311236168a109cb
 *         chatType: direct
 *         content: "Hello! How are you?"
 *         senderId: 60d0fe4f5311236168a109ca
 *         sentAt: 2026-05-22T01:59:26.000Z
 *         createdAt: 2026-05-22T01:59:26.000Z
 *         updatedAt: 2026-05-22T01:59:26.000Z
 *
 *     Attachment:
 *       type: object
 *       required:
 *         - publicId
 *         - fileUrl
 *         - fileType
 *         - fileSize
 *         - messageId
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique Mongoose ID of the attachment record
 *         publicId:
 *           type: string
 *           description: Cloudinary asset public ID
 *         fileUrl:
 *           type: string
 *           description: Cloudinary access URL
 *         fileType:
 *           type: string
 *           description: File mime type or category
 *         fileSize:
 *           type: integer
 *           description: Size in bytes
 *         messageId:
 *           type: string
 *           description: Reference to the associated Message ID
 *       example:
 *         _id: 60d0fe4f5311236168a109d0
 *         publicId: chat_attachments/xyz123
 *         fileUrl: https://res.cloudinary.com/demo/image/upload/v123/xyz123.jpg
 *         fileType: image/jpeg
 *         fileSize: 45210
 *         messageId: 60d0fe4f5311236168a109cf
 */

const router = Router()

/**
 * @swagger
 * /api/v1/message/send-message:
 *   post:
 *     summary: Send a message with optional file attachments
 *     description: Creates and saves a message inside a direct chat or group chat. Uploads any attachments to Cloudinary. Dispatches Socket.IO notification to online receivers. Requires a valid JWT.
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *               - chatType
 *               - sentTo
 *             properties:
 *               content:
 *                 type: string
 *                 description: Message text body
 *               chatType:
 *                 type: string
 *                 enum: [direct, group]
 *                 description: The type of recipient (direct one-on-one or group chat room)
 *               sentTo:
 *                 type: string
 *                 description: Mongoose ID of the recipient user (direct) or target group (group)
 *               replyToMessageId:
 *                 type: string
 *                 description: Optional message ID to reply to
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Multiple attachment files to upload (max 10)
 *     responses:
 *       201:
 *         description: Message sent and saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: All fields are required or invalid parameters
 *       401:
 *         description: Unauthorized request
 *       500:
 *         description: Internal server error
 */
router.route('/send-message').post(verifyJWT, upload.array('attachments', 10), sendMessage)

/**
 * @swagger
 * /api/v1/message/get-user-all-message:
 *   get:
 *     summary: Retrieve all messages for a specific chat room
 *     description: Retrieves all messages corresponding to the given direct chat or group ID, ordered by sent timestamp descending. Requires a valid JWT.
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *         description: Mongoose ID of the target direct chat or group
 *     responses:
 *       200:
 *         description: Messages fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Chat ID is required
 *       401:
 *         description: Unauthorized request
 *       500:
 *         description: Internal server error
 */
router.route('/get-user-all-message').get(verifyJWT, getUserAllMessages)

router.route("/get-messsages-by-pages").get(verifyJWT, getChatMessagesByPage);

export default router