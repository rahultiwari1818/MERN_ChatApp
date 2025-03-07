import { sendMail } from "../config/mail.config.js";
import { client } from "../config/redis.config.js";
import { createHTMLBody, generateHashPassword, generateOTP, generateToken, verifyPassword } from "../utils/utils.js";
import User from "../models/users.models.js";
import Messages from "../models/messages.models.js";
import { getReceiverSocketId, io, isUserOnline } from "../socket/app.socket.js";
import { uploadToCloudinary } from "../config/cloudinary.config.js";


export const registerUser = async (req, res) => {
    try {

        const { mail, password, name } = req.body;
        const doesUserExists = await User.findOne({email:mail});
        if(doesUserExists){
            return res.status(401).json({
                message:"User Already Exists.!",
                result:false
            })
        }
        if ([password, name, mail].some(val => val === "" || val === undefined)) return res.status(400).json({ message: "Please Provide All The Required Fields.!", result: false });
        const hashedPasswd = await generateHashPassword(password);
        await User.create({
            email: mail,
            name,
            password: hashedPasswd
        })

        return res.status(201).json({
            message: "User Registered Successfully!",
            result: true
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error
        })
    }
}

export const loginUser = async (req, res, next) => {
    try {

        const { mail, password } = req.body;
        if ([password, mail].some(val => val === "" || val === undefined)) return res.status(400).json({ message: "Please provide Email and Password!", result: false });
        const user = await User.findOne({ email: mail });
        if (!user) {
            return res.status(400).json({
                message: "Incorrect Email.!",
                result: false
            })
        }

        if (!await verifyPassword(password, user.password)) return res.status(401).json({ message: "Incorrect Password", result: false });
        const token = generateToken({ _id: user._id, name: user.name, email: user.email });
        return res.status(200).json({
            message: "User Loggedin Successfully.!",
            result: true,
            token,
            data: {
                blockedUsers: user.blockedUsers
            }
        })



    } catch (error) {
        return res.status(500).json({
            error
        })
    }
}

export const sendOTP = async (req, res) => {

    try {

        const mail = req.body?.email;
        if (!mail) return res.status(400).json({ message: "Please provide Email.!", result: false });
        const otp = generateOTP();
        await client.set(mail, otp);

        const resp = await sendMail(mail, "Verification OTP", `Your OTP is ${otp}`);
        if (resp.result) {
            return res.status(200).json({
                message: "OTP Sent Successfully.!",
                result: true
            })
        }
        else {
            return res.status(500).json({
                error: resp.message
            })
        }

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            error
        })
    }

}

export const verifyOTP = async (req, res) => {
    try {
        const { mail, otp } = req.body;
        if ([otp, mail].some(value => value === "" || value === undefined)) {
            return res.status(400).json({ message: "Please provide Email and OTP!", result: false });
        }
        const storedOTP = await client.get(mail);
        if (storedOTP === otp) {
            await client.del(mail);
            const token = generateToken({ email: mail });
            return res.status(200).json({
                message: "User Verified Succcessfully",
                token,
                result: true
            })
        }
        else {
            return res.status(401).json({
                message: "Invaalid OTP",
                result: false
            })
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            error
        })
    }
}

export const getUsers = async (req, res) => {
    try {
        const userId = req.user._id;
        const users = await User.find({ _id: { $ne: userId } }, { password: 0 });
        const userIds = users.map(user => user._id);

        const messages = await Messages.aggregate([
            {
                $match: {
                    $or: [
                        { sender: { $in: userIds }, receiver: userId },
                        { sender: userId, receiver: { $in: userIds } }
                    ]
                }
            },
            { $sort: { createdAt: -1 } },
            {
                $group: {
                    _id: { $cond: [{ $eq: ["$sender", userId] }, "$receiver", "$sender"] },
                    lastMessageTime: { $first: "$createdAt" }
                }
            }
        ]);

        users.sort((a, b) => {
            const aTime = messages.find(m => m._id.toString() === a._id.toString())?.lastMessageTime;
            const bTime = messages.find(m => m._id.toString() === b._id.toString())?.lastMessageTime;
            if (bTime && aTime) return new Date(bTime) - new Date(aTime);
            if (bTime) return 1;
            if (aTime) return -1;
            return 0;
        });

        return res.status(200).json({
            message: "Users sorted by latest message.",
            data: users,
            result: true
        });

    } catch (error) {
        console.error("Error in getUsers:", error);
        return res.status(500).json({ error });
    }
};




