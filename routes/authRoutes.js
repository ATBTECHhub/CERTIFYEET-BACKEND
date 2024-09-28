const express = require("express");
const {
    register,
    login,
    forgotPassword,
    changePassword
} = require("../controllers/authController");
const router = express.Router();


//Register User
router.post("/register", register);

//Login User
router.post("/login", login);

//forgot Password
router.post("/forgot-password", forgotPassword);

//change Password
router.post("/change-password", changePassword);

module.exports = router;
