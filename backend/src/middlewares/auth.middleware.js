import jwt from "jsonwebtoken";

const secretKey = process.env.SECRET_KEY;

export const verifyUser = async(req,res,next) =>{
    try {
        const token = "";
        const decode = jwt.verify(token,secretKey);
        req.user = decode.user;
        next();
        
    } catch (error) {
        return res.status(500).json({result:false,error})
    }
}