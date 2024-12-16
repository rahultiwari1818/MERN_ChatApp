import express from "express";
import {Server} from "socket.io";
import {createServer} from "http";
import jwt from "jsonwebtoken";

const app = express();


const server = createServer(app);
const io = new Server(server,{
    cors:{
        origin:"http://localhost:3000",
        methods:["GET","POST"],
        credentials:true
    }
});

const userSocketMap = {};
const offlineMessages = [];


export const getReceiverSocketId = (receiverId) => {
	return userSocketMap[receiverId];
};

export const saveOfflineMessage = (message) =>{
    offlineMessages.push(message);
}



io.on("connection",(socket)=>{


    const userToken = socket.handshake.auth.userId;
    let userId = "";
	if(userToken != "undefined"){
        const decoded = jwt.verify(userToken, process.env.SECRET_KEY); // Replace SECRET_KEY with your key
        userId = decoded._id;
        userSocketMap[userId] = socket.id; 
    };

    socket.on("disconnect",()=>{
        delete userSocketMap[userId];
    })

})


export  {server,io,app};