import Messages from "../models/messages.models.js";
import { getReceiverSocketId } from "../socket/app.socket.js";

export const getMessages = async(req,res)=>{
    try {
        const {recipientId} = req.params;
        const senderId = req.user._id;
        const messages = await Messages.find({
            $or: [
              { senderId: senderId, recipientId: recipientId },
              { senderId: recipientId, recipientId: senderId } 
            ]
          }).sort({ timestamp: 1 });

          const formattedMessages = messages.map(message => ({
            ...message.toObject(), // Convert Mongoose document to plain JS object
            isSender: message.senderId.toString() === senderId.toString() // Compare IDs as strings
          }));
        

		return res.status(200).json({
            message:"Messages Fetched Successfully",
            data:formattedMessages,
            result:true
        });
        
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            error
        })    
    }
}

export const sendMessage = async(req,res) =>{
    try {
        
        const { message,recipient } = req.body;
		const senderId = req.user._id;

		const newMessage = await  new Messages({
            senderId,
            recipientId:recipient,
            message
        }).save();




		const receiverSocketId = getReceiverSocketId(recipient);
		if (receiverSocketId) {
			io.to(receiverSocketId).emit("newMessage", newMessage);
		}


        return res.status(201).json({
            message:"Message Sent Successfully",
            result:true
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            error
        })    
    }
}