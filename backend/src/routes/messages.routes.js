import express from "express";
import { verifyUser } from "../middlewares/auth.middleware.js";
import { deleteMessage, getMessages, sendMessage , clearChat, deleteForEveryone, deleteMedia } from "../controllers/messages.controller.js";
import { isBlocked } from "../middlewares/isBlocked.middleware.js";
const router = express.Router();
import multer from 'multer';
import { storage } from "../config/cloudinary.config.js";

const upload = multer({ storage: storage });


router.post("/sendMessage",verifyUser,upload.array("media",10),isBlocked,sendMessage);
router.get("/getAllMessages/:recipientId",verifyUser,getMessages);

router.delete("/:messageId",verifyUser,deleteMessage);

router.delete("/deleteForEveryone/:messageId",verifyUser,deleteForEveryone);

router.delete("/clearChat/:friendId",verifyUser,clearChat)



router.delete("/deleteMedia/:id",verifyUser,deleteMedia)


export default router;