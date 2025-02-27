import Conversation from "../models/conversation.model.js";
import Messages from "../models/messages.models.js";
import { getReceiverSocketId, io, saveOfflineMessage } from "../socket/app.socket.js";

export const getMessages = async (req, res) => {
    try {
        const { recipientId } = req.params;
        const senderId = req.user._id;

        const conversation = await Conversation.findOne({
            participants: { $all: [senderId, recipientId] },
        }).populate("messages"); // NOT REFERENCE BUT ACTUAL MESSAGES

        if (!conversation) return res.status(200).json({
            message: "Messages Fetched Successfully",
            data: [],
            result: true
        });

        const messages = conversation.messages;


        const formattedMessages = messages.map(message => ({
            ...message.toObject(), // Convert Mongoose document to plain JS object
            isSender: message.senderId.toString() === senderId.toString() // Compare IDs as strings
        }));


        return res.status(200).json({
            message: "Messages Fetched Successfully",
            data: formattedMessages,
            result: true
        });

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            error
        })
    }
}

export const sendMessage = async (req, res) => {
    try {

        const { message, recipient } = req.body;
        const senderId = req.user._id;

        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, recipient] },
        });

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [senderId, recipient],
            });
        }
        const receiverSocketId = getReceiverSocketId(recipient);
        const newMessage = new Messages({
            senderId,
            recipientId: recipient,
            message,
            isSent:true,
            isReceived:receiverSocketId?true:false
        });

        if (newMessage) {
            conversation.messages.push(newMessage._id);
        }

        // await conversation.save();
        // await newMessage.save();

        // this will run in parallel
        await Promise.all([conversation.save(), newMessage.save()]);

        const populatedMessage = await Messages.findById(newMessage._id)
            .populate("senderId", "name profilePic")
            .lean(); // Converts Mongoose document to plain JavaScript object

        const messageToBeSent = {
            ...populatedMessage,
            senderName: populatedMessage.senderId.name,
            senderProfilePic: populatedMessage.senderId.profilePic,
            senderId:populatedMessage.senderId._id
        };


        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", messageToBeSent);
        }
        else {
            saveOfflineMessage(messageToBeSent);
        }


        return res.status(201).json({
            message: "Message Sent Successfully",
            result: true,
            data:newMessage
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            error
        })
    }
}

export const deleteMessage = async (req, res) => {
    try {

        const { messageId } = req.params; // Assuming the message ID is passed as a route parameter

        if (!messageId) {
            return res.status(400).json({
                message: "Message ID is required",
                result: false,
            });
        }

        // Find and delete the message
        const deletedMessage = await Messages.findByIdAndDelete(messageId);

        if (!deletedMessage) {
            return res.status(404).json({
                message: "Message not found",
                result: false,
            });
        }

        return res.status(200).json({
            message: "Message Deleted Successfully",
            result: true,
            data: deletedMessage, // Optionally return the deleted message
        });

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            error
        })
    }
}