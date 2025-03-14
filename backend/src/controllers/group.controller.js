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

    const users = selectedUsers.split(",").map(userId => ({
      userId,
      role: "member",
    }));

    let groupIcon = "";
    if (photo) {
      const result = await uploadToCloudinary(photo.path, "image");
      if (result?.message === "Fail") {
        return res.status(500).json({ message: "Image upload failed", result: false });
      }
      groupIcon = result.url || "";
    }

    const newGroup = await Group.create({
      name: groupName,
      members: [...users, { userId: req.user._id, role: "admin" }],
      createdBy: req.user._id,
      groupIcon,
    });

    return res.status(201).json({ message: "Group Created Successfully", result: true, group: newGroup });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

export const getChat = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    const messages = await GroupMessages.find({
      groupId,
      deletedFor: { $ne: userId },
    }).populate("senderId", "name email");

    return res.status(200).json({ data: messages, message: "Chat Fetched Successfully.", result: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
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

    return res.status(201).json({ message: "Message Sent Successfully!", result: true, data: newMessage });
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

    res.status(200).json({ result: true, message: "Message deleted for you" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const addMembers = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userIds } = req.body;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ error: "Group not found" });

    userIds.forEach(userId => {
      if (!group.members.some(member => member.userId.toString() === userId)) {
        group.members.push({ userId, role: "member" });
      }
    });

    await group.save();
    return res.status(200).json({ message: "Members added successfully", result: true, group });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const removeMembers = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.body;

    const group = await Group.findByIdAndUpdate(
      groupId,
      { $pull: { members: { userId } } },
      { new: true }
    );

    if (!group) return res.status(404).json({ error: "Group not found" });

    return res.status(200).json({ message: "Member removed successfully", result: true, group });
  } catch (error) {
    console.log(error);
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

    if (!group) return res.status(404).json({ error: "Group or member not found" });

    return res.status(200).json({ message: "User promoted to admin", result: true, group });
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

    if (!group) return res.status(404).json({ error: "Group or admin not found" });

    return res.status(200).json({ message: "User demoted to member", result: true, group });
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

    return res.status(200).json({ message: "Group description updated", result: true, group });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const changeGroupIcon = async (req, res) => {
  try {
    const { groupId } = req.params;
    const photo = req.file;

    if (!photo) return res.status(400).json({ error: "Image file is required" });

    const result = await uploadToCloudinary(photo.path, "image");
    if (result?.message === "Fail") {
      return res.status(500).json({ message: "Image upload failed", result: false });
    }

    const group = await Group.findByIdAndUpdate(
      groupId,
      { groupIcon: result.url },
      { new: true }
    );

    if (!group) return res.status(404).json({ error: "Group not found" });

    return res.status(200).json({ message: "Group icon updated", result: true, group });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
