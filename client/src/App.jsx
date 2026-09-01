
import { useEffect, useState } from "react";
import API from "./api";

function App() {
  const [message, setMessage] = useState("Connecting to backend...");

  useEffect(() => {
    API.get("/health")
      .then((response) => {
        setMessage(response.data.message);
      })
      .catch(() => {
        setMessage("Backend connection failed");
      });
  }, []);

  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>Forma AI</h1>
      <p>AI-Augmented Dynamic Form Engine</p>
      <h2>{message}</h2>
    </div>
  );
}

export default App;

