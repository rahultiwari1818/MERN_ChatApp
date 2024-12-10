import app from "../app.js"
import {Server} from "socket.io";
import {createServer} from "http";
import cors from "cors";
import Messages from "../models/messages.models.js";



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

    socket.on("private_message", async ({ senderId, recipientId, message }) => {
        try {
            // Save the message to the database
            const newMessage = new Messages({ senderId, recipientId, message });
            await newMessage.save();

            // Emit the message to the recipient
            io.to(recipientId).emit("private_message", { senderId, message });
        } catch (err) {
            console.error("Error saving message:", err);
        }
    });


    socket.on("message",()=>{
        console.log("message");
    })


    socket.on("disconnect",()=>{
        
    })

})


export default server;