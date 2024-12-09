import app from "../app.js"
import {Server} from "socket.io";
import {createServer} from "http";
import cors from "cors";



const server = createServer(app);
const io = new Server(server,{
    cors:{
        origin:"http://localhost:3000",
        methods:["GET","POST"],
        credentials:true
    }
});

app.use(cors());

io.on("connection",(socket)=>{
    console.log("socket id :", socket.id);

    socket.on("message",()=>{
        console.log("message");
    })

    socket.on("disconnect",()=>{
        
    })

})


export default server;