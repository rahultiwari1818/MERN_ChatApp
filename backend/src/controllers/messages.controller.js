import { deleteFromCloudinary, uploadToCloudinary } from "../config/cloudinary.config.js";
import Conversation from "../models/conversation.model.js";
import Messages from "../models/messages.models.js";
import User from "../models/users.models.js";
import {
  getReceiverSocketId,
  io,
  isUserOnline,
  saveOfflineMessage,
} from "../socket/app.socket.js";

export const getMessages = async (req, res) => {
  try {
    const { recipientId } = req.params;
    const senderId = req.user._id;

    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, recipientId] },
    }).populate({
      path: "messages",
      populate: { path: "senderId", select: "name profilePic" }, // Ensuring sender details are populated
    });

    if (!conversation) {
      return res.status(200).json({
        message: "Messages Fetched Successfully",
        data: [],
        result: true,
      });
    }

    const messages = conversation.messages || [];

    // Convert to plain objects and filter deleted messages
    const formattedMessages = messages
      .map((message) => ({
        ...message.toObject(),
        isSender: message.senderId._id.toString() === senderId.toString(),
      }))
      .filter((message) => {
        let flag = false;
        for (const obj of message.deletedFor) {
          flag = obj.toString() === senderId;
          if (flag) break;
        }
        return !flag;
      });

    return res.status(200).json({
      message: "Messages Fetched Successfully",
      data: formattedMessages,
      result: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { message, recipient } = req.body;
    const senderId = req.user._id;

    const medias = req.files;

    if (!message && (!medias || medias.length === 0)) {
      return res
        .status(400)
        .json({ error: "Either message or media is required" });
    }

    const mediaURLs = [];

    for (let media of medias) {
      try {
        // Assuming the `uploadToCloudinary` function takes a buffer and mimetype or other necessary data
        const result = await uploadToCloudinary(media.path, media.mimetype);

        // Check if the upload was successful (based on your Cloudinary response structure)
        if (result.message === "Fail") {
          return res.status(500).json({
            message: "Some Error Occurred...",
            result: false,
          });
        }

        // Push the URL of the uploaded media to the mediaURLs array
        mediaURLs.push({ url: result.url, type: media.mimetype });
      } catch (error) {
        // Handle any errors that occur during the upload
        return res.status(500).json({
          message: "Error uploading media to Cloudinary",
          error: error.message,
        });
      }
    }

    // At this point, `mediaURLs` should contain the URLs of all uploaded media

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, recipient] },
    });

    const newMessage = new Messages({
      senderId,
      recipientId: recipient,
      message,
      media: mediaURLs,
      readReceipts: isUserOnline(recipient) ? "delivered" : "sent",
    });

    await newMessage.save();

    let isNewConversation = false;
    if (!conversation) {
      isNewConversation = true;
      conversation = await Conversation.create({
        participants: [senderId, recipient],
        lastMessage: newMessage._id,
        lastMessageTime: Date.now(),
      });
    }

    conversation.lastMessage = newMessage._id;
    conversation.messages.push(newMessage._id);
    conversation.lastMessageTime = Date.now();

    await Promise.all([conversation.save()]);

    const populatedMessage = await Messages.findById(newMessage._id)
      .populate("senderId", "name profilePic")
      .lean();

    const messageToBeSent = {
      ...populatedMessage,
      senderName: populatedMessage.senderId.name,
      senderProfilePic: populatedMessage.senderId.profilePic,
      senderId: populatedMessage.senderId._id,
      isNewConversation,
    };

    const receiverSocketId = getReceiverSocketId(recipient);

    if (isNewConversation) {
      const user = await User.findById(req.user._id);
      const newConversation = {
        _id: req.user?._id,
        name: user?.name || "Unknown",
        email: user?.email || "",
        profilePic: user?.profilePic || "",
        // messages: conv.messages || [],
        lastSeen: user?.lastSeen,
        lastMessage: message,
        lastMessageTime: Date.now(),
        isBlocked: false,
        hasBlocked: false,
        isOnline: isUserOnline(req.user?._id),
      };
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newConversationStarted", newConversation);
      }
    }

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", messageToBeSent);
    } else {
      saveOfflineMessage(messageToBeSent);
    }
    messageToBeSent.isSender = true;
    return res.status(201).json({
      message: "Message Sent Successfully",
      result: true,
      data: messageToBeSent,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params; // Assuming the message ID is passed as a route parameter
    const userId = req.user._id;
    if (!messageId) {
      return res.status(400).json({
        message: "Message ID is required",
        result: false,
      });
    }

    // Find and delete the message

    const message = await Messages.findById({ _id: messageId });
    if (message.deletedFor.includes(userId)) {
      return res.status(200).json({
        message: "Message already deleted",
        result: true,
      });
    }

    // Soft delete: Add user to deletedFor array
    message.deletedFor.push(userId);
    await message.save();

    const conversation = await Conversation.findOne({
      participants: { $all: [message.senderId, message.receiverId] },
    });

    

    return res.status(200).json({
      message: "Message Deleted Successfully",
      result: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error,
    });
  }
};

