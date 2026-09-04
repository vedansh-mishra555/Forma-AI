import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import API from "./api";
import "./App.css";

function App() {
  const [formSchema, setFormSchema] = useState(null);
  const [loading, setLoading] = useState(true);
  const [magicText, setMagicText] = useState("");
  const [magicLoading, setMagicLoading] = useState(false);

  const {
    register,
    watch,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm();

  useEffect(() => {
    API.get("/forms/insurance-claim")
      .then((response) => {
        setFormSchema(response.data.form);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  }, []);

  const handleMagicInput = async () => {
    if (!magicText.trim()) {
      alert("Please enter some text");
      return;
    }

    try {
      setMagicLoading(true);

      const response = await API.post("/ai/magic-input", {
        text: magicText
      });

      const data = response.data.data;

      Object.keys(data).forEach((field) => {
        if (data[field]) {
          setValue(field, data[field]);
        }
      });

      alert("✨ Magic Input applied successfully!");
    } catch (error) {
      console.error(error);
      alert("AI processing failed");
    } finally {
      setMagicLoading(false);
    }
  };

  const onSubmit = (data) => {
    console.log("Form Data:", data);
    alert("Form submitted successfully!");
  };

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
          Describe your claim in normal language and AI will fill the form
          automatically.
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
          {magicLoading ? "🤖 AI Processing..." : "✨ Fill Form with AI"}
        </button>
      </div>

      {/* FORM */}
      <form onSubmit={handleSubmit(onSubmit)}>
        {formSchema.fields.map((field) => {
          if (!shouldShowField(field)) {
            return null;
          }

          return (
            <div className="form-group" key={field.name}>
              <label>{field.label}</label>

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

              {field.type === "email" && (
                <input
                  type="email"
                  {...register(field.name, {
                    required: field.required
                      ? `${field.label} is required`
                      : false,

                    pattern: field.validation?.pattern
                      ? {
                          value: new RegExp(field.validation.pattern),
                          message: "Please enter a valid email address"
                        }
                      : undefined
                  })}
                />
              )}

              {field.type === "select" && (
                <select
                  {...register(field.name, {
                    required: field.required
                      ? `${field.label} is required`
                      : false
                  })}
                >
                  <option value="">Select an option</option>

                  {field.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}

              {errors[field.name] && (
                <p className="error">
                  {errors[field.name].message}
                </p>
              )}
            </div>
          );
        })}

        <button type="submit">Submit Claim</button>
      </form>
    </div>
  );
}

export default App;