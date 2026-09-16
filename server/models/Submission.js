const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    formId: {
      type: String,
      required: true
    },

    data: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },

    // AI Claim Analysis
    analysis: {
      completenessScore: {
        type: Number,
        default: null
      },

      priority: {
        type: String,
        enum: ["High", "Medium", "Low"],
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