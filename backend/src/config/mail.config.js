import nodemailer from "nodemailer";
import { createHTMLBody } from "../utils/utils.js";
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

        
        const result = await new Promise((resolve, reject) => {
            mailTransport.sendMail(mail, (err, info) => {
                if (err) {
                    reject({ result: false, message: err.message });
                } else {
                    resolve({ result: true, message: "Mail Sent Successfully.!" });
                }
            });
        });

        return result;


    } catch (error) {
        return {
            result: false,
            message: error
        }
    }
}
