import { sendMail } from "../config/mail.config.js";
import { client } from "../config/redis.config.js";
import {
  createHTMLBody,
  generateHashPassword,
  generateOTP,
  generateToken,
  verifyPassword,
} from "../utils/utils.js";
import User from "../models/users.models.js";
import { getReceiverSocketId, io, isUserOnline } from "../socket/app.socket.js";
import {
  deleteFromCloudinary,
  uploadToCloudinary,
} from "../config/cloudinary.config.js";
import Conversation from "../models/conversation.model.js";
import Group from "../models/group.model.js";
import GroupMessages from "../models/groupMessages.model.js";

export const registerUser = async (req, res) => {
  try {
    const { mail, password, name } = req.body;
    const doesUserExists = await User.findOne({ email: mail });
    if (doesUserExists) {
      return res.status(401).json({
        message: "User Already Exists.!",
        result: false,
      });
    }
    if ([password, name, mail].some((val) => val === "" || val === undefined))
      return res.status(400).json({
        message: "Please Provide All The Required Fields.!",
        result: false,
      });
    const hashedPasswd = await generateHashPassword(password);
    await User.create({
      email: mail,
      name,
      password: hashedPasswd,
    });

    return res.status(201).json({
      message: "User Registered Successfully!",
      result: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error,
    });
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { mail, password } = req.body;
    if ([password, mail].some((val) => val === "" || val === undefined))
      return res
        .status(400)
        .json({ message: "Please provide Email and Password!", result: false });
    const user = await User.findOne({ email: mail });
    if (!user) {
      return res.status(400).json({
        message: "Incorrect Email.!",
        result: false,
      });
    }

    if (!(await verifyPassword(password, user.password)))
      return res
        .status(401)
        .json({ message: "Incorrect Password", result: false });
    const token = generateToken({
      _id: user._id,
      name: user.name,
      email: user.email,
    });
    return res.status(200).json({
      message: "User Loggedin Successfully.!",
      result: true,
      token,
      data: {
        blockedUsers: user.blockedUsers,
      },
    });
  } catch (error) {
    return res.status(500).json({
      error,
    });
  }
};

