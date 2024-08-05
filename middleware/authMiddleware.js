const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.verifyToken = async (req, res, next) => {
  console.log(req.body);
  console.log(req.header("Authorization"));
  const token = req.header("Authorization").split(" ")[1];
  console.log(token, !token);
  try {
    const decodedToken = jwt.decode(token, process.env.JWT_SECRET);
    const user = await User.findById(decodedToken.id);
    req.user = user;
    next();
  } catch (err) {
    res.status(400).json({ message: "Invalid Token" });
  }
};

// module.exports = (req, res, next) => {
//   const token = req.header("Authorization").replace("Bearer ", "");

//   if (!token) {
//     return res.status(401).json({ message: "No token, authorization denied" });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded;
//     next();
//   } catch (error) {
//     res.status(401).json({ message: "Token is not valid" });
//   }
// };
