const express = require("express");
const router = express.Router();
const recipientController = require("../controllers/recipientController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/add", authMiddleware, recipientController.addRecipients);
router.get("/", authMiddleware, recipientController.getRecipients);

module.exports = router;
