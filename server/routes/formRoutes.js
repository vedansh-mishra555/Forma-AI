const express = require("express");

const router = express.Router();

const insuranceClaimForm = {
  formId: "insurance-claim",

  title: "Insurance Claim Form",

  description: "Submit your vehicle insurance claim",

  fields: [
    {
      name: "fullName",
      label: "Full Name",
      type: "text",
      required: true,
      validation: {
        minLength: 3
      }
    },

    {
      name: "email",
      label: "Email Address",
      type: "email",
      required: true,
      validation: {
        pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$"
      }
    },

    {
      name: "incidentType",
      label: "Type of Incident",
      type: "select",
      required: true,
      options: [
        {
          label: "Accident",
          value: "accident"
        },
        {
          label: "Animal Collision",
          value: "animal_collision"
        },
        {
          label: "Theft",
          value: "theft"
        }
      ]
    },

    {
      name: "vehicle",
      label: "Vehicle Name",
      type: "text",
      required: true,
      validation: {
        minLength: 2
      }
    },

    {
      name: "damageType",
      label: "Type of Damage",
      type: "select",
      required: true,
      options: [
        {
          label: "Windshield",
          value: "windshield"
        },
        {
          label: "Engine",
          value: "engine"
        },
        {
          label: "Body",
          value: "body"
        }
      ]
    },

    {
      name: "policeReport",
      label: "Do you have a police report?",
      type: "select",
      required: true,
      options: [
        {
          label: "Yes",
          value: "yes"
        },
        {
          label: "No",
          value: "no"
        }
      ]
    },

    {
      name: "policeReportNumber",
      label: "Police Report Number",
      type: "text",
      required: true,

      showIf: {
        field: "policeReport",
        equals: "yes"
      }
    }
  ]
};

router.get("/:formId", (req, res) => {
  if (req.params.formId !== insuranceClaimForm.formId) {
    return res.status(404).json({
      success: false,
      message: "Form not found"
    });
  }

  res.json({
    success: true,
    form: insuranceClaimForm
  });
});

module.exports = router;