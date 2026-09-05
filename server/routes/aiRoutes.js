const express = require("express");
const { GoogleGenAI } = require("@google/genai");

const router = express.Router();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

router.post("/magic-input", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: "Text is required"
      });
    }

    console.log("Magic Input received:", text);

    console.log(
      "Gemini API key loaded:",
      process.env.GEMINI_API_KEY ? "YES" : "NO"
    );

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",

      contents: `You are an insurance claim form assistant.

Extract information from the user's text and return ONLY the requested JSON fields.

Rules:
1. Do not invent information.
2. If a value is not mentioned, return an empty string.
3. Use the exact allowed values for incidentType, damageType, and policeReport.
4. Match natural language to the closest allowed value.
5. Keep names, emails, vehicle names, and report numbers exactly as provided.

Fields to extract:

fullName:
The claimant's full name.

email:
The claimant's email address.

incidentType:
Must be one of:
accident
animal_collision
theft

vehicle:
The vehicle name or model.

damageType:
Must be one of:
windshield
engine
body

policeReport:
Must be one of:
yes
no

policeReportNumber:
The police report number, if mentioned.

If information is missing, return an empty string.

User text:
${text}`,

      config: {
        responseMimeType: "application/json",

        responseSchema: {
          type: "object",

          properties: {
            fullName: {
              type: "string"
            },

            email: {
              type: "string"
            },

            incidentType: {
              type: "string"
            },

            vehicle: {
              type: "string"
            },

            damageType: {
              type: "string"
            },

            policeReport: {
              type: "string"
            },

            policeReportNumber: {
              type: "string"
            }
          }
        }
      }
    });

    console.log("Gemini response received");

    const extractedData = JSON.parse(response.text);

    res.json({
      success: true,
      data: extractedData
    });

  } catch (error) {
    console.error("========== GEMINI ERROR ==========");
    console.error(error);
    console.error("===================================");

    res.status(500).json({
      success: false,
      message: "AI processing failed",
      error: error.message
    });
  }
});

module.exports = router;