const twilio = require("twilio");
const smsConfig = require("../config/sms");

const client = new twilio(smsConfig.accountSid, smsConfig.authToken);

exports.sendSMS = async (to, link) => {
  try {
    await client.messages.create({
      body: `You can access your certificate at the following link: ${link}`,
      from: smsConfig.from,
      to,
    });
  } catch (error) {
    console.error("Error sending SMS:", error);
  }
};
