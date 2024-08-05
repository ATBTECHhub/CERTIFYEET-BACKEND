const nodemailer = require("nodemailer");
const emailConfig = require("../config/email");

const transporter = nodemailer.createTransport(emailConfig);

exports.sendEmail = async (to, link) => {
  const mailOptions = {
    from: emailConfig.auth.user,
    to,
    subject: "Your Certificate",
    text: `You can access your certificate at the following link: ${link}`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
