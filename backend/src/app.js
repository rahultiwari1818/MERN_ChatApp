import dotenv from "dotenv"
dotenv.config();
import express from "express";
import { verifyUser } from "./middlewares/auth.middleware.js";
import { getMessages } from "./controllers/messages.controller.js";


const app = express();


app.use("/api/v1/messages/:senderId/:recipientId",verifyUser,getMessages)




export default app;