const nodemailer = require('nodemailer');
require('dotenv').config();
const path = require("path");

const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    secure: false, // Use `true` for port 465, `false` for all other ports
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
});

const mailOptions = {
    from: {
        name: "Certifiyeet",
        address: process.env.EMAIL,
    },
    to: 'hakeemabdullah87@gmail.com',
    subject: 'Testing email with attachment',
    text: 'This is a test email.',
    html: "<h1>Welcome to Certifiyeet</h1>",
};

const sendMail = async (transporter, mailOptions) => {
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Email Sent:", info.response);
    } catch (error) {
        console.error("Error sending email:", error);
    }
};

sendMail(transporter, mailOptions);
