import express from "express";
import { verifyUser } from "../middlewares/auth.middleware.js";
import { addMembers, changeDescription, creategroup, deleteGroupMessage, getChat, removeAdmin, removeMembers, sendGroupMessage } from "../controllers/group.controller.js";
const router = express.Router();
import multer from 'multer';
import { storage } from "../config/cloudinary.config.js";

const upload = multer({ storage: storage });



router.post("/createGroup",verifyUser,upload.single("groupImage"),creategroup);

router.post("/groups/:groupId/messages", verifyUser, sendGroupMessage);

router.get("/groups/:groupId/messages", verifyUser, getChat); 

router.delete("/groups/messages/:messageId", verifyUser,deleteGroupMessage);

router.post("/addMembers",verifyUser,addMembers);

router.put("/changeDescription",verifyUser,changeDescription);

router.patch("/removeMember",verifyUser,removeMembers);

router.patch("/removeAdmin",verifyUser,removeAdmin);

export default router;