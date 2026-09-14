const express = require("express");
const { GoogleGenAI } = require("@google/genai");
const Submission = require("../models/Submission");

const router = express.Router();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

// =========================
// AI CLAIM ANALYSIS
// =========================

router.post("/:submissionId", async (req, res) => {
  try {
    const { submissionId } = req.params;

    // Find submission from MongoDB
    const submission = await Submission.findById(submissionId);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found"
      });
    }

    console.log("Analyzing submission:", submissionId);

    // Send submission data to Gemini
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",

      contents: `
You are an AI insurance claim quality analyzer.

Analyze the following insurance claim submission.

Your job is to:

1. Calculate a completeness score from 0 to 100.
2. Identify missing information.
3. Identify possible inconsistencies or issues.
4. Assign a priority:
   - Low
   - Medium
   - High
5. Give a short recommendation.

Rules:
- Do not invent information.
- Only analyze the information provided.
- Be concise and professional.
- If there are no issues, return an empty array for issues.
- If there is no missing information, return an empty array for missingInformation.

Return ONLY valid JSON.

Required JSON structure:

{
  "completenessScore": 0,
  "priority": "Low",
  "missingInformation": [],
  "issues": [],
  "recommendation": ""
}

Insurance Claim Submission:

${JSON.stringify(submission.data, null, 2)}
`,

      config: {
        responseMimeType: "application/json",

        responseSchema: {
          type: "object",

          properties: {
            completenessScore: {
              type: "number"
            },

            priority: {
              type: "string"
            },

            missingInformation: {
              type: "array",
              items: {
                type: "string"
              }
            },

            issues: {
              type: "array",
              items: {
                type: "string"
              }
            },

            recommendation: {
              type: "string"
            }
          },

          required: [
            "completenessScore",
            "priority",
            "missingInformation",
            "issues",
            "recommendation"
          ]
        }
      }
    });

    console.log("AI analysis received");

    const analysis = JSON.parse(response.text);

    // Send analysis to frontend
    res.json({
      success: true,
      message: "Submission analyzed successfully",
      analysis
    });

  } catch (error) {
    console.error("========== ANALYSIS ERROR ==========");
    console.error(error);
    console.error("====================================");

    res.status(500).json({
      success: false,
      message: "Failed to analyze submission",
      error: error.message
    });
  }
});

module.exports = router;