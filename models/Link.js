const mongoose = require("mongoose");

const LinkSchema = new mongoose.Schema({
  certificate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Certificate",
    required: true,
  },
  url: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Link", LinkSchema);
