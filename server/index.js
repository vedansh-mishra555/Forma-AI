const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const formRoutes = require("./routes/formRoutes");
const aiRoutes = require("./routes/aiRoutes");
const submissionRoutes = require("./routes/submissionRoutes");
const analysisRoutes = require("./routes/analysisRoutes");

const app = express();


// =====================================================
// DATABASE
// =====================================================

connectDB();


// =====================================================
// MIDDLEWARE
// =====================================================

app.use(
  cors({
    origin: "http://localhost:5173"
  })
);

app.use(
  express.json()
);


// =====================================================
// API ROUTES
// =====================================================

app.use(
  "/api/forms",
  formRoutes
);

app.use(
  "/api/ai",
  aiRoutes
);

app.use(
  "/api/submissions",
  submissionRoutes
);

app.use(
  "/api/analysis",
  analysisRoutes
);


// =====================================================
// HEALTH CHECK
// =====================================================

app.get(
  "/api/health",
  (req, res) => {
    res.json({
      success: true,
      message:
        "Forma AI Backend Running",
      version: "Day 20"
    });
  }
);


// =====================================================
// 404 HANDLER
// =====================================================

app.use(
  (req, res) => {
    res.status(404).json({
      success: false,
      message:
        "API route not found"
    });
  }
);


// =====================================================
// GLOBAL ERROR HANDLER
// =====================================================

app.use(
  (error, req, res, next) => {
    console.error(
      "❌ Server Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Internal server error"
    });
  }
);


// =====================================================
// START SERVER
// =====================================================

const PORT =
  process.env.PORT || 5000;

app.listen(
  PORT,
  () => {
    console.log(
      `🚀 Forma AI Server running on port ${PORT}`
    );
  }
);