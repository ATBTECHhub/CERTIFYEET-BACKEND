const { configDotenv } = require("dotenv");

configDotenv();

module.exports = {
  provider: "twilio",
  accountSid: process.env.TWILIO_ACCOUNT_SID,
  authToken: process.env.TWILO_ACCOUNT_TOKEN,
  from: process.env.TWILIO_PHONE_NUMBER,
};
