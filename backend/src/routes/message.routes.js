import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { getUserAllMessages, sendMessage } from "../controllers/message.controllers.js";

const router = Router()

router.route('/send-message').post(upload.array('attachments', 10), sendMessage)

// router.route('get-user-message').get(verifyJWT, getUserMessage);

router.route('/get-user-all-message').get(verifyJWT, getUserAllMessages)

// router.route('get-new-message').get()

export default router