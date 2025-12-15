import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/multer.middleware";
import { sendMessage } from "../controllers/message.controllers";

const router = Router()

use(verifyJWT)

router.route('send-message').post(upload.array('attachments',10), sendMessage)
router.route('get-all-message').get()

router.route('get-new-message').get()

export default router