const express = require("express");
const cors = require("cors");
require("dotenv").config();

const formRoutes = require("./routes/formRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/forms", formRoutes);

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