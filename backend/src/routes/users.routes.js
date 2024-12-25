import express from "express";
import { loginUser, registerUser, sendOTP, verifyOTP,getUserDetails, inviteFriend, getUsers } from "../controllers/user.controller.js";
import { verifyUser } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register",registerUser);
router.post("/verifyUser",sendOTP);
router.post("/verifyOTP",verifyOTP);
router.post("/login",loginUser);

router.get("/profile",verifyUser,getUserDetails);

router.post("/inviteFriend",verifyUser,inviteFriend);

router.get("/getUsers",verifyUser,getUsers);

export default router;
