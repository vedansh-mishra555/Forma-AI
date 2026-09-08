const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const submissionRoutes = require("./routes/submissionRoutes");

const formRoutes = require("./routes/formRoutes");
const aiRoutes = require("./routes/aiRoutes");

const app = express();

// Connect MongoDB
connectDB();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/forms", formRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/submissions", submissionRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Forma AI Backend Running"
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Forma AI Server running on port ${PORT}`);
});