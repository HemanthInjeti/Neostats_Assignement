const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const caseRoutes = require("./routes/caseRoutes");
const pollRoutes = require("./routes/pollRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const meetingRoutes = require("./routes/meetingRoutes");
const startEscalationJob = require("./jobs/escalationJob");

const app = express();
connectDB();
startEscalationJob();

const allowedOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("CORS origin not allowed"));
    },
    credentials: true
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRoutes);
app.use("/api/cases", caseRoutes);
app.use("/api/polls", pollRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/minutes", meetingRoutes);

app.use((error, _req, res, _next) => {
  if (error.message) {
    return res.status(400).json({ message: error.message });
  }

  return res.status(500).json({ message: "Server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
