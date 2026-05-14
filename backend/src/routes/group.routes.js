import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createGroup, getUserAllGroups } from "../controllers/group.controllers.js";

const router = Router();

router.route('/create-group').post(verifyJWT, createGroup)
router.route('/get-user-groups').get(verifyJWT, getUserAllGroups)

export default router;