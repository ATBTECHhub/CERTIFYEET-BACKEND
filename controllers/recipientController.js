const Recipient = require("../models/Recipient");

exports.addRecipients = async (req, res) => {
  try {
    const recipients = req.body.recipients;

    await Recipient.insertMany(recipients);

    res.status(201).json({ message: "Recipients added successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.getRecipients = async (req, res) => {
  try {
    const recipients = await Recipient.find();
    res.status(200).json(recipients);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
