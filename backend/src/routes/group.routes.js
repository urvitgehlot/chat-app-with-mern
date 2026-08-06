import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createGroup, getUserAllGroups } from "../controllers/group.controllers.js";

/**
 * @swagger
 * tags:
 *   name: Groups
 *   description: Group chat and membership management APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Group:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         _id:
 *           type: string
 *           description: The unique auto-generated Mongoose ID of the group
 *         name:
 *           type: string
 *           description: The name of the group chat room
 *         description:
 *           type: string
 *           description: Description or purpose of the group
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       example:
 *         _id: 60d0fe4f5311236168a109cd
 *         name: Developers Lounge
 *         description: A place to talk about all things coding!
 *         createdAt: 2026-05-22T01:59:26.000Z
 *         updatedAt: 2026-05-22T01:59:26.000Z
 *
 *     GroupMembership:
 *       type: object
 *       required:
 *         - groupId
 *         - userId
 *       properties:
 *         _id:
 *           type: string
 *           description: The unique Mongoose ID of the group membership record
 *         groupId:
 *           type: string
 *           description: Reference to the Group ID
 *         userId:
 *           type: string
 *           description: Reference to the User ID
 *         isAdmin:
 *           type: boolean
 *           description: Indicates if the user is an administrator of this group
 *           default: false
 *         joinedAt:
 *           type: string
 *           format: date-time
 *       example:
 *         _id: 60d0fe4f5311236168a109ce
 *         groupId: 60d0fe4f5311236168a109cd
 *         userId: 60d0fe4f5311236168a109ca
 *         isAdmin: true
 */

const router = Router();

/**
 * @swagger
 * /api/v1/group/create-group:
 *   post:
 *     summary: Create a new group chat room
 *     description: Creates a new Group record and automatically adds the creator as an admin member. Requires a valid JWT.
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the group
 *               description:
 *                 type: string
 *                 description: Optional description of the group
 *             example:
 *               name: "Node.js Enthusiasts"
 *               description: "Discuss all things backend node development"
 *     responses:
 *       201:
 *         description: Group created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Group created successfully
 *                 data:
 *                   $ref: '#/components/schemas/Group'
 *       400:
 *         description: Group name is required
 *       401:
 *         description: Unauthorized request
 *       500:
 *         description: Failed to create group or server error
 */
router.route('/create-group').post(verifyJWT, createGroup)

/**
 * @swagger
 * /api/v1/group/get-user-groups:
 *   get:
 *     summary: Get all groups the current user is a member of
 *     description: Retrieves all GroupMembership records containing populated Group information matching the logged-in user. Requires a valid JWT.
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User all groups fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: Unauthorized request
 *       500:
 *         description: Internal server error
 */
router.route('/get-user-groups').get(verifyJWT, getUserAllGroups)

export default router;