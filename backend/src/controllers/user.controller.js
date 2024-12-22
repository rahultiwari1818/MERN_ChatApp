import { sendMail } from "../config/mail.config.js";
import { client } from "../config/redis.config.js";
import { createHTMLBody, generateHashPassword, generateOTP, generateToken, verifyPassword } from "../utils/utils.js";
import User from "../models/users.models.js";


export const registerUser = async(req,res) =>{
    try {

        const {mail , password , name} = req.body;
        if([password , name,mail].some(val => val === "" || val === undefined) )  return res.status(400).json({message:"Please Provide All The Required Fields.!",result:false});
        const hashedPasswd = await generateHashPassword(password);
        await User.create({
            email : mail,
            name,
            password:hashedPasswd
        })

        return res.status(201).json({
            message: "User Registered Successfully!",
            result:true
        })
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error
        })
    }
}

export const loginUser = async(req,res,next) => {
    try {

        const {mail,password} = req.body;
        if([password,mail].some(val => val ==="" || val === undefined))  return res.status(400).json({message:"Please provide Email and Password!",result:false});
        const user = await User.findOne({email:mail});
        if(!user){
            return res.status(400).json({
                message : "Incorrect Email.!",
                result : false
            })
        }

        if(!await verifyPassword(password,user.password)) return res.status(401).json({message:"Incorrect Password",result:false});
        const token = generateToken({_id:user._id,name:user.name,email:user.email});
        return res.status(200).json({
            message:"User Loggedin Successfully.!",
            result:true,
            token
        })


        
    } catch (error) {
        return res.status(500).json({
            error
        })
    }
}

export const sendOTP = async(req,res)=>{

    try {

        const mail = req.body?.email;
        if(!mail) return res.status(400).json({message:"Please provide Email.!",result:false});
        const otp = generateOTP();
        await client.set(mail,otp);
        
        const resp = await sendMail(mail,"Verification OTP",`Your OTP is ${otp}`);
        if(resp.result){
            return res.status(200).json({
                message : "OTP Sent Successfully.!",
                result : true
            })
        }
        else{
            return res.status(500).json({
                error:resp.message
            }) 
        }
        
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            error
        }) 
    }

}

export const verifyOTP = async(req,res) =>{
    try {
        const {mail,otp} = req.body;
        if ([otp, mail].some(value => value === "" || value === undefined)) {
            return res.status(400).json({ message: "Please provide Email and OTP!", result: false });
          }
        const storedOTP = await client.get(mail);
        if(storedOTP === otp ){
            await client.del(mail);
            const token =  generateToken({email:mail});
            return res.status(200).json({
                message:"User Verified Succcessfully",
                token,
                result:true
            })
        }
        else{
           return res.status(401).json({
                message:"Invaalid OTP",
                result:false
           })
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            error
        })    
    }
}

export const getAllUsers = async(req,res)=>{
    try {
        const userId = req.user._id;
        const users = await User.find({ _id: { $ne: userId } },{password:0});
        return res.status(200).json({
            message:"Users Fetched Successfully.",
            data:users,
            result:true
        })
    
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            error
        })    
    }
}

export const getUserDetails = async(req,res)=>{
    try {
        const userId = req.user._id;
        const users = await User.findOne({ _id: userId },{password:0});
        return res.status(200).json({
            message:"User Profile Fetched Successfully.",
            data:users,
            result:true
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            error
        })    
    }
}


export const inviteFriend = async(req,res) =>{
    try {

        const userName = req.user.name;
        const {friendMail} = req.body;

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
              <a href="https://www.vartalaap-chat-app.com/" 
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
        const resp = await sendMail(friendMail,"Invitation to Use Vartalaap Chat App.",mailBody);

        if(resp.result){
            return res.status(200).json({
                message : "Invitation Sent Successfully.!",
                result : true
            })
        }
        else{
            return res.status(500).json({
                error:resp.message
            }) 
        }
        
        
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            error
        })    
    }
}

export const searchUser = async(req,res)=>{
    try {

        const {friendMail} = req.query;

        const data = await User.find(
            {
                $or: [
                    { email: { $regex: friendMail?.trim(), $options: 'i' } }, // Case-insensitive match for email
                    { name: { $regex: friendMail?.trim(), $options: 'i' } }  // Case-insensitive match for name
                ]
            },
            { password: 0 } // Exclude the password field from the result
        );

        return res.status(200).json({
            message:"Users Fetched Successfully.!",
            data,
            result:true
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            error
        })    
    }
}