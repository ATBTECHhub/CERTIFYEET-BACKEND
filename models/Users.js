const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "Please tell us your firstname!"],
  },
  lastName: {
    type: String,
    required: [true, "Please enter your lastname!"],
  },
  companyName: {
    type: String,
    required: [false, "Please tell us your name!"],
  },
  email: {
    type: String,
    required: [true, "Please provide your email"],
    unique: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  password: {
    type: String,
    required: true,
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  isActive: {
    type: Boolean,
    default: true,
  },
}, {timestamps: true});

module.exports = mongoose.model("User", userSchema);
