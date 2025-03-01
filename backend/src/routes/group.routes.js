import express from "express";
import { verifyUser } from "../middlewares/auth.middleware.js";
import { addMembers, changeDescription, creategroup, getChat, removeAdmin, removeMembers } from "../controllers/group.controller.js";
const router = express.Router();
import multer from 'multer';
import { storage } from "../config/cloudinary.config.js";

const upload = multer({ storage: storage });



router.post("/createGroup",verifyUser,upload.single("groupImage"),creategroup);

router.get("/getChat/:groupId",verifyUser,getChat);

router.post("/addMembers",verifyUser,addMembers);

router.put("/changeDescription",verifyUser,changeDescription);

router.patch("/removeMember",verifyUser,removeMembers);

router.patch("/removeAdmin",verifyUser,removeAdmin);

export default router;