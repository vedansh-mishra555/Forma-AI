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
// GET SINGLE SUBMISSION
// =========================

router.get("/:id", async (req, res) => {
  try {
    const submission = await Submission.findById(
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
      submission
    });
  } catch (error) {
    console.error("Fetch submission error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch submission"
    });
  }
});

// =========================
// UPDATE SUBMISSION
// =========================

router.put("/:id", async (req, res) => {
  try {
    const { data } = req.body;

    if (!data) {
      return res.status(400).json({
        success: false,
        message: "Submission data is required"
      });
    }

    const submission = await Submission.findByIdAndUpdate(
      req.params.id,
      { data },
      {
        new: true,
        runValidators: true
      }
    );

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found"
      });
    }

    res.json({
      success: true,
      message: "Submission updated successfully",
      submission
    });
  } catch (error) {
    console.error("Update submission error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update submission"
    });
  }
});

// =========================
// DELETE SUBMISSION
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