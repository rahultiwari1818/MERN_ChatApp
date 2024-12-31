import express from "express";
import { verifyUser } from "../middlewares/auth.middleware.js";
import { deleteMessage, getMessages, sendMessage } from "../controllers/messages.controller.js";
import { isBlocked } from "../middlewares/isBlocked.middleware.js";
const router = express.Router();

router.post("/sendMessage",verifyUser,isBlocked,sendMessage);
router.get("/getAllMessages/:recipientId",verifyUser,getMessages);
router.delete("/:messageId",verifyUser,deleteMessage);

export default router;