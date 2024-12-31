import User from "../models/users.models.js";

export const isBlocked = async (req, res, next) => {
    const recipient = req.body?.recipient;   
    const user = await User.findById({_id:req.user._id});
    
    if (user.blockedUsers.includes(recipient)) {
      return res.status(403).json({ message: "You have blocked this user." });
    }
    next();
  };
  