import { Router } from "express";
import { completeProfileSetup, getCurrentUser, loginUser, logoutUser, refreshAccessToken, registerUser, searchUsers, sendRegistrationOTP, updateAboutMe, updateAvatar, updateDisplayName } from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createTokenBucketLimiter } from "../middlewares/tokenBucket.middleware.js";

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management and authentication APIs
 */


const registerBucket = createTokenBucketLimiter({
    capacity: 5,
    refillIntervalSeconds: 180,
    keyGenerator: (req) => `${req.ip}_${req.body?.email || ""}`
});

const loginAttemptLimiter = createTokenBucketLimiter({
    capacity: 3,
    refillIntervalSeconds: 86400,
    keyGenerator: (req) => `login_attempt_${req.body?.email || req.ip}`,
    message: "Too many login attempts. Account temporarily locked for security. Please try again tomorrow."
});

const registerAttemptLimiter = createTokenBucketLimiter({
    capacity: 3,
    refillIntervalSeconds: 86400,
    keyGenerator: (req) => `register_attempt_${req.body?.email || req.ip}`,
    message: "Too many registration attempts. For security reasons, please try again tomorrow."
});

const sendOtpLimiter = createTokenBucketLimiter({
    capacity: 1,
    refillIntervalSeconds: 180,
    keyGenerator: (req) => `send_otp_${req.body?.email || req.ip}`,
    message: (retryAfter) => `Please wait ${retryAfter} second(s) before requesting another OTP.`
});

const sendOtpAttemptLimiter = createTokenBucketLimiter({
    capacity: 3,
    refillIntervalSeconds: 86400,
    keyGenerator: (req) => `send_otp_attempt_${req.body?.email || req.ip}`,
    message: "Daily limit reached for OTP requests (maximum 3 requests per day). Please try again tomorrow."
});

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
 * /api/v1/users/send-registration-otp:
 *   post:
 *     summary: Send OTP to user's email for registration
 *     description: Sends a one-time password (OTP) to the user's email address for verification during the registration process. Uses rate limiting to prevent abuse.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address of the user for verification
 *             example:
 *               email: [EMAIL_ADDRESS]
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       429:
 *         description: Rate limit exceeded. Too many requests. Please try again later.
 *       500:
 *         description: Internal server error
 */
router.route('/send-registration-otp').post(
    sendOtpLimiter,
    sendOtpAttemptLimiter,
    sendRegistrationOTP
)

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
router.route('/login').post(loginAttemptLimiter, loginUser)

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
router.route('/register').post(
    // registerBucket,
    registerAttemptLimiter,
    registerUser
)


router.route('/complete-profile-setup').post(
    verifyJWT,
    upload.single("avatar"),
    completeProfileSetup
)

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

/**
 * @swagger
 * /api/v1/users/find-users:
 *   get:
 *     summary: Search for users
 *     description: Searches for users by display name or username.
 *     tags: [Users]
 *     security: 
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         required: true
 *         description: The search query
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         required: false
 *         description: Maximum number of users to return
 *     responses:
 *       200:
 *         description: Users found successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Query is required
 *       500:
 *         description: Internal server error
 */
router.route('/find-users').get(verifyJWT, searchUsers);

export default router;