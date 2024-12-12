import express from "express";
import { loginUser, registerUser, sendOTP, verifyOTP } from "../controllers/user.controller.js";

const router = express.Router();

router.post("/register",registerUser);
router.post("/verifyUser",sendOTP);
router.post("/verifyOTP",verifyOTP);
router.post("/login",loginUser);

export default router;
