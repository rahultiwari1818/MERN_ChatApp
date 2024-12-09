import connectToMongo from "./config/mongodb.config.js";
import server from "./socket/app.socket.js";

const port = process.env.PORT;

connectToMongo();

server.listen(port,()=>{
    console.log("Backend is Running");
})