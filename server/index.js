const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const formRoutes = require("./routes/formRoutes");
const aiRoutes = require("./routes/aiRoutes");
const submissionRoutes = require("./routes/submissionRoutes");
const analysisRoutes = require("./routes/analysisRoutes");

const app = express();

// =========================
// CONNECT MONGODB
// =========================

connectDB();

// =========================
// MIDDLEWARE
// =========================

app.use(cors());
app.use(express.json());

// =========================
// ROUTES
// =========================

app.use("/api/forms", formRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/analysis", analysisRoutes);

// =========================
// HEALTH CHECK
// =========================

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Forma AI Backend Running"
  });
});

// =========================
// START SERVER
// =========================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Forma AI Server running on port ${PORT}`);
});