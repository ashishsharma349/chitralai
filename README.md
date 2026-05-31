# TalentScreen AI — Resume Screening & Candidate Ranking Platform

TalentScreen AI is a full-stack, single-page web application designed to automate and streamline the candidate screening process. Recruiter teams can create Job Descriptions (either manually or by uploading PDF/DOC/DOCX files) and upload candidate resumes in batches. The platform then parses the documents, runs an advanced AI screening model to score candidates from 0 to 100, lists ranked matches, and provides a detailed analysis of skills, experience alignment, and original resume content.

---

## 1. Architecture Overview

The project is structured as a decoupled monorepo containing a **React frontend** client and a **Node.js/Express backend** server communicating via a RESTful API:

```
Chitralai_Assignment/
├── README.md                          (Setup & brief documentation)
├── system_design.md                   (Detailed schema & database design)
├── backend/
│   ├── package.json                   (Backend configuration & dependencies)
│   ├── server.js                      (API server entry point)
│   └── src/
│       ├── config/db.js               (MySQL Sequelize connection configuration)
│       ├── models/                    (Sequelize database schema models)
│       ├── repositories/              (Data Access Layer: CRUD & SQL transactions)
│       ├── services/                  (Business Logic: Parser, AI, Scoring services)
│       ├── controllers/               (API Presentation Layer: parsing requests)
│       └── routes/                    (Route bindings & file upload controllers)
└── frontend/
    ├── package.json                   (Vite & React configurations)
    ├── index.html                     (SPA template entry page)
    └── src/
        ├── App.jsx                    (Coordinating sidebar, JD, and dashboard states)
        ├── index.css                  (Tailwind core directives & global base styles)
        └── components/
            ├── JobDescriptionPanel.jsx(Manual JD input and JD document upload zone)
            ├── ResumeUpload.jsx       (Multi-file drag-and-drop resume dropzone)
            ├── ResultsDashboard.jsx   (Candidate ranking list, stats KPIs, search, and CSV export)
            └── CandidateModal.jsx     (Detailed AI matching score analysis and raw Resume Preview tabs)
```

### Layered Architecture
To ensure clean code separation, scalability, and ease of testing, the backend is organized into three distinct layers:
1. **Presentation Layer (Controllers)**: Parses incoming requests, validates basic parameters, and formats standard HTTP responses. Keep controller files lightweight and decoupled from business rules.
2. **Business Logic Layer (Services)**: Handles document text extraction, coordinate validation logic, calls Gemini AI model API routines, and manages operations like cascade deletes.
3. **Data Access Layer (Repositories)**: Runs queries exclusively using the **Sequelize ORM** engine. All writes that touch multiple tables are managed via Sequelize database transactions (`BEGIN/COMMIT/ROLLBACK`) to guarantee database consistency and ACID properties.

---

## 2. Approach for Scoring Candidates

TalentScreen AI supports a hybrid screening engine that dynamically toggles between cloud AI and local NLP, ensuring 100% availability even in offline or quota-limited scenarios:

### Mode A: LLM Scoring (Primary - Gemini API)
When a `GEMINI_API_KEY` environment variable is detected:
1. **Document Text Extraction**: The uploaded document buffer is sent to the `parser.service.js` which determines file types and extracts clean plaintext using:
   - `pdf-parse` for PDF files.
   - `mammoth` for DOCX files.
   - `word-extractor` for legacy `.doc` files.
2. **AI Screen Pipeline**: The extracted resume text and target Job Description are compiled into a structured prompt and sent to the Gemini API (`aiService.screenResume`). The system enforces structured JSON response rules.
3. **Evaluation Structure**: The model returns:
   - **Match Score**: An integer percentage between 0 and 100.
   - **Matched Skills**: Technical/functional capabilities found on the CV matching the role.
   - **Missing Skills**: Key requirements from the JD not mentioned on the resume.
   - **Experience & Education Relevance**: Textual alignment summaries.
   - **Rationale**: An objective evaluation explaining the score decision.

### Mode B: Local NLP Fallback (Offline Scoring)
If the Gemini API key is missing or calls return a rate limit limit error, the backend triggers an offline parsing and scoring mechanism:
1. **Regex Extraction**: Pulls contact details (emails, phone numbers) and estimates candidate names from filenames using fallback regular expressions.
2. **Jaccard Similarity Coefficient**: Evaluates the overlap of word tokens between the job description and the resume to establish a base keyword relevance score.
3. **Keyword Frequency Matrix**: Computes weights for matched phrases to generate a final normalized matching score (0-100).

---

## 3. Tech Stack & Dependencies

* **Frontend**: React (Vite), Tailwind CSS (for structure and theme styling), HTML5.
* **Backend**: Node.js, Express, Multer (multipart form-data parsing).
* **Database**: MySQL, Sequelize ORM.
* **Libraries**:
  - `pdf-parse`: High-speed PDF text compiler.
  - `mammoth`: DOCX-to-text converter.
  - `word-extractor`: Legacy OLE2 `.doc` word document binary text extractor.
  - `@google/generative-ai`: Official client SDK for Gemini AI endpoints.

---

## 4. Setup & Running Instructions

### Backend Setup

1. **Configure Environment Variables**:
   Create a `.env` file inside the `backend/` directory with the following variables:
   ```env
   PORT=5000
   NODE_ENV=development
   DB_HOST=127.0.0.1
   DB_USER=your_mysql_username
   DB_PASS=your_mysql_password
   DB_NAME=talent_screen_db
   GEMINI_API_KEY=your_gemini_api_key
   FRONTEND_URL=http://localhost:5173
   ```

2. **Install Dependencies & Start**:
   ```bash
   cd backend
   npm install
   npm run start
   ```
   *(During development, you can use `npm run dev` to launch the nodemon server).*

### Frontend Setup

1. **Configure API URL**:
   Verify your API URL matches the backend port (default: `http://localhost:5000`).

2. **Install & Start**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   *(This launches the Vite server locally, usually at `http://localhost:5173`).*

---

## 5. Key Assumptions & Constraints

1. **No Authentication & Authorization**: Since no authentication (authN) or authorization (authZ) is implemented, data limits (5 Job Descriptions and 15 resumes per JD) apply globally across the entire database.
2. **Local MySQL Connection**: The system assumes MySQL is running locally or a remote connection string is configured in the environment. Sequelize automatically initializes and verifies schema tables on startup.
3. **Rate Limits**: The API is protected by a custom, sliding-window rate-limiting middleware restricting client requests to 5 hits per minute per IP, preventing simple denial-of-service attempts.
