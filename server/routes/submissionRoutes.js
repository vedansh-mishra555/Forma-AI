const express = require("express");
const Submission = require("../models/Submission");

const router = express.Router();

// GET all submissions
router.get("/", async (req, res) => {
  try {
    const submissions = await Submission.find()
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      submissions
    });
  } catch (error) {
    console.error("Fetch submissions error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch submissions"
    });
  }
});

// POST a new submission
router.post("/", async (req, res) => {
  try {
    const { formId, data } = req.body;

    if (!formId || !data) {
      return res.status(400).json({
        success: false,
        message: "formId and data are required"
      });
    }

    const submission = await Submission.create({
      formId,
      data
    });

    res.status(201).json({
      success: true,
      message: "Submission saved successfully",
      submission
    });
  } catch (error) {
    console.error("Submission error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to save submission"
    });
  }
});

module.exports = router;