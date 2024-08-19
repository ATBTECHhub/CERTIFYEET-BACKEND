// certificateController.js
const Certificate = require("../models/Certificate");
const Recipient = require("../models/Recipient");
const Link = require("../models/Link");
const { generateLink } = require("../utils/linkGenerator");
const { sendSMS } = require("../utils/smsSender");
const sendEmail = require("../utils/email");

exports.createCertificate = async (req, res) => {
  try {
    const { templateId, recipients } = req.body;

    const certificates = recipients.map((recipient) => {
      return { template: templateId, recipient: recipient._id };
    });

    const newCerts = await Certificate.insertMany(certificates);

    res
      .status(201)
      .json({ message: "Certificates created successfully", newCerts });
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

      // Send email notification to recipient's email address.
      await sendEmail({
        email: certificate.recipient.email,
        subject: "Here's the Link to download your Certificate",
        message: `"<p>Here's the Link to download your Certificate: <a href="${link}">🔗 Download your Certificate</a></p>`,
      });

      // Send SMS notification if recipient's phone number is provided.
      // await sendSMS(certificate.recipient.phone, link);
    }

    res.status(200).json({ message: "Certificates sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
