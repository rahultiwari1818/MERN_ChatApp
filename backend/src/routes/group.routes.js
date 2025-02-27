import express from "express";
import { verifyUser } from "../middlewares/auth.middleware";
import { addMembers, changeDescription, creategroup, getChat, removeAdmin, removeMembers } from "../controllers/group.controller";
const router = express.Router();

router.post("/createGroup",verifyUser,creategroup);

router.get("/getChat/:groupId",verifyUser,getChat);

router.post("/addMembers",verifyUser,addMembers);

router.put("/changeDescription",verifyUser,changeDescription);

router.patch("/removeMember",verifyUser,removeMembers);

router.patch("/removeAdmin",verifyUser,removeAdmin);

export default router;