const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const certificateRoutes = require("./routes/certificateRoutes");
const recipientRoutes = require("./routes/recipientRoutes");
const templateRoutes = require("./routes/templateRoutes");
const userRoutes = require("./routes/userRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const errorHandler = require("./middleware/errorHandler");

dotenv.config();
connectDB();

const app = express();

app.use(express.json());
app.use("/api/v1/certificates", certificateRoutes);
app.use("/api/v1/recipients", recipientRoutes);
app.use("/api/v1/templates", templateRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/analytics", analyticsRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Generate your certificate with ease");
});
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
