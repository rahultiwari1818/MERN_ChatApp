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



io.on("connection",(socket)=>{



    socket.on("message",()=>{
        console.log("message");
    })


    socket.on("disconnect",()=>{
        
    })

})


export  {server,io,app};