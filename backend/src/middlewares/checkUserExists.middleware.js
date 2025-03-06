import User from "../models/users.models.js";

const  checkUserExists = async(req,res,next)=>{
    try {
        const {email} = req.body;
        if(!email){
            return res.status(400).json({
                message:"Email Is Required.!",
                result:false
            })
        }
        const data = await User.findOne({email:email});
        if(!data){
            return res.status(400).json({
                message:"Email Is Does Not Exists.!",
                result:false
            })
        }
        next();
    } catch (error) {
        console.log(error,"Check User Exists");
    }
}


export default checkUserExists;