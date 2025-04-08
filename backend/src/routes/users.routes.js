import express from "express";
import { loginUser, registerUser, sendOTP, verifyOTP,getUserDetails, inviteFriend, getUsers, changeProfilePic, blockUser, unblockUser,resetPassword, getConversations, getAllUsers, updateName } from "../controllers/user.controller.js";
import { verifyUser } from "../middlewares/auth.middleware.js";
import multer from 'multer';
import { storage } from "../config/cloudinary.config.js";
import checkUserExistsMiddleware from "../middlewares/checkUserExists.middleware.js";

const upload = multer({ storage: storage });


const router = express.Router();

router.post("/register",registerUser);
router.post("/verifyUser",sendOTP);
router.post("/verifyOTP",verifyOTP);
router.post("/login",loginUser);

router.post("/forgotPassword",checkUserExistsMiddleware,sendOTP);

router.post("/resetPassword",verifyUser,resetPassword);

router.get("/profile",verifyUser,getUserDetails);

router.post("/inviteFriend",verifyUser,inviteFriend);

router.get("/getUsers",verifyUser,getUsers);

router.get("/getConversations",verifyUser,getConversations);

router.get("getAllUsers",verifyUser,getAllUsers);

router.patch("/changeProfilePic",verifyUser,upload.single("photo"),changeProfilePic);

router.patch("/blockUser/:userIdToBlock",verifyUser,blockUser);
router.patch("/unblockUser/:userIdToUnblock",verifyUser,unblockUser);

router.patch("/updateName",verifyUser,updateName);


export default router;
