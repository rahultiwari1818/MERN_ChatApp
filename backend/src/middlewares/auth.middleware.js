import jwt from "jsonwebtoken";

const secretKey = process.env.SECRET_KEY;

export const verifyUser = async(req,res,next) =>{
    try {
        const token = req.headers?.authorization;
        if(!token) return res.status(400).json({
            message:"Unauthorized User.",
            result:false
        })
        const decode = jwt.verify(token,secretKey);
        req.user = decode;
        next();
        
    } catch (error) {
        return res.status(500).json({result:false,error})
    }
}