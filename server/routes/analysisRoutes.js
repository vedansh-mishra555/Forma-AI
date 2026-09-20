const express = require("express");
const Submission = require("../models/Submission");

const router = express.Router();


// =====================================================
// POST /api/analysis/:submissionId
// ANALYZE CLAIM
// =====================================================

router.post("/:submissionId", async (req, res) => {
  try {
    const { submissionId } = req.params;

    // =================================================
    // FIND CLAIM
    // =================================================

    const submission =
      await Submission.findById(
        submissionId
      );

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found"
      });
    }

    const data =
      submission.data || {};

    // =================================================
    // MISSING INFORMATION
    // =================================================

    const missingInformation = [];

    if (!data.fullName) {
      missingInformation.push(
        "Full Name"
      );
    }

    if (!data.email) {
      missingInformation.push(
        "Email Address"
      );
    }

    if (!data.vehicle) {
      missingInformation.push(
        "Vehicle Name"
      );
    }

    if (!data.incidentType) {
      missingInformation.push(
        "Incident Type"
      );
    }

    if (!data.damageType) {
      missingInformation.push(
        "Damage Type"
      );
    }

    if (!data.policeReport) {
      missingInformation.push(
        "Police Report"
      );
    }

    if (
      data.policeReport === "yes" &&
      !data.policeReportNumber
    ) {
      missingInformation.push(
        "Police Report Number"
      );
    }


    // =================================================
    // COMPLETENESS SCORE
    // =================================================

    const totalRequiredFields = 7;

    const completedFields =
      totalRequiredFields -
      missingInformation.length;

    let completenessScore = Math.round(
      (completedFields /
        totalRequiredFields) *
        100
    );

    completenessScore =
      Math.max(
        0,
        Math.min(
          100,
          completenessScore
        )
      );


    // =================================================
    // PRIORITY
    // =================================================

    let priority = "Low";

    if (
      completenessScore < 50
    ) {
      priority = "High";
    } else if (
      completenessScore < 80
    ) {
      priority = "Medium";
    }


    // =================================================
    // ISSUES
    // =================================================

    const issues = [];

    if (
      data.incidentType ===
        "accident" &&
      !data.policeReport
    ) {
      issues.push(
        "Police report information is missing for the accident claim."
      );
    }

    if (
      data.policeReport === "yes" &&
      !data.policeReportNumber
    ) {
      issues.push(
        "Police report number is missing."
      );
    }

    if (
      data.incidentType ===
        "theft" &&
      !data.policeReport
    ) {
      issues.push(
        "Police report information is recommended for a theft claim."
      );
    }

    if (
      !data.damageType
    ) {
      issues.push(
        "Damage information has not been provided."
      );
    }


    // =================================================
    // RECOMMENDATION
    // =================================================

    let recommendation =
      "Claim information is sufficient for initial processing.";

    if (
      missingInformation.length >
      0
    ) {
      recommendation =
        `Request the following information from the claimant: ${missingInformation.join(
          ", "
        )}.`;
    }


    // =================================================
    // SAVE ANALYSIS
    // =================================================

    submission.analysis = {
      completenessScore,
      priority,
      missingInformation,
      issues,
      recommendation,
      analyzedAt: new Date()
    };

    await submission.save();


    // =================================================
    // RESPONSE
    // =================================================

    res.json({
      success: true,
      message:
        "Claim analyzed successfully",
      analysis:
        submission.analysis
    });

  } catch (error) {
    console.error(
      "❌ Claim Analysis Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to analyze claim",
      error:
        error.message
    });
  }
});


module.exports = router;