import Conversation from "../models/conversation.model.js";
import Messages from "../models/messages.models.js";
import { getReceiverSocketId, io, saveOfflineMessage } from "../socket/app.socket.js";

export const getMessages = async(req,res)=>{
    try {
        const {recipientId} = req.params;
        const senderId = req.user._id;

        const conversation = await Conversation.findOne({
			participants: { $all: [senderId, recipientId] },
		}).populate("messages"); // NOT REFERENCE BUT ACTUAL MESSAGES

		if (!conversation) return res.status(200).json({message:"Messages Fetched Successfully",
            data:[],
            result:true});

		const messages = conversation.messages;


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

        let conversation = await Conversation.findOne({
			participants: { $all: [senderId, recipient] },
		});

		if (!conversation) {
			conversation = await Conversation.create({
				participants: [senderId, recipient],
			});
		}

		const newMessage = new Messages({
			senderId,
			recipientId:recipient,
			message,
		});

		if (newMessage) {
			conversation.messages.push(newMessage._id);
		}

		// await conversation.save();
		// await newMessage.save();

		// this will run in parallel
		await Promise.all([conversation.save(), newMessage.save()]);



		const receiverSocketId = getReceiverSocketId(recipient);
		if (receiverSocketId) {
			io.to(receiverSocketId).emit("newMessage", newMessage);
		}
        else{
            saveOfflineMessage(newMessage);
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