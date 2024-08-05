const Certificate = require("../models/Certificate");

exports.getAnalytics = async (req, res) => {
  try {
    const certificates = await Certificate.find().populate("recipient");
    const analytics = certificates.map((cert) => ({
      recipient: cert.recipient.name,
      email: cert.recipient.email,
      sentAt: cert.createdAt,
    }));

    res.status(200).json(analytics);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
