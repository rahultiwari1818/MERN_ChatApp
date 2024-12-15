import express from "express";
import { verifyUser } from "../middlewares/auth.middleware.js";
import { getMessages, sendMessage } from "../controllers/messages.controller.js";
const router = express.Router();

router.post("/sendMessage",verifyUser,sendMessage);
router.get("/getAllMessages/:recipientId",verifyUser,getMessages);

export default router;