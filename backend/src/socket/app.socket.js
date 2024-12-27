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

export const isUserOnline = (userId) =>{
    return userSocketMap[userId] ? true : false;
}


io.on("connection",(socket)=>{

    const userToken = socket.handshake?.auth?.userId;
    let _id = "";
    try {
        if(userToken){
            const decoded = jwt.verify(userToken, process.env.SECRET_KEY); // Replace SECRET_KEY with your key
            _id = decoded._id;
            userSocketMap[_id] = socket.id; 
            console.log("User Connected :",_id);
        };

        offlineMessages.forEach((message) => {
            if (message.recipientId === _id) {
                io.to(socket.id).emit("newMessage", message);
                offlineMessages.delete(message); // Remove after sending
            }
        });

        socket.on("disconnect",async()=>{
            console.log("User Disconnected : ",_id);
            if(!_id) return;
            await User.findByIdAndUpdate(_id, { lastSeen: Date.now() });
            delete userSocketMap[_id];
    
        })
    } catch (error) {
        console.log("Socket Error : ",error);
    }
	

})


export  {server,io,app};