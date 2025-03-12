import jwtToken from "jsonwebtoken";
import bcrypt, { hash } from "bcrypt";
export function generateOTP() {
    const length = 6;
    const otp = Math.floor(Math.random() * (Math.pow(10, length) - Math.pow(10, length - 1)) + Math.pow(10, length - 1));
    return otp.toString();
}

export function createHTMLBody(body) {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 0;
                }
                .container {
                    width: 100%;
                    max-width: 600px;
                    margin: 20px auto;
                    background-color: #ffffff;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    overflow: hidden;
                }
                .header {
                    background-color: #4CAF50;
                    color: white;
                    text-align: center;
                    padding: 20px;
                    font-size: 24px;
                }
                .content {
                    padding: 20px;
                    line-height: 1.6;
                    color: #333;
                }
                .footer {
                    text-align: center;
                    padding: 10px;
                    background-color: #f4f4f4;
                    color: #666;
                    font-size: 12px;
                }
                a {
                    color: #4CAF50;
                    text-decoration: none;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <strong>Chat App</strong>
                </div>
                <div class="content">
                    ${body}
                </div>
                <div class="footer">
                    <p>© ${new Date().getFullYear()} Vartalaap. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;
}


export function generateToken(data){
    return jwtToken.sign(data,process.env.SECRET_KEY);
}

export async function  generateHashPassword(password){
    return await new Promise((resolve,reject) =>{
        bcrypt.hash(password, 10, function(err, hash) {
            resolve(hash);
        });
    })

}

export async function verifyPassword(password,hashedPassword){
    return await  bcrypt.compare(password,hashedPassword);
}