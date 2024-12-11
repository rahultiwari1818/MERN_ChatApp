import dotenv from "dotenv"
dotenv.config();

import connectToMongo from "./config/mongodb.config.js";
import  {connectToRedis}  from "./config/redis.config.js";
import server from "./socket/app.socket.js";

const port = process.env.PORT;



connectToMongo();
connectToRedis();

server.listen(port,()=>{
    console.log("Backend is Running");
})