import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import jwt from "jsonwebtoken";
import User from "../models/users.models.js";
import Group from "../models/group.model.js";
import { markAsRead } from "../controllers/messages.controller.js";
import Messages from "../models/messages.models.js";

const app = express();

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const userSocketMap = {};
const offlineMessages = new Set();

export const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};

export const saveOfflineMessage = (message) => {
  offlineMessages.add(message);
};

export const isUserOnline = (userId) => {
  return userSocketMap[userId] ? true : false;
};

io.on("connection", (socket) => {
  const userToken = socket.handshake?.auth?.userId;
  let _id = "";
  try {

    if (userToken) {
      const decoded = jwt.verify(userToken, process.env.SECRET_KEY); // Replace SECRET_KEY with your key
      _id = decoded._id;
      userSocketMap[_id] = socket.id;
      console.log("User Connected :", _id);
      io.emit("userCameOnline", {
        _id: _id,
      });
    } else {
      console.log("socket disconnected...!", userToken);
      socket.disconnect();
    }

    socket?.on("markMessageAsRead", (newmessage) => {
      // call the controller to handle read messages

      markAsRead(newmessage?._id);
      const senderId = userSocketMap[newmessage?.senderId.toString()];
      socket.to(senderId).emit("messageHasBeenReaded", newmessage);
    });

    socket?.on("markConversationAsRead", async (data) => {
      // call the controller to handle read messages
      try {
        const user = jwt.verify(data.token, process.env.SECRET_KEY);
        await Messages.updateMany(
          {
            senderId: data.senderId,
            recipientId: user._id,
            readReceipts: { $ne: "read" },
          },
          { $set: { readReceipts: "read" } }
        );
        socket
          .to(userSocketMap[data.senderId])
          .emit("wholeConversationIsReaded", { recipientId: user._id });
      } catch (error) {
        console.log(error, "Error While Marking Conversation as Readed.!");
      }
    });

    socket?.on("loggedIn",()=>{
        console.log("loggedin")
    })

    socket?.on("typing", async (data) => {
      try {
        const user = jwt.verify(data.token, process.env.SECRET_KEY);
        if (data?.isGroup) {
          const groupDetails = await Group.findById(data._id);
          groupDetails?.members?.forEach((member) => {
            if (member?.userId.toString() === user._id) return;

            if (isUserOnline(member?.userId.toString())) {
              socket
                ?.to(userSocketMap[member?.userId.toString()])
                ?.emit("recipientTyping", {
                  _id: data._id,
                  name: user.name,
                  isTyping: data?.isTyping,
                });
            }
          });
        } else {
          if (isUserOnline(data?._id)) {
            socket?.to(userSocketMap[data?._id])?.emit("recipientTyping", {
              _id: user._id,
              isTyping: data?.isTyping,
            });
          }
        }
      } catch (error) {
        console.log(error, "Error While Marking Conversation as Readed.!");
      }
    });

    offlineMessages.forEach(async (message) => {
      // console.log(message,offlineMessages)
      // if (message.recipientId?.toString() === _id) {
      //     io.to(userSocketMap[_id]).emit("newMessage", message);
      //     offlineMessages.delete(message); // Remove after sending
      // }
      if (message.recipientId.toString() === _id) {
        const updatedMessage = await Messages.findByIdAndUpdate(message._id, {
          readReceipts: "delivered",
        });
        io.to(userSocketMap[message.senderId.toString()]).emit(
          "updateReadReceipt",
          updatedMessage
        );
        offlineMessages.delete(message); // Remove after updating read receipt
      }
    });

    socket?.on("logout", async () => {
      console.log("User Disconnected : ", _id);
      socket.disconnect();
      if (!_id) return;
      io.emit("userGoneOffline", {
        _id: _id,
      });
      await User.findByIdAndUpdate(_id, { lastSeen: Date.now() });
      delete userSocketMap[_id];
    });

    socket.on("disconnect", async () => {
      console.log("User Disconnected : ", _id);
      if (!_id) return;
      io.emit("userGoneOffline", {
        _id: _id,
      });
      await User.findByIdAndUpdate(_id, { lastSeen: Date.now() });
      delete userSocketMap[_id];
    });

  } catch (error) {
    console.log("Socket Error : ", error);
    socket.disconnect();
  }
});

export { server, io, app };
