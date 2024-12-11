import jwtToken from "jsonwebtoken";
import bcrypt, { hash } from "bcrypt";
export function generateOTP() {
    const length = 6;
    const otp = Math.floor(Math.random() * (Math.pow(10, length) - Math.pow(10, length - 1)) + Math.pow(10, length - 1));
    return otp.toString();
}

export function createHTMLBody(body){

}

export function generateToken(data){
    return jwtToken.sign(data,process.env.SECRET_KEY);
}

export function generateHashPassword(password){
    bcrypt.hash(password, 10, function(err, hash) {
        return hash;
    });
}

export async function verifyPassword(password,hashedPassword){
    return await  bcrypt.compare(password,hashedPassword);
}