export const deleteForEveryone = async (req, res) => {
  try {
    const { messageId } = req.params; // Assuming the message ID is passed as a route parameter
    const userId = req.user._id;

    if (!messageId) {
      return res.status(400).json({
        message: "Message ID is required",
        result: false,
      });
    }

    // Find and delete the message

    const message = await Messages.findById({ _id: messageId });
    if(message.senderId.toString() !== userId){
      return res.status(402).json({
        message:"Unauthiorized User.!"
      })
    }
    if (message.deletedFor.includes(userId)) {
      return res.status(200).json({
        message: "Message already deleted",
        result: true,
      });
    }

    const conversation = await Conversation.findOne({
      participants: { $all: [message.senderId, message.receiverId] },
    }).populate("messages")
    ;

    // if(conversation.lastMessage._id === message._id){
    //   if(conversation.messages.length > 1){
    //     const n = conversation.messages.length;
    //     let flag = false;
    //     for(const i=n-1;i>=0;i--){
    //       if(conversation.messages[i].deletedFor.length == 0){
    //         conversation.lastMessage = conversation.messages[i]._id;
    //         flag = true;
    //         await conversation.save();
    //         break;
    //       }
    //     }
    //     if(!flag){
    //       conversation.lastMessage = null;
    //       await conversation.save();
    //     }
    //   }
    //   else{
    //      conversation.lastMessage = null;
    //      await conversation.save();
    //   }
    // }

    // Soft delete: Add user to deletedFor array
    message.deletedFor.push(userId);
    message.deletedFor.push(message.recipientId);
    await message.save();

    if(isUserOnline(message.recipientId)){
      io.to(getReceiverSocketId(message.recipientId)).emit("messageDeletedForEveryone",{
        senderId:userId,
        messageId:messageId
      })
    }

    return res.status(200).json({
      message: "Message Deleted Successfully",
      result: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const clearChat = async (req, res) => {
  try {
    const userId = req.user._id; // Extract user from verified token
    const { friendId } = req.params;

    if (!userId || !friendId) {
      return res
        .status(400)
        .json({ error: "User ID and friend ID are required." });
    }

    const conversation = await Conversation.findOne({
      participants: { $all: [userId, friendId] },
    });

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found." });
    }

    await Messages.updateMany(
      { _id: { $in: conversation.messages } },
      { $addToSet: { deletedFor: userId } }
    );

    await Messages.deleteMany({
      _id: { $in: conversation.messages },
      deletedFor: { $size: 2 }, // Message deleted for both users
    });

    const lastMessage = conversation.messages.at(-1);

    await Conversation.findByIdAndUpdate(conversation._id, {
      lastMessage: lastMessage,
      lastMessageTime: Date.now(),
    });

    return res
      .status(200)
      .json({ message: "Chat cleared successfully.", result: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error,
    });
  }
};

export const markAsRead = async (messageId) => {
  try {
    if (!messageId) {
      return res.status(400).json({ error: "Message ID is required" });
    }

    const updatedMessage = await Messages.findByIdAndUpdate(
      messageId,
      { readReceipts: "read" },
      { new: true }
    );

    if (!updatedMessage) {
      return res.status(404).json({ error: "Message not found" });
    }

    //   return res.status(200).json({
    //     message: "Message marked as read",
    //     result: true,
    //     data: updatedMessage,
    //   });
  } catch (error) {
    console.log("Error in markAsRead:", error);
    // return res.status(500).json({ error: "Internal Server Error" });
  }
};


export const deleteMedia = async(req,res) =>{
  try {
    
    const { mediaUrl } = req.body;

    if (!mediaUrl) {
      return res.status(400).json({ message: "mediaUrl is required" });
    }

    const messageId = req.params.id;

    const publicId = mediaUrl
      .split("/")
      .slice(-1)[0]
      .split(".")[0];

    await deleteFromCloudinary(publicId);

    const updatedMessage = await Messages.findByIdAndUpdate(
      messageId,
      { $pull: { media: { url: mediaUrl } } },
      { new: true }
    );

    return res.status(200).json({
      message: "Media deleted successfully",
      result: true,
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error,
    });
  }
}

