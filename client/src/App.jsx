import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import API from "./api";
import "./App.css";

function App() {
  const [formSchema, setFormSchema] = useState(null);
  const [loading, setLoading] = useState(true);

  const [magicText, setMagicText] = useState("");
  const [magicLoading, setMagicLoading] = useState(false);
  const [aiPreview, setAiPreview] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  const {
    register,
    watch,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm();

  // Load form schema
  useEffect(() => {
    API.get("/forms/insurance-claim")
      .then((response) => {
        setFormSchema(response.data.form);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Form loading failed:", error);
        setLoading(false);
      });
  }, []);

  // AI Magic Input
  const handleMagicInput = async () => {
    if (!magicText.trim()) {
      alert("Please enter some text");
      return;
    }

    try {
      setMagicLoading(true);
      setAiPreview(null);

      const response = await API.post("/ai/magic-input", {
        text: magicText
      });

      setAiPreview(response.data.data);
    } catch (error) {
      console.error("AI processing failed:", error);
      alert("❌ AI processing failed");
    } finally {
      setMagicLoading(false);
    }
  };

  // Apply AI data to form
  const applyAIData = () => {
    if (!aiPreview) return;

    Object.keys(aiPreview).forEach((field) => {
      if (aiPreview[field]) {
        setValue(field, aiPreview[field]);
      }
    });

    setAiPreview(null);

    alert("✨ AI data applied to the form!");
  };

  // Submit form to MongoDB
  const onSubmit = async (data) => {
    try {
      setSubmitLoading(true);

      const response = await API.post("/submissions", {
        formId: formSchema.formId,
        data: data
      });

      console.log("Submission saved:", response.data);

      alert("✅ Claim submitted successfully!");
    } catch (error) {
      console.error("Submission failed:", error);

      alert("❌ Failed to submit claim");
    } finally {
      setSubmitLoading(false);
    }
  };

  // Conditional field logic
  const shouldShowField = (field) => {
    if (!field.showIf) {
      return true;
    }

    const value = watch(field.showIf.field);

    return value === field.showIf.equals;
  };

  if (loading) {
    return <h2>Loading Forma AI form...</h2>;
  }

  if (!formSchema) {
    return <h2>Unable to load form.</h2>;
  }

  return (
    <div className="container">
      <h1>{formSchema.title}</h1>

      <p>{formSchema.description}</p>

      {/* MAGIC INPUT */}
      <div className="magic-box">
        <h2>✨ Magic Input</h2>

        <p>
          Describe your claim in normal language and AI will extract
          the information for you.
        </p>

        <textarea
          value={magicText}
          onChange={(e) => setMagicText(e.target.value)}
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
          <h2>🤖 AI Extracted Information</h2>

          <p>
            Review and edit the information before applying it
            to the form.
          </p>

          {Object.entries(aiPreview).map(([field, value]) => (
            <div className="preview-row" key={field}>
              <span className="preview-label">
                {field}
              </span>

              <input
                value={value}
                onChange={(e) =>
                  setAiPreview({
                    ...aiPreview,
                    [field]: e.target.value
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

      {/* DYNAMIC FORM */}
      <form onSubmit={handleSubmit(onSubmit)}>
        {formSchema.fields.map((field) => {
          if (!shouldShowField(field)) {
            return null;
          }

          return (
            <div className="form-group" key={field.name}>
              <label>{field.label}</label>

              {/* TEXT */}
              {field.type === "text" && (
                <input
                  type="text"
                  {...register(field.name, {
                    required: field.required
                      ? `${field.label} is required`
                      : false,

                    minLength: field.validation?.minLength
                      ? {
                          value: field.validation.minLength,
                          message: `${field.label} must be at least ${field.validation.minLength} characters`
                        }
                      : undefined
                  })}
                />
              )}

              {/* EMAIL */}
              {field.type === "email" && (
                <input
                  type="email"
                  {...register(field.name, {
                    required: field.required
                      ? `${field.label} is required`
                      : false,

                    pattern: field.validation?.pattern
                      ? {
                          value: new RegExp(
                            field.validation.pattern
                          ),
                          message:
                            "Please enter a valid email address"
                        }
                      : undefined
                  })}
                />
              )}

              {/* SELECT */}
              {field.type === "select" && (
                <select
                  {...register(field.name, {
                    required: field.required
                      ? `${field.label} is required`
                      : false
                  })}
                >
                  <option value="">
                    Select an option
                  </option>

                  {field.options.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              )}

              {/* ERROR */}
              {errors[field.name] && (
                <p className="error">
                  {errors[field.name].message}
                </p>
              )}
            </div>
          );
        })}

        {/* SUBMIT */}
        <button
          type="submit"
          disabled={submitLoading}
        >
          {submitLoading
            ? "⏳ Saving Your Claim..."
            : "🚀 Submit Claim"}
        </button>
      </form>
    </div>
  );
}

export default App;