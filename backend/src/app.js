import express from "express";
import { verifyUser } from "./middlewares/auth.middleware.js";
import { getMessages } from "./controllers/messages.controller.js";
import  userRouter from "./routes/users.routes.js";
import cors from "cors";
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use("/api/v1/messages/:senderId/:recipientId",verifyUser,getMessages)

app.use("/api/v1/users",userRouter);




export default app;