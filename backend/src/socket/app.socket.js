import express from "express";
import {Server} from "socket.io";
import {createServer} from "http";
import jwt from "jsonwebtoken";
import User from "../models/users.models.js";

const app = express();


const server = createServer(app);
const io = new Server(server,{
    cors:{
        origin:process.env.CLIENT_URL,
        methods:["GET","POST"],
        credentials:true
    }
});

const userSocketMap = {};
const offlineMessages = new Set();


export const getReceiverSocketId = (receiverId) => {
	return userSocketMap[receiverId];
};

export const saveOfflineMessage = (message) =>{
    offlineMessages.add(message);
}



io.on("connection",(socket)=>{


    const userToken = socket.handshake?.auth?.userId;
    let _id = "";
    try {
        if(userToken != "undefined"){
            const decoded = jwt.verify(userToken, process.env.SECRET_KEY); // Replace SECRET_KEY with your key
            _id = decoded._id;
            userSocketMap[_id] = socket.id; 
        };
        const userMessages = new Set();
        for(let message of offlineMessages){
            if(message.recipientId === _id){
                io.to(recipientId).emit("newMessage",message);
                userMessages.add(message._id);
            }
        }
        socket.on("disconnect",async()=>{
            await User.findByIdAndUpdate(_id, { lastSeen: Date.now() });
            delete userSocketMap[_id];
    
        })
    } catch (error) {
        console.log("Socket Error : ",error);
    }
	

})


export  {server,io,app};