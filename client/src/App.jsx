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
    handleSubmit
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

              <label>
                {field.label}
              </label>

              {field.type === "text" && (
                <input
                  type="text"
                  {...register(field.name, {
                    required: field.required
                  })}
                />
              )}

              {field.type === "email" && (
                <input
                  type="email"
                  {...register(field.name, {
                    required: field.required
                  })}
                />
              )}

              {field.type === "select" && (
                <select
                  {...register(field.name, {
                    required: field.required
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