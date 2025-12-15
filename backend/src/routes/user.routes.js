import { Router } from "express";
import { loginUser, registerUser } from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route('/login').post(loginUser)
router.route('/register').post(upload.single('avatar'), registerUser)
router.route('/refresh-token').post(verifyJWT, refreshAccessToken)
router.route('/logout').post(verifyJWT, logoutUser)


router.route('/update-avatar').patch(verifyJWT, upload.single('avatar'), updateAvatar)
router.route('/update-user').patch(verifyJWT, updateUser)
router.route('/change-password').post(verifyJWT, chagePassword)

export default router;