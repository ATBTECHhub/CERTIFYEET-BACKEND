const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.get(
  "/",
  authMiddleware,
  roleMiddleware(["admin"]),
  userController.getUsers
);
router.patch(
  "/update",
  authMiddleware,
  roleMiddleware(["admin"]),
  userController.updateUser
);

module.exports = router;
