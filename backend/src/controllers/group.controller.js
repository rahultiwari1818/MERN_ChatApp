import { uploadToCloudinary } from "../config/cloudinary.config.js";
import Group from "../models/group.model.js";
import GroupMessages from "../models/groupMessages.model.js";

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

    let newProfilePicPath = "";
    if (photo) {
      const result = await uploadToCloudinary(photo.path, "image");
      if (result?.message === "Fail") {
        return res.status(500).json({
          message: "Image upload failed",
          result: false,
        });
      }
      newProfilePicPath = result?.url || "";
    }

    const newGroup = await Group.create({
      groupName,
      selectedUsers: JSON.parse(selectedUsers), // Ensure selectedUsers is an array
      groupImage: newProfilePicPath,
      createdBy: req.user._id,
      admins: [req.user._id],
    });

    newGroup.save();

    return res.status(201).json({
      message: "Group Created Successfully",
      result: true,
      group: newGroup,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const getChat = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    const messages = await GroupMessages.find({
      groupId,
      deletedFor: { $ne: userId }, // Exclude messages deleted for this user
    }).populate("senderId", "name email ");

    return res.status(200).json({
      data: messages,
      message: "Chat Fetched Successfully.!",
      result: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const sendGroupMessage = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { message } = req.body;
    const senderId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ error: "Group not found" });

    const newMessage = new GroupMessages({ groupId, senderId, message });
    await newMessage.save();

    return res.status(201).json({
      message: "Message Sent Successfully.!",
      result: true,
      data: newMessage,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
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

    res.status(200).json({result:true, message: "Message deleted for you" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const addMembers = async (req, res) => {
  try {
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const removeMembers = async (req, res) => {
  try {
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const makeAdmin = async (req, res) => {
  try {
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const removeAdmin = async (req, res) => {
  try {
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const changeDescription = async (req, res) => {
  try {
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const changeGroupIcon = async (req, res) => {
  try {
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
