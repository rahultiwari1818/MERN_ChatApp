import nodemailer from "nodemailer";
import { createHTMLBody } from "../utils/utils.js";
import dotenv from "dotenv"
dotenv.config();


const mailTransport = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: process.env.EMAIL_ID,
        pass: process.env.EMAIL_PASSWD
    }
});


export const sendMail = async (to, subject, body) => {
    try {


        const mail = {
            from: process.env.EMAIL_ID,
            to,
            subject,
            html: createHTMLBody(body)
        }
        mailTransport.sendMail(mail);

        return  {
                    result: true,
                    message: "Mail Sent Successfully.!"
                };



    } catch (error) {
        return {
            result: false,
            message: error
        }
    }
}

