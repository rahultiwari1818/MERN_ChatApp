import express from "express";
import { verifyUser } from "../middlewares/auth.middleware.js";
import { addMembers, changeDescription, clearGroupChat, creategroup, deleteGroupMessage, getChat, makeAdmin, removeAdmin, removeMembers, sendGroupMessage } from "../controllers/group.controller.js";
const router = express.Router();
import multer from 'multer';
import { storage } from "../config/cloudinary.config.js";
import verifyAdmin from "../middlewares/verifyAdmin.middleware.js";

const upload = multer({ storage: storage });



router.post("/createGroup",verifyUser,upload.single("groupImage"),creategroup);

router.post("/sendMessage", verifyUser,upload.array("media",10), sendGroupMessage);

router.get("/:groupId/getMessages", verifyUser, getChat); 

router.delete("/deleteGroupMessage/:messageId", verifyUser,deleteGroupMessage);

router.post("/addMembers",verifyUser,addMembers);

router.put("/changeDescription/:groupId",verifyUser,verifyAdmin,changeDescription);

router.patch("/removeMember/:groupId",verifyUser,verifyAdmin,removeMembers);

router.patch("/removeAdmin/:groupId",verifyUser,verifyAdmin,removeAdmin);

router.patch("/makeAdmin/:groupId",verifyUser,verifyAdmin,makeAdmin)

router.delete("/clearGroupChat/:groupId",verifyUser,clearGroupChat);

export default router;