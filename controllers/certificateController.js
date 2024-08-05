// certificateController.js
const Certificate = require("../models/Certificate");
const Recipient = require("../models/Recipient");
const Link = require("../models/Link");
const { generateLink } = require("../utils/linkGenerator");
const { sendEmail } = require("../utils/emailSender");
const { sendSMS } = require("../utils/smsSender");

exports.createCertificate  = async (req, res) => {
  try {
    const { templateId, recipients } = req.body;

    const certificates = recipients.map((recipient) => {
      return { template: templateId, recipient: recipient._id };
    });

    await Certificate.insertMany(certificates);

    res.status(201).json({ message: "Certificates created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.sendCertificates = async (req, res) => {
  try {
    const { certificateIds } = req.body;

    for (const certificateId of certificateIds) {
      const certificate = await Certificate.findById(certificateId).populate(
        "recipient"
      );
      const link = await generateLink(certificate._id);

      await sendEmail(certificate.recipient.email, link);
      await sendSMS(certificate.recipient.phone, link);
    }

    res.status(200).json({ message: "Certificates sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