export const getUserDetails = async (req, res) => {
    try {
        const userId = req.user._id;
        const users = await User.findOne({ _id: userId }, { password: 0 })
            .populate({
                path: 'blockedUsers',
                select: '-password', // Exclude the password field
            });
        return res.status(200).json({
            message: "User Profile Fetched Successfully.",
            data: users,
            result: true
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            error
        })
    }
}


export const inviteFriend = async (req, res) => {
    try {

        const userName = req.user.name;
        const { friendMail } = req.body;


        if(req.user.email == friendMail){
            return res.status(400).json({
                message:"You Can Not Invite Yourself.!",
                result:false
            })
        }

        const doesUserAlreadyExists = await User.findOne({email:friendMail});

        if(doesUserAlreadyExists){
            return res.status(400).json({
                message:"User With This Email Id Already Exists.!",
                result:false
            })
        }
        
        

        const mailBody = createHTMLBody(` <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
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
        const resp = await sendMail(friendMail, "Invitation to Use Vartalaap Chat App.", mailBody);

        if (resp.result) {
            return res.status(200).json({
                message: "Invitation Sent Successfully.!",
                result: true
            })
        }
        else {
            return res.status(500).json({
                error: resp.message
            })
        }


    } catch (error) {
        console.log(error)
        return res.status(500).json({
            error
        })
    }
}

export const changeProfilePic = async (req, res) => {
    try {
        const userId = req.user._id;
        const photo = req.file;
        if (!photo) return res.status(400).json({ message: "File Not Found" });
        const result = await uploadToCloudinary(photo.path, "image");
        if (result.message === "Fail") {
            return res.status(500).json({
                message: "Some Error Occued...",
                result: false
            })
        }
        const newProfilePicPath = result.url;
        await User.findOneAndUpdate(
            { _id: userId },
            {
                $set: {
                    profilePic: newProfilePicPath
                }
            },
            { new: true }
        );

        return res.status(200).json({
            message: "Profile Photo Uploaded Sucessfully",
            result: true,
            data: { profilePic: newProfilePicPath }
        })



    } catch (error) {
        console.log(error)
        return res.status(500).json({
            error
        })
    }
}

export const blockUser = async (req, res) => {
    try {
        const { userIdToBlock } = req.params;
        const _id = req.user._id; // Assume user ID is extracted from the token

        if (_id === userIdToBlock) {
            return res.status(400).json({ message: "You cannot block yourself." });
        }

        await User.findByIdAndUpdate(_id, {
            $push: { blockedUsers: userIdToBlock }
        });
        
        const receiverSocketId = getReceiverSocketId(userIdToBlock);
        
        io.to(receiverSocketId).emit("userBlocked", {_id:_id});

        return res.status(200).json({ message: "User blocked successfully.", result: true });
    } catch (error) {
        console.error("Error blocking user:", error);
        return res.status(500).json({ message: "An error occurred.", error });
    }
};

export const unblockUser = async (req, res) => {
    try {
        const { userIdToUnblock } = req.params;
        const userId = req.user._id;

        await User.findByIdAndUpdate({ _id: userId }, {
            $pull: { blockedUsers: userIdToUnblock }
        });

        const receiverSocketId = getReceiverSocketId(userIdToUnblock);
        
        io.to(receiverSocketId).emit("userUnblocked", {_id:userId});


        return res.status(200).json({ message: "User unblocked successfully.", result: true });
    } catch (error) {
        console.error("Error unblocking user:", error);
        return res.status(500).json({ message: "An error occurred.", error });
    }
};

export const resetPassword = async(req,res)=>{
    try {
        const {email} = req.user;
        if(!email){
            return res.status(400).json({
                message:"Email is Required",
                result:false 
            })
        }
        const {newPassword} = req.body;
        if(!newPassword?.trim()){
            return res.status(400).json({
                message:"New Password is Required",
                result:false 
            })
        }

        const hashedPasswd = await generateHashPassword(newPassword.trim());
        
        await User.updateOne({email:email},{
            $set: {
                password: hashedPasswd
            }
        },)

        return res.status(201).json({
            message: "Password Changed Successfully!",
            result: true
        })


    } catch (error) {
        console.error("Error Resetting Password user:", error);
        return res.status(500).json({ message: "An error occurred.", error });
    }
}