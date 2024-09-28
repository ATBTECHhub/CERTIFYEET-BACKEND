const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

dotenv.config();
connectDB();

const app = express();

app.use(express.json());
app.use("/api/auths", require("./routes/authRoutes"));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Generate your certificate with ease");
});
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
