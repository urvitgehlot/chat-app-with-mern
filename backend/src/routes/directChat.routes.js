import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createDirectChat, getRecentChats, getUserDirectChats } from "../controllers/directChat.controllers.js";

const router = Router();

router.route("/create-direct-chat").post(verifyJWT, createDirectChat);
router.route("/get-recent-chats").get(verifyJWT, getRecentChats);

export default router;