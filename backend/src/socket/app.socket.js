import express from "express";
import {Server} from "socket.io";
import {createServer} from "http";
import jwt from "jsonwebtoken";
import User from "../models/users.models.js";
import { markAsRead } from "../controllers/messages.controller.js";
import Messages from "../models/messages.models.js";

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
            io.emit("userCameOnline",{
                _id:_id
            })
        };


        socket?.on("markMessageAsRead",(newmessage)=>{
            // call the controller to handle read messages

            markAsRead(newmessage?._id)
            const senderId = userSocketMap[newmessage?.senderId.toString()];
            socket.to(senderId).emit("messageHasBeenReaded",newmessage)
        })

        
        socket?.on("markConversationAsRead",async(data)=>{
            // call the controller to handle read messages
            try {
                const user = jwt.verify(data.token, process.env.SECRET_KEY);
                await Messages.updateMany(
                    { senderId: data.senderId, recipientId: user._id, readReceipts: { $ne: "read" } },
                    { $set: { readReceipts: "read" } }
                );
                socket.to(userSocketMap[data.senderId]).emit("wholeConversationIsReaded",{recipientId:user._id});
            } catch (error) {
                console.log(error,"Error While Marking Conversation as Readed.!")
            }
            
        })

        


        offlineMessages.forEach((message) => {
            if (message.recipientId === _id) {
                io.to(socket.id).emit("newMessage", message);
                offlineMessages.delete(message); // Remove after sending
            }
        });
        



        socket.on("disconnect",async()=>{
            console.log("User Disconnected : ",_id);
            if(!_id) return;
            io.emit("userGoneOffline",{
                _id:_id
            })
            await User.findByIdAndUpdate(_id, { lastSeen: Date.now() });
            delete userSocketMap[_id];
    
        })
    } catch (error) {
        console.log("Socket Error : ",error);
    }

    
    
	

})



export  {server,io,app};