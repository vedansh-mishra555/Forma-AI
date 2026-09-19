const express = require("express");
const mongoose = require("mongoose");
const Submission = require("../models/Submission");

const router = express.Router();

/* =====================================================
   GET ALL SUBMISSIONS
   GET /api/submissions
===================================================== */

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


/* =====================================================
   GET SINGLE SUBMISSION
   GET /api/submissions/:id
===================================================== */

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid submission ID"
      });
    }

    const submission = await Submission.findById(id);

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


/* =====================================================
   POST NEW SUBMISSION
   POST /api/submissions
===================================================== */

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
      data,
      status: "Pending"
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


/* =====================================================
   UPDATE CLAIM STATUS
   PATCH /api/submissions/:id/status
===================================================== */

router.patch("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid submission ID"
      });
    }

    const allowedStatuses = [
      "Pending",
      "Under Review",
      "Approved",
      "Rejected"
    ];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid claim status",
        allowedStatuses
      });
    }

    const submission =
      await Submission.findByIdAndUpdate(
        id,
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
    console.error("Status update error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update claim status"
    });
  }
});


/* =====================================================
   UPDATE SUBMISSION DATA
   PUT /api/submissions/:id
===================================================== */

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { data } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid submission ID"
      });
    }

    if (!data || typeof data !== "object") {
      return res.status(400).json({
        success: false,
        message: "Submission data is required"
      });
    }

    const submission =
      await Submission.findByIdAndUpdate(
        id,
        {
          data
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


/* =====================================================
   DELETE SUBMISSION
   DELETE /api/submissions/:id
===================================================== */

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid submission ID"
      });
    }

    const submission =
      await Submission.findByIdAndDelete(id);

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


/* =====================================================
   EXPORT ROUTER
===================================================== */

module.exports = router;