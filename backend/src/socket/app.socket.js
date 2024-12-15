import express from "express";
import {Server} from "socket.io";
import {createServer} from "http";

const app = express();


const server = createServer(app);
const io = new Server(server,{
    cors:{
        origin:"http://localhost:3000",
        methods:["GET","POST"],
        credentials:true
    }
});

export const getReceiverSocketId = (receiverId) => {
	return userSocketMap[receiverId];
};


const userSocketMap = {};


io.on("connection",(socket)=>{


    const userId = socket.handshake.query.userId;
	if (userId != "undefined") userSocketMap[userId] = socket.id;



    socket.on("disconnect",()=>{
        delete userSocketMap[userId];
    })

})


export  {server,io,app};