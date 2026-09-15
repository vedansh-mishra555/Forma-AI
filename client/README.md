# 🤖 Forma AI — AI-Augmented Dynamic Form Engine

Forma AI is a full-stack AI-powered dynamic form engine that allows users to fill, validate, save, edit, search, filter, and analyze forms using AI.

The project uses an Insurance Claim Form as the primary use case.

---

## 🚀 Features

### 📝 Dynamic Forms
- Dynamic form rendering from a JSON schema
- Multiple field types
- Required-field validation
- Minimum-length validation
- Pattern validation
- Conditional fields using `showIf`

### 🤖 AI Magic Input
Users can describe their information naturally, for example:

> My name is Vedansh Mishra, my email is vedansh@gmail.com, my car is Honda City and I met with an accident.

Forma AI extracts structured information from the text and automatically fills the form.

### 🔍 AI Claim Analysis
The system can analyze submitted insurance claims and provide:

- Completeness score
- Priority
- Missing information
- Issues
- Recommendation

### 📊 Claim Dashboard
- Total submissions
- Accident claims
- Theft claims
- Animal collision claims
- Submission history

### 🔎 Search & Filtering
- Search submissions
- Filter by incident type
- Sort by newest/oldest
- Result count

### 💾 Submission Management
- Create submissions
- View submissions
- Edit submissions
- Delete submissions
- Refresh submission history

### 📥 Export & Reports
- Export submissions as CSV
- Print claim reports

### 💡 User Experience
- AI preview before applying extracted data
- Auto-save form draft
- Clear form option
- Toast notifications
- Responsive UI
- Premium dark/gold interface

---

## 🛠️ Tech Stack

### Frontend
- React
- Vite
- Axios
- React Hook Form
- CSS

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- CORS
- dotenv

### AI
- Google Gemini API

---

## 📁 Project Structure

```text
Forma-AI/
│
├── client/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── api.js
│   │   └── main.jsx
│   ├── package.json
│   └── ...
│
├── server/
│   ├── config/
│   │   └── db.js
│   ├── models/
│   │   └── Submission.js
│   ├── routes/
│   │   ├── formRoutes.js
│   │   ├── aiRoutes.js
│   │   ├── submissionRoutes.js
│   │   └── analysisRoutes.js
│   ├── index.js
│   ├── package.json
│   └── .env
│
├── .gitignore
└── README.md