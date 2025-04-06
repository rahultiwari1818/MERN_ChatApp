import { oauth2Client } from "../config/googleAuth.config.js";
import User from "../models/users.models.js";
import axios from "axios";
import { generateToken } from "../utils/utils.js";

export const googleAuth = async (req, res) => {
    try {
      const code = req.query.code;
    const googleRes = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(googleRes.tokens);
    
    const userRes = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`
    );
    const { email, name } = userRes.data;
    // console.log(userRes);
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,

      });
    }
    const token = generateToken({
      _id: user._id,
      name: user.name,
      email: user.email,
    });

    return res.status(200).json({
      message: "User Loggedin Successfully.!",
      result: true,
      email:user.email,
      token,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
