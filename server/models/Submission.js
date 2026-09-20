const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    // =====================================================
    // FORM INFORMATION
    // =====================================================

    formId: {
      type: String,
      required: true,
      trim: true
    },

    // =====================================================
    // CLAIM DATA
    // =====================================================

    data: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },

    // =====================================================
    // AI CLAIM ANALYSIS
    // =====================================================

    analysis: {
      completenessScore: {
        type: Number,
        min: 0,
        max: 100,
        default: null
      },

      priority: {
        type: String,
        enum: ["High", "Medium", "Low", null],
        default: null
      },

      missingInformation: {
        type: [String],
        default: []
      },

      issues: {
        type: [String],
        default: []
      },

      recommendation: {
        type: String,
        default: ""
      },

      analyzedAt: {
        type: Date,
        default: null
      }
    },

    // =====================================================
    // CLAIM STATUS
    // =====================================================

    status: {
      type: String,
      enum: [
        "Pending",
        "Under Review",
        "Approved",
        "Rejected"
      ],
      default: "Pending"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "Submission",
  submissionSchema
);