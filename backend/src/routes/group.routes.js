import express from "express";
import { verifyUser } from "../middlewares/auth.middleware.js";
import { addMembers, changeDescription, changeGroupIcon, clearGroupChat, creategroup, deleteGroupMessage, deleteGroupMessageForEveryone, deleteMedia, getChat, leaveGroup, makeAdmin, removeAdmin, removeMembers, sendGroupMessage } from "../controllers/group.controller.js";
const router = express.Router();
import multer from 'multer';
import { storage } from "../config/cloudinary.config.js";
import verifyAdmin from "../middlewares/verifyAdmin.middleware.js";

const upload = multer({ storage: storage });



router.post("/createGroup",verifyUser,upload.single("groupImage"),creategroup);

router.post("/sendMessage", verifyUser,upload.array("media",10), sendGroupMessage);

router.get("/:groupId/getMessages", verifyUser, getChat); 

router.delete("/deleteGroupMessage/:messageId", verifyUser,deleteGroupMessage);


router.delete("/deleteGroupMessage/deleteForEveryone/:messageId", verifyUser,deleteGroupMessageForEveryone);

router.post("/addMembers/:groupId",verifyUser,verifyAdmin,addMembers);

router.put("/changeDescription/:groupId",verifyUser,verifyAdmin,changeDescription);

router.patch("/removeMember/:groupId",verifyUser,verifyAdmin,removeMembers);

router.patch("/leaveGroup/:groupId",verifyUser,leaveGroup);

router.patch("/removeAdmin/:groupId",verifyUser,verifyAdmin,removeAdmin);

router.patch("/makeAdmin/:groupId",verifyUser,verifyAdmin,makeAdmin)

router.delete("/clearGroupChat/:groupId",verifyUser,clearGroupChat);

router.patch("/changeGroupIcon/:groupId",verifyUser,verifyAdmin,upload.single("photo"),changeGroupIcon);

router.delete("/deleteMedia/:id",verifyUser,deleteMedia)


export default router;