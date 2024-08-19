const express = require("express");
const router = express.Router();
const certificateController = require("../controllers/certificateController");

router.route("/").post(certificateController.createCertificate);
router.post("/send", certificateController.sendCertificates);

module.exports = router;
