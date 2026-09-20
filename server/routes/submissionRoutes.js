const express = require("express");
const Submission = require("../models/Submission");

const router = express.Router();


// =====================================================
// GET ALL SUBMISSIONS
// GET /api/submissions
// =====================================================

router.get("/", async (req, res) => {
  try {
    const submissions = await Submission.find()
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: submissions.length,
      submissions
    });

  } catch (error) {
    console.error(
      "❌ Fetch submissions error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch submissions"
    });
  }
});


// =====================================================
// GET SINGLE SUBMISSION
// GET /api/submissions/:id
// =====================================================

router.get("/:id", async (req, res) => {
  try {
    const submission =
      await Submission.findById(
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
    console.error(
      "❌ Fetch submission error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch submission"
    });
  }
});


// =====================================================
// CREATE NEW SUBMISSION
// POST /api/submissions
// =====================================================

router.post("/", async (req, res) => {
  try {
    const { formId, data } = req.body;

    // Validation
    if (!formId) {
      return res.status(400).json({
        success: false,
        message: "formId is required"
      });
    }

    if (!data || typeof data !== "object") {
      return res.status(400).json({
        success: false,
        message: "Valid submission data is required"
      });
    }

    const submission =
      await Submission.create({
        formId,
        data,
        status: "Pending"
      });

    res.status(201).json({
      success: true,
      message: "Claim submitted successfully",
      submission
    });

  } catch (error) {
    console.error(
      "❌ Submission error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to save submission"
    });
  }
});


// =====================================================
// UPDATE CLAIM STATUS
// PATCH /api/submissions/:id/status
// =====================================================

router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "Pending",
      "Under Review",
      "Approved",
      "Rejected"
    ];

    if (
      !status ||
      !allowedStatuses.includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid claim status",
        allowedStatuses
      });
    }

    const submission =
      await Submission.findByIdAndUpdate(
        req.params.id,
        {
          status
        },
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
      message: "Claim status updated successfully",
      submission
    });

  } catch (error) {
    console.error(
      "❌ Status update error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to update claim status"
    });
  }
});


// =====================================================
// UPDATE CLAIM DATA
// PUT /api/submissions/:id
// =====================================================

router.put("/:id", async (req, res) => {
  try {
    const { data } = req.body;

    if (!data || typeof data !== "object") {
      return res.status(400).json({
        success: false,
        message: "Valid submission data is required"
      });
    }

    const submission =
      await Submission.findByIdAndUpdate(
        req.params.id,
        {
          data,

          // Old analysis is no longer valid
          // after claim data changes.
          analysis: {
            completenessScore: null,
            priority: null,
            missingInformation: [],
            issues: [],
            recommendation: "",
            analyzedAt: null
          }
        },
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
      message: "Claim updated successfully",
      submission
    });

  } catch (error) {
    console.error(
      "❌ Update submission error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to update submission"
    });
  }
});


// =====================================================
// DELETE CLAIM
// DELETE /api/submissions/:id
// =====================================================

router.delete("/:id", async (req, res) => {
  try {
    const submission =
      await Submission.findByIdAndDelete(
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
      message: "Claim deleted successfully"
    });

  } catch (error) {
    console.error(
      "❌ Delete submission error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to delete submission"
    });
  }
});


module.exports = router;