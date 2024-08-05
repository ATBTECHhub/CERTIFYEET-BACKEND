const express = require("express");
const router = express.Router();
const certificateController = require("../controllers/certificateController");

router.post("/create", certificateController.createCertificate);
router.post("/send", certificateController.sendCertificates);

module.exports = router;
