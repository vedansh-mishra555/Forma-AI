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
      contents: `Extract insurance claim information from this text.

Return JSON with these fields:
fullName
email
incidentType
vehicle
damageType
policeReport
policeReportNumber

Allowed incidentType values:
accident, animal_collision, theft

Allowed damageType values:
windshield, engine, body

Allowed policeReport values:
yes, no

If information is missing, return an empty string.

Text:
${text}`,

      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            fullName: { type: "string" },
            email: { type: "string" },
            incidentType: { type: "string" },
            vehicle: { type: "string" },
            damageType: { type: "string" },
            policeReport: { type: "string" },
            policeReportNumber: { type: "string" }
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