const mongoose = require("mongoose");

const RecipientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
  },
});

module.exports = mongoose.model("Recipient", RecipientSchema);
