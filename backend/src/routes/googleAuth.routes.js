import express from "express";
import { googleAuth } from "../controllers/googleAuth.controller.js";

const router = express.Router();

router.get("/google",googleAuth);

export default router;