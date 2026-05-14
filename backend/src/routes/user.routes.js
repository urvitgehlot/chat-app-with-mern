import { Router } from "express";
import { getCurrentUser, loginUser, logoutUser, refreshAccessToken, registerUser, updateAboutMe, updateAvatar, updateDisplayName } from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route('/login').post(loginUser)
router.route('/register').post(registerUser)
router.route('/logout').post(verifyJWT, logoutUser)
router.route('/refresh-token').post(refreshAccessToken)
router.route('/current-user').get(verifyJWT, getCurrentUser)

router.route('/update-avatar').patch(verifyJWT, upload.single('avatar'), updateAvatar)
router.route('/update-aboutme').patch(verifyJWT, updateAboutMe)
router.route('/update-displayname').patch(verifyJWT, updateDisplayName)

// Social Logins
// router.route('/google-login').post(loginUserUsingGoogle)
// router.route('/github-login').post(loginUserUsingGitHub)
// router.route('/google/callback').get(loginUserUsingGoogle)
// router.route('/github/callback').get(loginUserUsingGitHub)

// router.route('/update-avatar').patch(verifyJWT, upload.single('avatar'), updateAvatar)
// router.route('/update-user').patch(verifyJWT, updateUser)
// router.route('/change-password').post(verifyJWT, chagePassword)

export default router;