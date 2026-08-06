import { Router } from "express";
import { getCurrentUser, loginUser, logoutUser, refreshAccessToken, registerUser, updateAboutMe, updateAvatar, updateDisplayName } from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management and authentication APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - displayName
 *       properties:
 *         _id:
 *           type: string
 *           description: The unique auto-generated Mongoose ID of the user
 *         username:
 *           type: string
 *           description: Unique username
 *         email:
 *           type: string
 *           description: Unique email address
 *         displayName:
 *           type: string
 *           description: User's display name
 *         avatarUrl:
 *           type: string
 *           description: URL of the user's avatar image
 *         aboutMe:
 *           type: string
 *           description: About me bio description
 *         lastActiveAt:
 *           type: string
 *           format: date-time
 *           description: Last active timestamp
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       example:
 *         _id: 60d0fe4f5311236168a109ca
 *         username: john_doe
 *         email: john@example.com
 *         displayName: John Doe
 *         avatarUrl: http://example.com/avatar.jpg
 *         aboutMe: Active chat member!
 *         lastActiveAt: 2026-05-22T01:59:26.000Z
 *         createdAt: 2026-05-22T01:59:26.000Z
 *         updatedAt: 2026-05-22T01:59:26.000Z
 *
 *     ApiResponse:
 *       type: object
 *       properties:
 *         statusCode:
 *           type: integer
 *           description: HTTP status code
 *         data:
 *           type: object
 *           description: Response payload
 *         message:
 *           type: string
 *           description: Response message
 *         success:
 *           type: boolean
 *           description: Success flag
 *       example:
 *         statusCode: 200
 *         data: {}
 *         message: Operation successful
 *         success: true
 */

const router = Router()

/**
 * @swagger
 * /api/v1/users/login:
 *   post:
 *     summary: Log in an existing user
 *     description: Authenticates a user by email/username and password. Sets HTTP-only access and refresh token cookies.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Required if username is not provided
 *               username:
 *                 type: string
 *                 description: Required if email is not provided
 *               password:
 *                 type: string
 *                 format: password
 *             example:
 *               email: john@example.com
 *               password: password123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Email or username and password are required, or user does not exist
 *       401:
 *         description: Invalid user credentials
 *       500:
 *         description: Internal server error
 */
router.route('/login').post(loginUser)

/**
 * @swagger
 * /api/v1/users/register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user profile with a unique auto-generated username. Sets HTTP-only access and refresh token cookies.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - displayName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               displayName:
 *                 type: string
 *             example:
 *               email: john@example.com
 *               password: password123
 *               displayName: John Doe
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: All fields are required
 *       409:
 *         description: User with email already exists
 *       500:
 *         description: Internal server error
 */
router.route('/register').post(registerUser)

/**
 * @swagger
 * /api/v1/users/logout:
 *   post:
 *     summary: Log out current user
 *     description: Invalidates current user session and clears authentication cookies. Requires a valid JWT.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: Unauthorized request
 *       500:
 *         description: Internal server error
 */
router.route('/logout').post(verifyJWT, logoutUser)

/**
 * @swagger
 * /api/v1/users/refresh-token:
 *   post:
 *     summary: Refresh access token
 *     description: Requests a new access token using a refresh token supplied in cookies or body.
 *     tags: [Users]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Optional if refreshToken is set in HTTP-only cookies
 *     responses:
 *       200:
 *         description: Access token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: Unauthorized request or invalid refresh token
 *       500:
 *         description: Internal server error
 */
router.route('/refresh-token').post(refreshAccessToken)

/**
 * @swagger
 * /api/v1/users/current-user:
 *   get:
 *     summary: Get currently authenticated user details
 *     description: Retrieves profile information of the currently logged-in user. Requires a valid JWT.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: Unauthorized request
 *       500:
 *         description: Internal server error
 */
router.route('/current-user').get(verifyJWT, getCurrentUser)

/**
 * @swagger
 * /api/v1/users/update-avatar:
 *   patch:
 *     summary: Update current user's avatar image
 *     description: Uploads a new avatar file to Cloudinary and updates the profile. Requires a valid JWT.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - avatar
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: Avatar image file (multipart/form-data)
 *     responses:
 *       200:
 *         description: Avatar updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Avatar is required or invalid file format
 *       401:
 *         description: Unauthorized request
 *       500:
 *         description: Internal server error
 */
router.route('/update-avatar').patch(verifyJWT, upload.single('avatar'), updateAvatar)

/**
 * @swagger
 * /api/v1/users/update-aboutme:
 *   patch:
 *     summary: Update current user's bio/description
 *     description: Modifies the "About Me" bio field. Requires a valid JWT.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - aboutMe
 *             properties:
 *               aboutMe:
 *                 type: string
 *                 description: The new bio content
 *             example:
 *               aboutMe: "Coding is my life, let's chat!"
 *     responses:
 *       200:
 *         description: About Me updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: About Me is required
 *       401:
 *         description: Unauthorized request
 *       500:
 *         description: Internal server error
 */
router.route('/update-aboutme').patch(verifyJWT, updateAboutMe)

/**
 * @swagger
 * /api/v1/users/update-displayname:
 *   patch:
 *     summary: Update current user's display name
 *     description: Modifies the display name visible to other users. Requires a valid JWT.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - displayName
 *             properties:
 *               displayName:
 *                 type: string
 *                 description: The new display name
 *             example:
 *               displayName: "Johnny D"
 *     responses:
 *       200:
 *         description: Display Name updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Display Name is required
 *       401:
 *         description: Unauthorized request
 *       500:
 *         description: Internal server error
 */
router.route('/update-displayname').patch(verifyJWT, updateDisplayName)

export default router;