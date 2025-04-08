import { deleteFromCloudinary, uploadToCloudinary } from "../config/cloudinary.config.js";
import Group from "../models/group.model.js";
import GroupMessages from "../models/groupMessages.model.js";
import User from "../models/users.models.js";
import { getReceiverSocketId, io, isUserOnline } from "../socket/app.socket.js";

export const creategroup = async (req, res) => {
  try {
    const { groupName, selectedUsers } = req.body;
    const photo = req.file;

    if (!groupName || !selectedUsers) {
      return res.status(400).json({
        message: "Group name and selected users are required",
        result: false,
      });
    }

    const users = selectedUsers.split(",").map((userId) => ({
      userId,
      role: "member",
    }));

    let groupIcon = "";
    if (photo) {
      const result = await uploadToCloudinary(photo.path, "image");
      if (result?.message === "Fail") {
        return res
          .status(500)
          .json({ message: "Image upload failed", result: false });
      }
      groupIcon = result.url || "";
    }

    const newGroup = await Group.create({
      name: groupName,
      members: [...users, { userId: req.user._id, role: "admin" }],
      createdBy: req.user._id,
      groupIcon,
    });

  
    const populatedGroup = await Group.findById(newGroup._id).populate("members.userId", "-password");

    const groupData = {};
    groupData["name"] = populatedGroup.name;
    groupData["_id"] = populatedGroup._id;
    groupData["profilePic"] = populatedGroup.groupIcon || "";
    groupData["description"] = populatedGroup.description || "";

    groupData["lastMessage"] = populatedGroup.lastMessage;
    groupData["lastMessageTime"] = populatedGroup.lastMessageTime;
    groupData["isGroup"] = true;

    let isAdmin = false;

    const groupMembers = populatedGroup.members
      .map((member) => {
        if (!isAdmin) {
          isAdmin =
            req.user._id === member.userId._id.toString() &&
            member.role === "admin";
        }
        return {
          _id: member.userId._id,
          name:
            member.userId._id.toString() === req.user._id
              ? "You"
              : member.userId.name,
          email: member.userId.email,
          profilePic: member.userId.profilePic,
          role: member.role,
          lastSeen: member.lastSeen,
          isYou: member.userId._id.toString() === req.user._id,
        };
      })
      .sort((a, b) => (a.role === "admin" ? -1 : 1));

    groupData["members"] = groupMembers;
    groupData["isAdmin"] = isAdmin;



    return res.status(201).json({
      message: "Group Created Successfully",
      result: true,
      data: groupData,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

export const getChat = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    const messages = await GroupMessages.find({
      groupId,
      deletedFor: { $ne: userId },
    }).populate("senderId", "name email profilePic");

    const updatedMessages = messages?.map((message) => {
      return {
        ...message.toObject(),
        isSender: message.senderId?._id.toString() === userId,
      };
    });

    return res.status(200).json({
      data: updatedMessages,
      message: "Chat Fetched Successfully.",
      result: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const sendGroupMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const groupId = req.body?.recipient;
    const senderId = req.user._id;
    let mediaURLs = [];

    const group = await Group.findById(groupId).populate("members");
    if (!group) return res.status(400).json({ error: "Group not found" });

    if (!message && req.files.length === 0) {
      return res
        .status(400)
        .json({ message: "Either message or media is required" });
    }

    if (req.files && req.files.length > 0) {
      for (let media of req.files) {
        try {
          const result = await uploadToCloudinary(media.path, media.mimetype);
          if (result.message === "Fail") {
            return res
              .status(500)
              .json({ message: "Media upload failed", result: false });
          }
          mediaURLs.push({
            url: result.url,
            type: media.mimetype.split("/")[0],
          });
        } catch (error) {
          return res
            .status(500)
            .json({ message: "Error uploading media", error: error.message });
        }
      }
    }

    const newMessage = new GroupMessages({
      groupId,
      senderId,
      message,
      media: mediaURLs,
    });
    await newMessage.save();

    await Group.findByIdAndUpdate(groupId,
      {
        lastMessage:newMessage._id
      }
    )

    const senderDetails = await User.findById(senderId).select(
      "_id name email profilePic"
    );

    const messageToEmit = {
      _id: newMessage._id,
      groupId,
      senderId: senderDetails,
      message,
      media: mediaURLs,
      isSender: false,
      readReceipts: [],
      deletedFor: [],
      profilePic:group.groupIcon,
      name:group.name,
      createdAt: newMessage.createdAt,
      updatedAt: newMessage.updatedAt,
      __v: newMessage.__v,
    };

    group.members.forEach((member) => {
      if (member.userId.toString() !== senderId.toString()) {
        const receiverSocketId = getReceiverSocketId(member.userId.toString());
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("newMessage", messageToEmit);
        }
      }
    });

    messageToEmit.isSender = true;

    return res.status(201).json({
      message: "Message Sent Successfully!",
      result: true,
      data: messageToEmit,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteGroupMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await GroupMessages.findById(messageId);
    if (!message) return res.status(404).json({ error: "Message not found" });

    if (!message.deletedFor.includes(userId)) {
      message.deletedFor.push(userId);
      await message.save();
    }

    return res
      .status(200)
      .json({ result: true, message: "Message deleted for you" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteGroupMessageForEveryone = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await GroupMessages.findById(messageId);
    if (!message) return res.status(404).json({ error: "Message not found" });

    const group = await Group.findById(message.groupId);



    if (!message.deletedFor.includes(userId)) {
      group.members.forEach((member)=>{
        message.deletedFor.push(member.userId);
        if(isUserOnline(member.userId)){
              io.to(getReceiverSocketId(member.userId)).emit("messageDeletedForEveryone",{
                senderId:message.groupId,
                messageId:messageId
              })
            }
      })
      await message.save();
    }

    // console.log(message)

    return res
      .status(200)
      .json({ result: true, message: "Message deleted for Everyone" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


export const addMembers = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userIds } = req.body;
    const currentUserId = req.user?._id.toString();

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ error: "Group not found" });

    userIds.forEach((userId) => {
      if (!group.members.some((member) => member.userId.toString() === userId)) {
        group.members.push({ userId, role: "member" });
      }
    });

    await group.save();

    const updatedGroup = await Group.findById(groupId)
      .populate("members.userId", "name email profilePic lastSeen")
      .lean();

    updatedGroup.members = updatedGroup.members.map((member) => ({
      _id: member.userId._id,
      name: member.userId._id.toString() === currentUserId ? "You" : member.userId.name,
      email: member.userId.email,
      profilePic: member.userId.profilePic,
      role: member.role,
      lastSeen: member.userId.lastSeen,
      isYou: member.userId._id.toString() === currentUserId,
    }));

    return res.status(200).json({
      message: "Members added successfully",
      result: true,
      data: updatedGroup,
    });
  } catch (error) {
    console.error("Error adding members:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const removeMembers = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.body;

    if(!groupId || !userId){
      return res.status(400).json({
        message:"Group Id and UserId Required.!"
      })
    }


    const group = await Group.findByIdAndUpdate(
      groupId,
      { $pull: { members: { userId } } },
      { new: true }
    );

    if (!group) return res.status(404).json({ error: "Group not found" });

    return res
      .status(200)
      .json({ message: "Member removed successfully", result: true, group });
  } catch (error) {
    console.log(" Error While Removing Member : ", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const leaveGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const  userId  = req.user._id;

    if(!groupId || !userId){
      return res.status(400).json({
        message:"Group Id and token Required.!"
      })
    }

    const group = await Group.findByIdAndUpdate(
      groupId,
      { $pull: { members: { userId } } },
      { new: true }
    );

    if (!group) return res.status(404).json({ error: "Group not found" });

    return res
      .status(200)
      .json({ message: "Removed From Group Successfully", result: true, data:userId });
  } catch (error) {
    console.log(" Error While Removing Member : ", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const makeAdmin = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.body;

    const group = await Group.findOneAndUpdate(
      { _id: groupId, "members.userId": userId },
      { $set: { "members.$.role": "admin" } },
      { new: true }
    );

    if (!group)
      return res.status(404).json({ error: "Group or member not found" });

    return res
      .status(200)
      .json({ message: "User promoted to admin", result: true, group });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const removeAdmin = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.body;

    const group = await Group.findOneAndUpdate(
      { _id: groupId, "members.userId": userId },
      { $set: { "members.$.role": "member" } },
      { new: true }
    );

    if (!group)
      return res.status(404).json({ error: "Group or admin not found" });

    return res
      .status(200)
      .json({ message: "User demoted to member", result: true, group });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const changeDescription = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { description } = req.body;

    const group = await Group.findByIdAndUpdate(
      groupId,
      { description },
      { new: true }
    );

    if (!group) return res.status(404).json({ error: "Group not found" });

    return res
      .status(200)
      .json({
        message: "Group description updated",
        result: true,
        data: group,
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const changeGroupIcon = async (req, res) => {
  try {
    const { groupId } = req.params;
    const photo = req.file;

    if (!photo)
      return res.status(400).json({ error: "Image file is required" });

    const result = await uploadToCloudinary(photo.path, "image");
    if (result?.message === "Fail") {
      return res
        .status(500)
        .json({ message: "Image upload failed", result: false });
    }

    const oldGroupDetails = await Group.findById(groupId);

    if(oldGroupDetails.groupIcon !== undefined && oldGroupDetails.groupIcon != ""){
      const publicId = oldGroupDetails.groupIcon
        .split("/")
        .slice(-1)[0]
        .split(".")[0];
       await deleteFromCloudinary(publicId);
    }

    const group = await Group.findByIdAndUpdate(
      groupId,
      { groupIcon: result.url },
      { new: true }
    );

    if (!group) return res.status(404).json({ error: "Group not found" });

    return res
      .status(200)
      .json({ message: "Group icon updated", result: true, data: group });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const clearGroupChat = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user?._id;

    if (!groupId || !userId) {
      return res
        .status(400)
        .json({ message: "Group ID and User ID are required." });
    }

    const updatedMessages = await GroupMessages.updateMany(
      { groupId },
      { $addToSet: { deletedFor: userId } }
    );

    // await Group.findByIdAndUpdate(groupId, {
    //   lastMessage: null,
    //   lastMessageTime: Date.now(),
    // });

    return res.status(200).json({
      result: true,
      message: "Group chat cleared for the user successfully.",
      modifiedCount: updatedMessages.modifiedCount,
    });
  } catch (error) {
    console.error("Error While Clearing Group Chat:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};


export const deleteMedia   = async(req,res) =>{
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

    const updatedMessage = await GroupMessages.findByIdAndUpdate(
      messageId,
      { $pull: { media: { url: mediaUrl } } },
      { new: true }
    );

    return res.status(200).json({
      message: "Media deleted successfully",
      result: true,
    });
  } catch (error) {
    console.error("Error While Clearing Group Chat:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}