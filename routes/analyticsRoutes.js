const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analyticsController");
const { protect, restrictTo } = require("../controllers/authController");

router.get("/", protect, restrictTo("admin"), analyticsController.getAnalytics);

module.exports = router;
