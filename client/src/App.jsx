import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import API from "./api";
import "./App.css";

function App() {
  const [formSchema, setFormSchema] = useState(null);
  const [loading, setLoading] = useState(true);

  /* =====================================================
     MAGIC INPUT
  ===================================================== */

  const [magicText, setMagicText] = useState("");
  const [magicLoading, setMagicLoading] = useState(false);
  const [aiPreview, setAiPreview] = useState(null);

  /* =====================================================
     FORM SUBMISSION
  ===================================================== */

  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  /* =====================================================
     SUBMISSIONS
  ===================================================== */

  const [submissions, setSubmissions] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  /* =====================================================
     VIEW / EDIT
  ===================================================== */

  const [selectedSubmission, setSelectedSubmission] =
    useState(null);

  const [editData, setEditData] = useState({});
  const [editLoading, setEditLoading] = useState(false);

  /* =====================================================
     AI ANALYSIS
  ===================================================== */

  const [analysis, setAnalysis] = useState(null);
  const [, setAnalysisLoading] = useState(false);
  const [analyzingSubmissionId, setAnalyzingSubmissionId] =
    useState(null);

  /* =====================================================
     SEARCH / FILTER
  ===================================================== */

  const [searchText, setSearchText] = useState("");
  const [incidentFilter, setIncidentFilter] =
    useState("all");

  const [sortOrder, setSortOrder] =
    useState("newest");

  /* =====================================================
     TOAST
  ===================================================== */

  const [toast, setToast] = useState(null);

  /* =====================================================
     REACT HOOK FORM
  ===================================================== */

  const {
    register,
    watch,
    handleSubmit,
    setValue,
    reset,
    formState: { errors }
  } = useForm();

  /* =====================================================
     TOAST FUNCTION
  ===================================================== */

  const showToast = (message, type = "success") => {
    setToast({
      message,
      type
    });

    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  /* =====================================================
     LOAD FORM
  ===================================================== */

  useEffect(() => {
    API.get("/forms/insurance-claim")
      .then((response) => {
        setFormSchema(response.data.form);
        setLoading(false);
      })
      .catch((error) => {
        console.error(
          "Form loading failed:",
          error
        );

        setLoading(false);

        showToast(
          "Failed to load insurance form",
          "error"
        );
      });
  }, []);

  /* =====================================================
     LOAD SUBMISSIONS
  ===================================================== */

  const loadSubmissions = async () => {
    try {
      setHistoryLoading(true);

      const response = await API.get("/submissions");

      setSubmissions(
        response.data.submissions || []
      );
    } catch (error) {
      console.error(
        "Failed to load submissions:",
        error
      );

      showToast(
        "Failed to load submissions",
        "error"
      );
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  /* =====================================================
     AUTO SAVE DRAFT
  ===================================================== */

  const formValues = watch();

  useEffect(() => {
    const hasData = Object.values(formValues).some(
      (value) => value
    );

    if (hasData) {
      localStorage.setItem(
        "forma-ai-draft",
        JSON.stringify(formValues)
      );
    }
  }, [formValues]);

  /* =====================================================
     LOAD DRAFT
  ===================================================== */

  useEffect(() => {
    const savedDraft =
      localStorage.getItem("forma-ai-draft");

    if (!savedDraft) return;

    try {
      const draft = JSON.parse(savedDraft);

      Object.entries(draft).forEach(
        ([field, value]) => {
          if (value) {
            setValue(field, value);
          }
        }
      );
    } catch (error) {
      console.error(
        "Draft loading failed:",
        error
      );
    }
  }, [setValue]);

  /* =====================================================
     CLEAR FORM
  ===================================================== */

  const clearForm = () => {
    reset();

    setMagicText("");
    setAiPreview(null);

    localStorage.removeItem(
      "forma-ai-draft"
    );

    showToast(
      "Form cleared successfully",
      "success"
    );
  };

  /* =====================================================
     VIEW SUBMISSION
  ===================================================== */

  const viewSubmission = async (id) => {
    try {
      const response = await API.get(
        `/submissions/${id}`
      );

      setSelectedSubmission(
        response.data.submission
      );

      setEditData(
        response.data.submission.data
      );

      // Load previously saved AI analysis from MongoDB
      if (response.data.submission.analysis) {
        setAnalysis({
          submissionId: id,
          ...response.data.submission.analysis
        });
      } else {
        setAnalysis(null);
      }
    } catch (error) {
      console.error(
        "Failed to load submission:",
        error
      );

      showToast(
        "Failed to load submission",
        "error"
      );
    }
  };

  /* =====================================================
     UPDATE SUBMISSION
  ===================================================== */

  const updateSubmission = async () => {
    if (!selectedSubmission) return;

    try {
      setEditLoading(true);

      await API.put(
        `/submissions/${selectedSubmission._id}`,
        {
          data: editData
        }
      );

      setAnalysis(null);
      setSelectedSubmission(null);
      setEditData({});

      await loadSubmissions();

      showToast(
        "Claim updated successfully!",
        "success"
      );
    } catch (error) {
      console.error(
        "Update failed:",
        error
      );

      showToast(
        "Failed to update claim",
        "error"
      );
    } finally {
      setEditLoading(false);
    }
  };

  /* =====================================================
     DELETE SUBMISSION
  ===================================================== */

  const deleteSubmission = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this claim?"
    );

    if (!confirmed) return;

    try {
      await API.delete(
        `/submissions/${id}`
      );

      setSubmissions((current) =>
        current.filter(
          (submission) =>
            submission._id !== id
        )
      );

      if (
        selectedSubmission &&
        selectedSubmission._id === id
      ) {
        setSelectedSubmission(null);
        setEditData({});
      }

      if (
        analysis &&
        analysis.submissionId === id
      ) {
        setAnalysis(null);
      }

      showToast(
        "Claim deleted successfully!",
        "success"
      );
    } catch (error) {
      console.error(
        "Delete failed:",
        error
      );

      showToast(
        "Failed to delete claim",
        "error"
      );
    }
  };

  /* =====================================================
     AI CLAIM ANALYSIS
  ===================================================== */

  const analyzeSubmission = async (id) => {
    try {
      setAnalysisLoading(true);
      setAnalyzingSubmissionId(id);
      setAnalysis(null);

      const response = await API.post(
        `/analysis/${id}`
      );

      if (response.data.success) {
        setAnalysis({
          submissionId: id,
          ...response.data.analysis
        });

        showToast(
          "AI analysis completed!",
          "success"
        );
      }
    } catch (error) {
      console.error(
        "AI analysis error:",
        error
      );

      showToast(
        error.response?.data?.message ||
          "Failed to analyze claim",
        "error"
      );
    } finally {
      setAnalysisLoading(false);
      setAnalyzingSubmissionId(null);
    }
  };

  /* =====================================================
     MAGIC INPUT
  ===================================================== */

  const handleMagicInput = async () => {
    if (!magicText.trim()) {
      showToast(
        "Please describe your claim first",
        "error"
      );

      return;
    }

    try {
      setMagicLoading(true);
      setAiPreview(null);

      const response = await API.post(
        "/ai/magic-input",
        {
          text: magicText
        }
      );

      setAiPreview(
        response.data.data
      );

      showToast(
        "AI information extracted!",
        "success"
      );
    } catch (error) {
      console.error(
        "AI processing failed:",
        error
      );

      showToast(
        "AI processing failed",
        "error"
      );
    } finally {
      setMagicLoading(false);
    }
  };

  /* =====================================================
     APPLY AI DATA
  ===================================================== */

  const applyAIData = () => {
    if (!aiPreview) return;

    Object.keys(aiPreview).forEach(
      (field) => {
        if (aiPreview[field]) {
          setValue(
            field,
            aiPreview[field]
          );
        }
      }
    );

    setAiPreview(null);

    showToast(
      "AI data applied to the form!",
      "success"
    );
  };

  /* =====================================================
     SUBMIT FORM
  ===================================================== */

  const onSubmit = async (data) => {
    try {
      setSubmitLoading(true);
      setSubmitSuccess(false);

      await API.post(
        "/submissions",
        {
          formId: formSchema.formId,
          data
        }
      );

      setSubmitSuccess(true);

      await loadSubmissions();

      reset();

      setMagicText("");
      setAiPreview(null);

      localStorage.removeItem(
        "forma-ai-draft"
      );

      showToast(
        "Claim submitted successfully!",
        "success"
      );
    } catch (error) {
      console.error(
        "Submission failed:",
        error
      );

      showToast(
        "Failed to submit claim",
        "error"
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  /* =====================================================
     CONDITIONAL FIELDS
  ===================================================== */

  const shouldShowField = (field) => {
    if (!field.showIf) {
      return true;
    }

    const value = watch(
      field.showIf.field
    );

    return (
      value === field.showIf.equals
    );
  };

  /* =====================================================
     SEARCH + FILTER
  ===================================================== */

  const filteredSubmissions = useMemo(() => {
    let result = [...submissions];

    /* SEARCH */

    if (searchText.trim()) {
      const search =
        searchText.toLowerCase();

      result = result.filter(
        (submission) => {
          const data =
            submission.data || {};

          return (
            String(
              data.fullName || ""
            )
              .toLowerCase()
              .includes(search) ||
            String(
              data.email || ""
            )
              .toLowerCase()
              .includes(search) ||
            String(
              data.vehicle || ""
            )
              .toLowerCase()
              .includes(search) ||
            String(
              data.incidentType || ""
            )
              .toLowerCase()
              .includes(search)
          );
        }
      );
    }

    /* INCIDENT FILTER */

    if (incidentFilter !== "all") {
      result = result.filter(
        (submission) =>
          submission.data
            ?.incidentType ===
          incidentFilter
      );
    }

    /* SORT */

    result.sort((a, b) => {
      const dateA = new Date(
        a.createdAt
      ).getTime();

      const dateB = new Date(
        b.createdAt
      ).getTime();

      return sortOrder === "newest"
        ? dateB - dateA
        : dateA - dateB;
    });

    return result;
  }, [
    submissions,
    searchText,
    incidentFilter,
    sortOrder
  ]);

  /* =====================================================
     DASHBOARD STATISTICS
  ===================================================== */

  const totalClaims =
    submissions.length;

  const accidentClaims =
    submissions.filter(
      (submission) =>
        submission.data
          ?.incidentType ===
        "accident"
    ).length;

  const theftClaims =
    submissions.filter(
      (submission) =>
        submission.data
          ?.incidentType ===
        "theft"
    ).length;

  const animalClaims =
    submissions.filter(
      (submission) =>
        submission.data
          ?.incidentType ===
        "animal_collision"
    ).length;

  /* =====================================================
     ADVANCED CLAIM ANALYTICS
  ===================================================== */

  const analytics = useMemo(() => {
    const total = submissions.length;

    const accidents = submissions.filter(
      (submission) =>
        submission.data?.incidentType === "accident"
    ).length;

    const thefts = submissions.filter(
      (submission) =>
        submission.data?.incidentType === "theft"
    ).length;

    const animalCollisions = submissions.filter(
      (submission) =>
        submission.data?.incidentType === "animal_collision"
    ).length;

    // Count all analyses saved in MongoDB
    const analyzedSubmissions = submissions.filter(
      (submission) =>
        submission.analysis &&
        typeof submission.analysis.completenessScore === "number"
    );

    const analyzed = analyzedSubmissions.length;

    const highPriority = analyzedSubmissions.filter(
      (submission) =>
        submission.analysis?.priority === "High"
    ).length;

    const mediumPriority = analyzedSubmissions.filter(
      (submission) =>
        submission.analysis?.priority === "Medium"
    ).length;

    const lowPriority = analyzedSubmissions.filter(
      (submission) =>
        submission.analysis?.priority === "Low"
    ).length;

    return {
      total,
      accidents,
      thefts,
      animalCollisions,
      analyzed,
      highPriority,
      mediumPriority,
      lowPriority
    };
  }, [submissions]);

  /* =====================================================
     CSV EXPORT
  ===================================================== */

  const exportCSV = () => {
    if (submissions.length === 0) {
      showToast(
        "No claims available to export",
        "error"
      );

      return;
    }

    const headers = [
      "Name",
      "Email",
      "Vehicle",
      "Incident Type",
      "Damage Type",
      "Police Report",
      "Created At"
    ];

    const rows = submissions.map(
      (submission) => {
        const data =
          submission.data || {};

        return [
          data.fullName || "",
          data.email || "",
          data.vehicle || "",
          data.incidentType || "",
          data.damageType || "",
          data.policeReport || "",
          submission.createdAt
            ? new Date(
                submission.createdAt
              ).toLocaleString()
            : ""
        ];
      }
    );

    const csvContent = [
      headers,
      ...rows
    ]
      .map((row) =>
        row
          .map(
            (value) =>
              `"${String(value)
                .replace(/"/g, '""')}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob(
      [csvContent],
      {
        type: "text/csv;charset=utf-8;"
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      "forma-ai-claims.csv";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    showToast(
      "Claims exported successfully!",
      "success"
    );
  };

  /* =====================================================
     PRINT REPORT
  ===================================================== */

  const printClaim = (submission) => {
    const data =
      submission.data || {};

    const printWindow =
      window.open(
        "",
        "_blank",
        "width=900,height=700"
      );

    if (!printWindow) {
      showToast(
        "Please allow popups to print the report",
        "error"
      );

      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Forma AI Claim Report</title>

          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              color: #111;
            }

            h1 {
              color: #b88600;
            }

            h2 {
              border-bottom: 2px solid #ddd;
              padding-bottom: 10px;
            }

            .row {
              display: flex;
              justify-content: space-between;
              padding: 12px 0;
              border-bottom: 1px solid #eee;
            }

            .label {
              font-weight: bold;
            }

            .footer {
              margin-top: 40px;
              color: #777;
              font-size: 12px;
            }
          </style>
        </head>

        <body>

          <h1>Forma AI</h1>

          <h2>Insurance Claim Report</h2>

          <div class="row">
            <span class="label">Name</span>
            <span>${data.fullName || "-"}</span>
          </div>

          <div class="row">
            <span class="label">Email</span>
            <span>${data.email || "-"}</span>
          </div>

          <div class="row">
            <span class="label">Vehicle</span>
            <span>${data.vehicle || "-"}</span>
          </div>

          <div class="row">
            <span class="label">Incident</span>
            <span>${data.incidentType || "-"}</span>
          </div>

          <div class="row">
            <span class="label">Damage</span>
            <span>${data.damageType || "-"}</span>
          </div>

          <div class="row">
            <span class="label">Police Report</span>
            <span>${data.policeReport || "-"}</span>
          </div>

          <div class="row">
            <span class="label">Police Report Number</span>
            <span>${data.policeReportNumber || "-"}</span>
          </div>

          <div class="row">
            <span class="label">Submitted</span>
            <span>
              ${
                submission.createdAt
                  ? new Date(
                      submission.createdAt
                    ).toLocaleString()
                  : "-"
              }
            </span>
          </div>

          <div class="footer">
            Generated by Forma AI
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>

        </body>
      </html>
    `);

    printWindow.document.close();
  };

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          🤖 Loading Forma AI...
        </div>
      </div>
    );
  }

  if (!formSchema) {
    return (
      <div className="container">
        <h2>
          Unable to load form.
        </h2>
      </div>
    );
  }

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div className="container">

      {/* TOAST */}

      {toast && (
        <div
          className={`toast toast-${toast.type}`}
        >
          {toast.type === "success"
            ? "✓"
            : "!"}

          <span>
            {toast.message}
          </span>
        </div>
      )}

      {/* BRAND */}

      <div className="brand-header">

        <div className="brand-icon">
          ✦
        </div>

        <div>
          <h1>
            Forma AI
          </h1>

          <p>
            AI-powered insurance claim management
          </p>
        </div>

      </div>

      {/* DASHBOARD */}

      <section className="dashboard">

        <div className="dashboard-header">
          <div>
            <h2>
              📊 Claim Dashboard
            </h2>

            <p>
              Overview of your insurance claims
            </p>
          </div>
        </div>

        <div className="stats-grid">

          <div className="stat-card">
            <div className="stat-icon">
              📋
            </div>

            <div>
              <span>Total Claims</span>

              <strong>
                {totalClaims}
              </strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              🚗
            </div>

            <div>
              <span>Accidents</span>

              <strong>
                {accidentClaims}
              </strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              🔐
            </div>

            <div>
              <span>Theft</span>

              <strong>
                {theftClaims}
              </strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              🐾
            </div>

            <div>
              <span>Animal Collision</span>

              <strong>
                {animalClaims}
              </strong>
            </div>
          </div>

        </div>

        {/* ADVANCED CLAIM ANALYTICS */}

        <div className="analytics-section">

          <div className="analytics-title">
            <div>
              <span>📊</span>
              <h2>Claim Analytics</h2>
            </div>

            <p>
              Overview of your insurance claim data
            </p>
          </div>

          <div className="analytics-grid">

            <div className="analytics-card">
              <span className="analytics-icon">🚗</span>

              <div>
                <h3>Accident Claims</h3>
                <strong>{analytics.accidents}</strong>
              </div>
            </div>

            <div className="analytics-card">
              <span className="analytics-icon">🚨</span>

              <div>
                <h3>Theft Claims</h3>
                <strong>{analytics.thefts}</strong>
              </div>
            </div>

            <div className="analytics-card">
              <span className="analytics-icon">🐕</span>

              <div>
                <h3>Animal Collision</h3>
                <strong>{analytics.animalCollisions}</strong>
              </div>
            </div>

            <div className="analytics-card">
              <span className="analytics-icon">🤖</span>

              <div>
                <h3>AI Analyzed</h3>
                <strong>{analytics.analyzed}</strong>
              </div>
            </div>

          </div>

          <div className="priority-panel">

            <h3>AI Priority Distribution</h3>

            <div className="priority-item">

              <div>
                <span>🔴 High</span>
                <strong>{analytics.highPriority}</strong>
              </div>

              <div className="priority-bar">
                <span
                  style={{
                    width:
                      analytics.total > 0
                        ? `${(analytics.highPriority / analytics.total) * 100}%`
                        : "0%"
                  }}
                />
              </div>

            </div>

            <div className="priority-item">

              <div>
                <span>🟡 Medium</span>
                <strong>{analytics.mediumPriority}</strong>
              </div>

              <div className="priority-bar">
                <span
                  style={{
                    width:
                      analytics.total > 0
                        ? `${(analytics.mediumPriority / analytics.total) * 100}%`
                        : "0%"
                  }}
                />
              </div>

            </div>

            <div className="priority-item">

              <div>
                <span>🟢 Low</span>
                <strong>{analytics.lowPriority}</strong>
              </div>

              <div className="priority-bar">
                <span
                  style={{
                    width:
                      analytics.total > 0
                        ? `${(analytics.lowPriority / analytics.total) * 100}%`
                        : "0%"
                  }}
                />
              </div>

            </div>

          </div>

        </div>

      </section>


      {/* SUCCESS */}

      {submitSuccess && (
        <div className="success-message">

          <h2>
            🎉 Claim Submitted Successfully!
          </h2>

          <p>
            Your insurance claim has been
            saved successfully.
          </p>

          <button
            type="button"
            onClick={() =>
              setSubmitSuccess(false)
            }
          >
            Submit Another Claim
          </button>

        </div>
      )}


      {/* MAGIC INPUT */}

      <div className="magic-box">

        <h2>
          ✨ Magic Input
        </h2>

        <p>
          Describe your claim naturally
          and AI will automatically extract
          the information.
        </p>

        <textarea
          value={magicText}
          onChange={(e) =>
            setMagicText(
              e.target.value
            )
          }
          placeholder="Example: My name is Vedansh Mishra, my email is vedansh@gmail.com, my car is a Honda City and it was an accident."
        />

        <button
          type="button"
          onClick={handleMagicInput}
          disabled={magicLoading}
        >
          {magicLoading
            ? "🤖 AI Processing..."
            : "✨ Extract with AI"}
        </button>

      </div>


      {/* AI PREVIEW */}

      {aiPreview && (
        <div className="ai-preview">

          <h2>
            🤖 AI Extracted Information
          </h2>

          <p>
            Review the extracted
            information before applying it.
          </p>

          {Object.entries(
            aiPreview
          ).map(([field, value]) => (
            <div
              className="preview-row"
              key={field}
            >

              <span className="preview-label">
                {field}
              </span>

              <input
                value={value || ""}
                onChange={(e) =>
                  setAiPreview({
                    ...aiPreview,
                    [field]:
                      e.target.value
                  })
                }
              />

            </div>
          ))}

          <button
            type="button"
            onClick={applyAIData}
          >
            ✅ Apply to Form
          </button>

        </div>
      )}


      {/* FORM */}

      <form
        onSubmit={handleSubmit(
          onSubmit
        )}
      >

        {formSchema.fields.map(
          (field) => {

            if (
              !shouldShowField(field)
            ) {
              return null;
            }

            return (
              <div
                className="form-group"
                key={field.name}
              >

                <label>
                  {field.label}
                </label>

                {field.type === "text" && (
                  <input
                    type="text"
                    {...register(
                      field.name,
                      {
                        required:
                          field.required
                            ? `${field.label} is required`
                            : false,

                        minLength:
                          field.validation
                            ?.minLength
                            ? {
                                value:
                                  field
                                    .validation
                                    .minLength,

                                message:
                                  `${field.label} must be at least ${field.validation.minLength} characters`
                              }
                            : undefined
                      }
                    )}
                  />
                )}

                {field.type === "email" && (
                  <input
                    type="email"
                    {...register(
                      field.name,
                      {
                        required:
                          field.required
                            ? `${field.label} is required`
                            : false,

                        pattern:
                          field.validation
                            ?.pattern
                            ? {
                                value:
                                  new RegExp(
                                    field
                                      .validation
                                      .pattern
                                  ),

                                message:
                                  "Please enter a valid email address"
                              }
                            : undefined
                      }
                    )}
                  />
                )}

                {field.type === "select" && (
                  <select
                    {...register(
                      field.name,
                      {
                        required:
                          field.required
                            ? `${field.label} is required`
                            : false
                      }
                    )}
                  >

                    <option value="">
                      Select an option
                    </option>

                    {field.options.map(
                      (option) => (
                        <option
                          key={
                            option.value
                          }
                          value={
                            option.value
                          }
                        >
                          {option.label}
                        </option>
                      )
                    )}

                  </select>
                )}

                {errors[field.name] && (
                  <p className="error">
                    {
                      errors[
                        field.name
                      ].message
                    }
                  </p>
                )}

              </div>
            );
          }
        )}

        <div className="form-actions">

          <button
            type="submit"
            className="submit-button"
            disabled={submitLoading}
          >
            {submitLoading
              ? "⏳ Saving Claim..."
              : "🚀 Submit Claim"}
          </button>

          <button
            type="button"
            className="clear-button"
            onClick={clearForm}
          >
            🧹 Clear Form
          </button>

        </div>

      </form>


      {/* =================================================
          SUBMISSION HISTORY
      ================================================= */}

      <div className="submission-history">

        <div className="history-header">

          <div>
            <h2>
              📋 Recent Submissions
            </h2>

            <p>
              Search, filter and manage
              your insurance claims.
            </p>
          </div>

          <div className="history-actions">

            <button
              type="button"
              onClick={
                loadSubmissions
              }
              disabled={
                historyLoading
              }
            >
              {historyLoading
                ? "Loading..."
                : "🔄 Refresh"}
            </button>

            <button
              type="button"
              onClick={exportCSV}
            >
              📥 Export CSV
            </button>

          </div>

        </div>


        {/* SEARCH / FILTER */}

        <div className="filter-panel">

          <div className="search-box">

            <span>
              🔍
            </span>

            <input
              type="text"
              value={searchText}
              onChange={(e) =>
                setSearchText(
                  e.target.value
                )
              }
              placeholder="Search name, email, vehicle..."
            />

          </div>


          <select
            value={incidentFilter}
            onChange={(e) =>
              setIncidentFilter(
                e.target.value
              )
            }
          >

            <option value="all">
              All Incidents
            </option>

            <option value="accident">
              Accident
            </option>

            <option value="animal_collision">
              Animal Collision
            </option>

            <option value="theft">
              Theft
            </option>

          </select>


          <select
            value={sortOrder}
            onChange={(e) =>
              setSortOrder(
                e.target.value
              )
            }
          >

            <option value="newest">
              Newest First
            </option>

            <option value="oldest">
              Oldest First
            </option>

          </select>

        </div>


        {/* RESULT COUNT */}

        <div className="result-count">

          Showing{" "}
          <strong>
            {
              filteredSubmissions.length
            }
          </strong>{" "}
          of{" "}
          <strong>
            {submissions.length}
          </strong>{" "}
          claims

        </div>


        {/* SUBMISSIONS */}

        {filteredSubmissions.length ===
        0 ? (

          <div className="empty-history">

            <div className="empty-icon">
              📭
            </div>

            <h3>
              No claims found
            </h3>

            <p>
              Try changing your search
              or filter.
            </p>

          </div>

        ) : (

          <div className="submission-list">

            {filteredSubmissions.map(
              (submission) => (

                <div
                  className="submission-card"
                  key={
                    submission._id
                  }
                >

                  <div className="claim-header">

                    <div>

                      <h3>
                        {submission.data
                          ?.fullName ||
                          "Unknown Claimant"}
                      </h3>

                      <span className="claim-id">
                        ID:{" "}
                        {submission._id}
                      </span>

                    </div>

                    <span className="claim-badge">
                      {
                        submission.data
                          ?.incidentType
                          ? submission.data.incidentType
                              .replace(
                                "_",
                                " "
                              )
                          : "Unknown"
                      }
                    </span>

                  </div>


                  <div className="claim-details">

                    <p>
                      📧{" "}
                      {submission.data
                        ?.email ||
                        "No email"}
                    </p>

                    <p>
                      🚗{" "}
                      {submission.data
                        ?.vehicle ||
                        "No vehicle"}
                    </p>

                    {submission.data
                      ?.damageType && (
                      <p>
                        🔧{" "}
                        {submission.data.damageType.replace(
                          "_",
                          " "
                        )}
                      </p>
                    )}

                    <p className="submission-date">
                      🕒{" "}
                      {new Date(
                        submission.createdAt
                      ).toLocaleString()}
                    </p>

                  </div>


                  {/* ACTIONS */}

                  <div className="submission-actions">

                    <button
                      type="button"
                      className="view-button"
                      onClick={() =>
                        viewSubmission(
                          submission._id
                        )
                      }
                    >
                      👁️ View / Edit
                    </button>


                    <button
                      type="button"
                      className="analyze-button"
                      onClick={() =>
                        analyzeSubmission(
                          submission._id
                        )
                      }
                      disabled={
                        analyzingSubmissionId ===
                        submission._id
                      }
                    >
                      {analyzingSubmissionId ===
                      submission._id
                        ? "🤖 Analyzing..."
                        : "🤖 Analyze Claim"}
                    </button>


                    <button
                      type="button"
                      className="print-button"
                      onClick={() =>
                        printClaim(
                          submission
                        )
                      }
                    >
                      🖨️ Report
                    </button>


                    <button
                      type="button"
                      className="delete-button"
                      onClick={() =>
                        deleteSubmission(
                          submission._id
                        )
                      }
                    >
                      🗑️ Delete
                    </button>

                  </div>


                  {/* AI ANALYSIS */}

                  {analysis?.submissionId ===
                    submission._id && (

                    <div className="analysis-card">

                      <div className="analysis-title">
                        🤖 AI Claim Analysis
                      </div>


                      <div className="score-section">

                        <div>
                          <div className="score-label">
                            Completeness Score
                          </div>

                          <div className="score-value">
                            {
                              analysis.completenessScore
                            }
                            /100
                          </div>
                        </div>

                        <div>

                          <div className="score-label">
                            Priority
                          </div>

                          <span
                            className={`priority priority-${String(
                              analysis.priority ||
                                "medium"
                            )
                              .toLowerCase()
                              .replace(
                                /\s+/g,
                                "-"
                              )}`}
                          >
                            {
                              analysis.priority
                            }
                          </span>

                        </div>

                      </div>


                      <div className="analysis-section">

                        <h4>
                          ⚠️ Missing Information
                        </h4>

                        {analysis
                          .missingInformation
                          ?.length > 0 ? (

                          <ul>

                            {analysis.missingInformation.map(
                              (
                                item,
                                index
                              ) => (
                                <li
                                  key={
                                    index
                                  }
                                >
                                  {item}
                                </li>
                              )
                            )}

                          </ul>

                        ) : (

                          <p>
                            No missing
                            information
                            detected.
                          </p>

                        )}

                      </div>


                      <div className="analysis-section">

                        <h4>
                          🔍 Potential Issues
                        </h4>

                        {analysis.issues
                          ?.length > 0 ? (

                          <ul>

                            {analysis.issues.map(
                              (
                                item,
                                index
                              ) => (
                                <li
                                  key={
                                    index
                                  }
                                >
                                  {item}
                                </li>
                              )
                            )}

                          </ul>

                        ) : (

                          <p>
                            No issues
                            detected.
                          </p>

                        )}

                      </div>


                      <div className="recommendation">

                        <h4>
                          💡 AI Recommendation
                        </h4>

                        <p>
                          {
                            analysis.recommendation
                          }
                        </p>

                      </div>

                    </div>

                  )}

                </div>

              )
            )}

          </div>

        )}

      </div>


      {/* =================================================
          EDIT SUBMISSION
      ================================================= */}

      {selectedSubmission && (

        <div className="edit-section">

          <h2>
            ✏️ Edit Submission
          </h2>

          <p>
            Update your saved
            insurance claim.
          </p>

          {Object.entries(
            editData
          ).map(([field, value]) => (

            <div
              className="edit-row"
              key={field}
            >

              <label>
                {field}
              </label>

              <input
                value={value || ""}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    [field]:
                      e.target.value
                  })
                }
              />

            </div>

          ))}


          <button
            type="button"
            className="save-button"
            onClick={
              updateSubmission
            }
            disabled={editLoading}
          >
            {editLoading
              ? "⏳ Updating..."
              : "💾 Save Changes"}
          </button>


          <button
            type="button"
            className="cancel-button"
            onClick={() => {
              setSelectedSubmission(
                null
              );

              setEditData({});

              setAnalysis(null);
            }}
          >
            ❌ Cancel
          </button>

        </div>

      )}

    </div>
  );
}

export default App;