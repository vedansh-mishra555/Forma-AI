const express = require("express");
const Submission = require("../models/Submission");

const router = express.Router();

// =========================
// GET ALL SUBMISSIONS
// =========================

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

// =========================
// POST A NEW SUBMISSION
// =========================

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

// =========================
// DELETE A SUBMISSION
// =========================

router.delete("/:id", async (req, res) => {
  try {
    const submission = await Submission.findByIdAndDelete(
      req.params.id
    );

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found"
      });
    }

    res.json({
      success: true,
      message: "Submission deleted successfully"
    });
  } catch (error) {
    console.error("Delete submission error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete submission"
    });
  }
});

module.exports = router;