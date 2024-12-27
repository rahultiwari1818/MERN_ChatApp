import express from "express";
import { loginUser, registerUser, sendOTP, verifyOTP,getUserDetails, inviteFriend, getUsers, changeProfilePic } from "../controllers/user.controller.js";
import { verifyUser } from "../middlewares/auth.middleware.js";
import multer from 'multer';
import { storage } from "../config/cloudinary.config.js";

const upload = multer({ storage: storage });


const router = express.Router();

router.post("/register",registerUser);
router.post("/verifyUser",sendOTP);
router.post("/verifyOTP",verifyOTP);
router.post("/login",loginUser);

router.get("/profile",verifyUser,getUserDetails);

router.post("/inviteFriend",verifyUser,inviteFriend);

router.get("/getUsers",verifyUser,getUsers);

router.patch("/changeProfilePic",verifyUser,upload.single("photo"),changeProfilePic);

export default router;
