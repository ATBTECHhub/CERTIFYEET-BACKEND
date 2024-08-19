const express = require("express");
const router = express.Router();
const recipientController = require("../controllers/recipientController");
const { protect } = require("../controllers/authController");

router.use(protect);

router
  .route("/")
  .get(recipientController.getRecipients)
  .post(recipientController.addRecipients);

module.exports = router;