export const sendOTP = async (req, res) => {
  try {
    const mail = req.body?.email;
    if (!mail)
      return res
        .status(400)
        .json({ message: "Please provide Email.!", result: false });
    const otp = generateOTP();
    await client.set(mail, otp);

    const resp = await sendMail(mail, "Verification OTP", `Your OTP is ${otp}`);
    if (resp.result) {
      return res.status(200).json({
        message: "OTP Sent Successfully.!",
        result: true,
      });
    } else {
      return res.status(500).json({
        error: resp.message,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error,
    });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { mail, otp } = req.body;
    if ([otp, mail].some((value) => value === "" || value === undefined)) {
      return res
        .status(400)
        .json({ message: "Please provide Email and OTP!", result: false });
    }
    const storedOTP = await client.get(mail);
    if (storedOTP === otp) {
      await client.del(mail);
      const token = generateToken({ email: mail });
      return res.status(200).json({
        message: "User Verified Succcessfully",
        token,
        result: true,
      });
    } else {
      return res.status(401).json({
        message: "Invaalid OTP",
        result: false,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error,
    });
  }
};

export const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch private conversations
    const { friendMail } = req.query;

    let userQuery = {
      participants: { $in: [userId] },
    };

    // If friendMail is provided, filter users by email (case-insensitive partial match)
    if (friendMail) {
      userQuery.email = { $regex: friendMail, $options: "i" };
    }

    const privateConversations = await Conversation.find(userQuery)
      .populate({
        path: "participants",
        select: "_id name profilePic email blockedUsers lastSeen",
      })
      .populate({
        path: "messages",
        select: "message media senderId timestamp readReceipts",
        populate: { path: "senderId", select: "_id email name profilePic" },
      })
      .populate({
        path: "lastMessage",
        select: "message media senderId timestamp _id readReceipts",
      })
      .sort({ lastMessageTime: -1 })
      .lean();

    // Format private conversations
    const formattedPrivateConversations = privateConversations.map((conv) => {
      const otherParticipant = conv.participants.find(
        (p) => p._id.toString() !== userId
      );
      const user = conv.participants.find((p) => p._id.toString() === userId);

      const isBlocked = user?.blockedUsers?.filter(
        (user) => user.toString() === otherParticipant._id.toString()
      );
      const hasBlocked =
        otherParticipant &&
        otherParticipant.blockedUsers.filter(
          (user) => userId === user.toString()
        );

      const unreadedMessagesCount = conv.messages.reduce((acc, mess) => {
        if (
          mess.senderId._id.toString() !== userId &&
          mess.readReceipts !== "read"
        ) {
          return acc + 1;
        }
        return acc;
      }, 0);

      return {
        _id: otherParticipant?._id,
        name: otherParticipant?.name || "Unknown",
        email: otherParticipant?.email || "",
        profilePic: otherParticipant?.profilePic || "",
        // messages: conv.messages || [],
        lastSeen: otherParticipant?.lastSeen,
        lastMessage: {
          ...conv.lastMessage,
          isSender: conv.lastMessage.senderId.toString() === userId,
        },
        lastMessageTime: conv.lastMessageTime,
        isBlocked: isBlocked?.length > 0,
        hasBlocked: hasBlocked?.length > 0,
        isOnline: isUserOnline(otherParticipant?._id),
        unreadedMessagesCount: unreadedMessagesCount,
      };
    });

    // Fetch group conversations
    const groupConversations = await Group.find({ "members.userId": userId })
      .populate("createdBy", "name profilePic")
      .populate("members.userId", "name profilePic email")
      .populate({
        path: "lastMessage",
        select: "message media senderId timestamp _id ",
        populate: { path: "senderId", select: "_id email name profilePic" },
      })
      .lean();

    // Fetch latest messages for each group
    for (let group of groupConversations) {
      const lastMessage = await GroupMessages.findOne({ groupId: group._id })
        .sort({ createdAt: -1 })
        .select("message media senderId createdAt")
        .populate("senderId", "name profilePic")
        .lean();

      const groupMessages = await GroupMessages.find({ groupId: group._id })
        .sort({ createdAt: 1 }) // Oldest to latest
        .populate("senderId", "name profilePic")
        .lean();

      (group.lastMessage = {
        ...group.lastMessage,
        isSender: group.lastMessage?.senderId?._id.toString() === userId,
      }),
        (group.lastMessageTime = lastMessage?.createdAt || group.updatedAt);
      //   group.messages = groupMessages || [];
    }

    // Format group conversations

    const formattedGroupConversations = groupConversations.map((group) => {
      let isAdmin = false;

      const groupMembers = group.members
        .map((member) => {
          if (!isAdmin) {
            isAdmin =
              userId === member.userId._id.toString() &&
              member.role === "admin";
          }
          return {
            _id: member.userId._id,
            name:
              member.userId._id.toString() === userId
                ? "You"
                : member.userId.name,
            email: member.userId.email,
            profilePic: member.userId.profilePic,
            role: member.role,
            lastSeen: member.lastSeen,
            isYou: member.userId._id.toString() === userId,
          };
        })
        .sort((a, b) => (a.role === "admin" ? -1 : 1));

      // const unreadedMessagesCount = await  GroupMessages.countDocuments({

      // })

      return {
        _id: group._id,
        name: group.name,
        profilePic: group.groupIcon || "",
        description: group.description || "",
        members: groupMembers,
        //   messages: group.messages || [],
        isAdmin: isAdmin,
        lastMessage: group.lastMessage,
        lastMessageTime: group.lastMessageTime,
        isGroup: true,
        // unreadedMessagesCount:unreadedMessagesCount
      };
    });

    // Merge and sort all conversations
    const allConversations = [
      ...formattedPrivateConversations,
      ...formattedGroupConversations,
    ];
    allConversations.sort(
      (a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
    );

    return res.status(200).json({
      message: "Conversations Fetched Successfully.!",
      result: true,
      data: allConversations,
    });
  } catch (error) {
    console.error("Error in getConversations:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getUsers = async (req, res) => {
  try {
    const userId = req.user._id;
    const { friendMail } = req.query;

    // Construct query to find users excluding the current user
    let userQuery = { _id: { $ne: userId } };

    // If friendMail is provided, filter users by email (case-insensitive partial match)
    if (friendMail) {
      userQuery.email = { $regex: friendMail, $options: "i" };
    }

    // Fetch users matching the criteria
    const users = await User.find(userQuery, { password: 0 });
    const userIds = users.map((user) => user._id);

    // Find users who have an existing conversation with the current user
    const existingConversations = await Conversation.find({
      participants: { $in: [userId] },
    });

    // Extract user IDs with conversations
    const conversationUserIds = new Set(
      existingConversations.flatMap((conv) =>
        conv.participants.map((id) => id.toString())
      )
    );

    // Filter users who do NOT have an existing conversation
    const usersWithoutConversations = users.filter(
      (user) => !conversationUserIds.has(user._id.toString())
    );

    return res.status(200).json({
      message: "Filtered users with no conversation fetched successfully.",
      data: usersWithoutConversations,
      result: true,
    });
  } catch (error) {
    console.error("Error in getUsers:", error);
    return res.status(500).json({ error });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const { friendMail } = req.query;

    let filter = {};
    if (friendMail) {
      filter.email = { $regex: friendMail, $options: "i" }; // Case-insensitive search
    }

    const users = await User.find(filter).select("-password");

    return res.status(200).json({
      data: users,
      message: "Users Fetched Successfully.!",
      result: true,
    });
  } catch (error) {
    console.error("Error in Get All Users:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getUserDetails = async (req, res) => {
  try {
    const userId = req.user._id;
    const users = await User.findOne({ _id: userId }, { password: 0 }).populate(
      {
        path: "blockedUsers",
        select: "-password", // Exclude the password field
      }
    );
    return res.status(200).json({
      message: "User Profile Fetched Successfully.",
      data: users,
      result: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error,
    });
  }
};

export const inviteFriend = async (req, res) => {
  try {
    const userName = req.user.name;
    const { friendMail } = req.body;

    if (req.user.email == friendMail) {
      return res.status(400).json({
        message: "You Can Not Invite Yourself.!",
        result: false,
      });
    }

    const doesUserAlreadyExists = await User.findOne({ email: friendMail });

    if (doesUserAlreadyExists) {
      return res.status(400).json({
        message: "User With This Email Id Already Exists.!",
        result: false,
      });
    }

    const mailBody =
      createHTMLBody(` <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h2>Hi there!</h2>
            <p>
              Your friend <strong>${userName}</strong> has invited you to join <strong>Vartalaap Chat App</strong>, 
              an amazing platform where you can connect, chat, and share moments with friends and family!
            </p>
            <p>
              Experience seamless communication and enjoy features like real-time messaging, user-friendly design, and more.
            </p>
            <p>
              Click the link below to join the fun and start chatting today:
            </p>
            <p>
              <a href="https://vartalaap-h5xh.onrender.com/" 
                 style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px;">
                Join Vartalaap Now
              </a>
            </p>
            <p>
              See you on Vartalaap! 😊
            </p>
            <hr />
            <p style="font-size: 0.9em; color: #555;">
              If you have any questions or need assistance, feel free to reach out to us at 
              <a href="mailto:support@vartalaap-chat-app.com">support@vartalaap-chat-app.com</a>.
            </p>
          </div>
        `);
    const resp = await sendMail(
      friendMail,
      "Invitation to Use Vartalaap Chat App.",
      mailBody
    );

    if (resp.result) {
      return res.status(200).json({
        message: "Invitation Sent Successfully.!",
        result: true,
      });
    } else {
      return res.status(500).json({
        error: resp.message,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error,
    });
  }
};

export const changeProfilePic = async (req, res) => {
  try {
    const userId = req.user._id;
    const photo = req.file;
    if (!photo) return res.status(400).json({ message: "File Not Found" });
    const result = await uploadToCloudinary(photo.path, "image");
    if (result.message === "Fail") {
      return res.status(500).json({
        message: "Some Error Occued...",
        result: false,
      });
    }
    const oldUserDetails = await User.findById(userId);
    if (
      oldUserDetails.profilePic !== undefined &&
      oldUserDetails.profilePic != ""
    ) {
      const publicId = oldUserDetails.profilePic
        .split("/")
        .slice(-1)[0]
        .split(".")[0];
      await deleteFromCloudinary(publicId);
    }

    const newProfilePicPath = result.url;
    await User.findOneAndUpdate(
      { _id: userId },
      {
        $set: {
          profilePic: newProfilePicPath,
        },
      },
      { new: true }
    );

    return res.status(200).json({
      message: "Profile Photo Uploaded Sucessfully",
      result: true,
      data: { profilePic: newProfilePicPath },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error,
    });
  }
};

export const blockUser = async (req, res) => {
  try {
    const { userIdToBlock } = req.params;
    const _id = req.user._id; // Assume user ID is extracted from the token

    if (_id === userIdToBlock) {
      return res.status(400).json({ message: "You cannot block yourself." });
    }

    await User.findByIdAndUpdate(_id, {
      $push: { blockedUsers: userIdToBlock },
    });

    const receiverSocketId = getReceiverSocketId(userIdToBlock);

    io.to(receiverSocketId).emit("userBlocked", { _id: _id });

    return res
      .status(200)
      .json({ message: "User blocked successfully.", result: true });
  } catch (error) {
    console.error("Error blocking user:", error);
    return res.status(500).json({ message: "An error occurred.", error });
  }
};

export const unblockUser = async (req, res) => {
  try {
    const { userIdToUnblock } = req.params;
    const userId = req.user._id;

    await User.findByIdAndUpdate(
      { _id: userId },
      {
        $pull: { blockedUsers: userIdToUnblock },
      }
    );

    const receiverSocketId = getReceiverSocketId(userIdToUnblock);

    io.to(receiverSocketId).emit("userUnblocked", { _id: userId });

    return res
      .status(200)
      .json({ message: "User unblocked successfully.", result: true });
  } catch (error) {
    console.error("Error unblocking user:", error);
    return res.status(500).json({ message: "An error occurred.", error });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email } = req.user;
    if (!email) {
      return res.status(400).json({
        message: "Email is Required",
        result: false,
      });
    }
    const { newPassword } = req.body;
    if (!newPassword?.trim()) {
      return res.status(400).json({
        message: "New Password is Required",
        result: false,
      });
    }

    const hashedPasswd = await generateHashPassword(newPassword.trim());

    await User.updateOne(
      { email: email },
      {
        $set: {
          password: hashedPasswd,
        },
      }
    );

    return res.status(201).json({
      message: "Password Changed Successfully!",
      result: true,
    });
  } catch (error) {
    console.error("Error Resetting Password user:", error);
    return res.status(500).json({ message: "An error occurred.", error });
  }
};


export const updateName = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Name cannot be empty." });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name },
      { new: true }
    )
      .select("-password")
      .populate("blockedUsers", "-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json({
      message: "Name updated successfully.",
      data: updatedUser,
      result:true

    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error,
      message: "Something went wrong.",
    });
  }
};