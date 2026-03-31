const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");

const authRoutes = require("./routes/authRoutes");
const patientRoutes = require("./routes/patientRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const adminRoutes = require("./routes/adminRoutes");
const { notFound, errorHandler } = require("./middlewares/errorMiddleware");

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Clinic workflow backend is running." });
});

app.use("/api/auth", authRoutes);
app.use("/api/patient", patientRoutes);
app.use("/api/doctor", doctorRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
