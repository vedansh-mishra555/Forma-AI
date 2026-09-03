import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import API from "./api";
import "./App.css";

function App() {
  const [formSchema, setFormSchema] = useState(null);
  const [loading, setLoading] = useState(true);

  const {
    register,
    watch,
    handleSubmit,
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

      <form onSubmit={handleSubmit(onSubmit)}>
        {formSchema.fields.map((field) => {
          if (!shouldShowField(field)) {
            return null;
          }

          return (
            <div className="form-group" key={field.name}>
              <label>{field.label}</label>

              {/* TEXT FIELD */}
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

              {/* EMAIL FIELD */}
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

              {/* SELECT FIELD */}
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
                    <option
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              )}

              {/* ERROR MESSAGE */}
              {errors[field.name] && (
                <p className="error">
                  {errors[field.name].message}
                </p>
              )}
            </div>
          );
        })}

        <button type="submit">
          Submit Claim
        </button>
      </form>
    </div>
  );
}

export default App;