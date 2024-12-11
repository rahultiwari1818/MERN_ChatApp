import { Router } from "express";
import { registerUser, sendOTP, verifyOTP } from "../controllers/user.controller.js";

const router = Router();

router.post("/register",registerUser);
router.post("/verifyUser",sendOTP);
router.post("/verifyOTP",verifyOTP);

export default router;
