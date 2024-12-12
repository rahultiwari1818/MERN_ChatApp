import { sendMail } from "../config/mail.config.js";
import { client } from "../config/redis.config.js";
import { generateHashPassword, generateOTP, generateToken, verifyPassword } from "../utils/utils.js";
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