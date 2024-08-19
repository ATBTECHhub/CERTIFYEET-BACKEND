const express = require("express");
const router = express.Router();
const templateController = require("../controllers/templateController");
const { protect } = require("../controllers/authController");

router.use(protect);

router
  .route("/")
  .get(templateController.getTemplates)
  .post(templateController.createTemplate);

module.exports = router;
