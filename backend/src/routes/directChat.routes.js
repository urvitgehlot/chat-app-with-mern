import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createDirectChat, getRecentChats, getUserDirectChats } from "../controllers/directChat.controllers.js";

/**
 * @swagger
 * tags:
 *   name: Direct Chat
 *   description: One-on-one direct chat management APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     DirectChat:
 *       type: object
 *       required:
 *         - participants
 *         - chatCreatedBy
 *       properties:
 *         _id:
 *           type: string
 *           description: The unique auto-generated Mongoose ID of the direct chat
 *         participantsKey:
 *           type: string
 *           description: A unique sorted combination string of participant IDs to prevent duplicate chats
 *         participants:
 *           type: array
 *           description: List of participant user details or IDs
 *           items:
 *             type: string
 *         chatCreatedBy:
 *           type: string
 *           description: User ID of the participant who initiated the chat
 *         typingUsers:
 *           type: array
 *           description: List of user IDs currently typing in this chat
 *           items:
 *             type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       example:
 *         _id: 60d0fe4f5311236168a109cb
 *         participantsKey: 60d0fe4f5311236168a109ca_60d0fe4f5311236168a109cc
 *         participants: ["60d0fe4f5311236168a109ca", "60d0fe4f5311236168a109cc"]
 *         chatCreatedBy: 60d0fe4f5311236168a109ca
 *         typingUsers: []
 *         createdAt: 2026-05-22T01:59:26.000Z
 *         updatedAt: 2026-05-22T01:59:26.000Z
 */

const router = Router();

/**
 * @swagger
 * /api/v1/direct-chat/create-direct-chat:
 *   post:
 *     summary: Initiate a direct chat with another user
 *     description: Creates a direct chat record between the logged-in user and target user. If a direct chat already exists, returns the existing record. Requires a valid JWT.
 *     tags: [Direct Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The Mongoose ID of the other participant user
 *             example:
 *               userId: 60d0fe4f5311236168a109cc
 *     responses:
 *       200:
 *         description: Direct chat already exists, returns existing chat details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       201:
 *         description: Direct chat created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: User ID is required or invalid ID format
 *       401:
 *         description: Unauthorized request
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.route("/create-direct-chat").post(verifyJWT, createDirectChat);

/**
 * @swagger
 * /api/v1/direct-chat/get-recent-chats:
 *   get:
 *     summary: Get user's recent direct chats and their last messages
 *     description: Retrieves all direct chats for the logged-in user populated with the other participant's profile details and the last message. Requires a valid JWT.
 *     tags: [Direct Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recent chats fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: Unauthorized request
 *       500:
 *         description: Internal server error
 */
router.route("/get-recent-chats").get(verifyJWT, getRecentChats);

export default router;