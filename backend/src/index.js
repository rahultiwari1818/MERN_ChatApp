import 'dotenv/config.js'
import express from "express";
import connectToMongo from "./config/mongodb.config.js";
import  {connectToRedis}  from "./config/redis.config.js";
import {server,app} from "./socket/app.socket.js";
import  userRouter from "./routes/users.routes.js";
import  messageRouter from "./routes/messages.routes.js";
import cors from "cors";
const port = process.env.PORT;



connectToMongo();
connectToRedis();




app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use('/uploads', express.static('uploads'));


app.use("/api/v1/users",userRouter);
app.use("/api/v1/messages",messageRouter);





server.listen(port,()=>{
    console.log("Backend is Running");
})