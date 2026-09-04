const express = require("express");

const router = express.Router();

router.post("/magic-input", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: "Text is required"
      });
    }

    res.json({
      success: true,
      message: "Magic Input received",
      text
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "AI processing failed"
    });
  }
});

module.exports = router;