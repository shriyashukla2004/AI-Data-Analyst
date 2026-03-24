# DataWhisper 🔮
### Talk to your data. Get instant SQL, charts & AI insights.

DataWhisper is an AI-powered data analyst chatbot that lets you upload any CSV or Excel dataset and query it in plain English. It automatically generates SQL, runs it against your data, visualizes the results, and delivers AI-powered business insights — all in a sleek chat interface.

---

## ✨ Features

- 📂 **Upload any dataset** — CSV, XLSX, or XLS. No configuration needed
- 💬 **Natural language queries** — Ask questions in plain English, get SQL + results instantly
- 📊 **Auto-generated charts** — Bar, line, and pie charts rendered automatically based on your data
- 🧠 **AI-powered insights** — Numbered, clearly formatted business insights for every query
- 🗂️ **Query history** — Browse, search, expand, and re-run past queries
- 📋 **Dynamic schema awareness** — The AI reads your actual column names and types before generating SQL
- 🖥️ **Streamlit dashboard** — Alternative dashboard view alongside the React UI
- 🔒 **Safe SQL only** — Only SELECT queries are allowed; all writes are blocked

---

## 🖼️ Preview

```
┌─────────────────────────────────────────────────────────┐
│  ⬡ ANALYST          │  Query Intelligence               │
│                      │  ┌──────────────────────────────┐│
│  WORKSPACE           │  │ sales.csv · 5,000 rows · 8 cols│
│  ◈ Chat Query  ●     │  └──────────────────────────────┘│
│  ◉ History           │                                   │
│  ↑ Upload Data       │  Ask: "Total sales by region"    │
│                      │  → SQL generated & executed       │
│  SYSTEM              │  → Bar chart rendered             │
│  ◎ Settings          │  → 5 AI insights shown            │
│                      │                                   │
│  ● Dataset loaded    │  [ Ask anything about sales.csv ]│
│  Llama 3.3 70B       │                          [SEND ↑]│
└─────────────────────────────────────────────────────────┘
```

---

## 🗂️ Project Structure

```
DataWhisper/
├── backend/
│   ├── app.py              # Flask API — all endpoints
│   ├── db.py               # SQLite engine, file loader, query runner
│   ├── llm.py              # Groq LLM client, dynamic SQL prompt builder
│   ├── query_pipeline.py   # Connects LLM → DB
│   ├── chart.py            # Auto chart type detection + formatting
│   ├── insight.py          # AI insight + chart explanation generator
│   ├── history.py          # Save/load/clear query history (JSON)
│   ├── dashboard.py        # Streamlit dashboard
│   └── .env                # API keys (not committed)
│
└── frontend/
    └── src/
        ├── App.js                     
        ├── App.css                     
        ├── index.js
        ├── index.css
        └── components/
            ├── ChatWindow.jsx          
            ├── Message.jsx            
            ├── ChartRenderer.jsx       
            ├── InsightCard.jsx        
            ├── HistoryPanel.jsx        
            ├── FileUpload.jsx          
            ├── MetricsCards.jsx
            ├── SettingsPanel.jsx
            ├── TableViewer.jsx
            └── DatasetBanner.jsx       # Active dataset info bar
```

---

## ⚙️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Recharts, CSS (custom dark theme) |
| Backend | Python, Flask, Flask-CORS |
| Database | SQLite (auto-created from uploaded file) |
| AI / LLM | Groq API — Llama 3.3 70B, Llama 3.1 8B, Mixtral 8x7B |
| Data processing | Pandas, SQLAlchemy, OpenPyXL |
| Dashboard | Streamlit |
| Fonts | Syne, Inter, JetBrains Mono (Google Fonts) |

---

## 🚀 Getting Started

### Prerequisites

- Python 3.9+
- Node.js 18+
- A free [Groq API key](https://console.groq.com)

---

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/datawhisper.git
cd datawhisper
```

---

### 2. Backend setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv

# Windows
venv\Scripts\activate

# Mac / Linux
source venv/bin/activate

# Install dependencies
pip install flask flask-cors sqlalchemy pandas openpyxl groq python-dotenv streamlit
```

Create a `.env` file inside the `backend/` folder:

```env
GROQ_API_KEY=your_groq_api_key_here
```

> Get your free API key at [console.groq.com](https://console.groq.com)

Start the Flask server:

```bash
python app.py
```

You should see:
```
* Running on http://127.0.0.1:5000
```

---

### 3. Frontend setup

```bash
cd frontend

# Install dependencies
npm install
npm install recharts

# Install and configure Tailwind (if not already done)
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Add to the top of `src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Add this to `public/index.html` inside `<head>`:
```html
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=JetBrains+Mono:wght@300;400;500&family=Inter:wght@300;400;500&display=swap" rel="stylesheet">
```

Start the React app:
```bash
npm start
```

Opens at **http://localhost:3000**

---

### 4. (Optional) Streamlit Dashboard

```bash
cd backend
streamlit run dashboard.py
```

Opens at **http://localhost:8501**

---

## 🖥️ Running All Three (Recommended)

Open **3 separate terminals**:

| Terminal | Command | URL |
|---|---|---|
| 1 — API | `python app.py` | http://127.0.0.1:5000 |
| 2 — UI | `npm start` | http://localhost:3000 |
| 3 — Dashboard | `streamlit run dashboard.py` | http://localhost:8501 |

> Always start the **Flask backend first** before opening the React UI.

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Health check |
| `POST` | `/upload` | Upload a CSV or Excel file |
| `GET` | `/dataset` | Get current dataset schema & metadata |
| `POST` | `/query` | Run a natural language query |
| `GET` | `/history` | Get all past queries (newest first) |
| `DELETE` | `/history/clear` | Clear all query history |

### Example — Upload a file

```bash
curl -X POST http://127.0.0.1:5000/upload \
  -F "file=@sales_data.csv"
```

### Example — Run a query

```bash
curl -X POST http://127.0.0.1:5000/query \
  -H "Content-Type: application/json" \
  -d '{"query": "Total sales by region"}'
```

Response:
```json
{
  "sql": "SELECT region, SUM(sales) AS total_sales FROM sales_data GROUP BY region ORDER BY total_sales DESC LIMIT 100;",
  "chart": { "type": "bar", "labels": ["North", "South"], "data": [142000, 98000] },
  "insight": "1. **North Dominates**: The North region leads with $142K...",
  "chart_explanation": "A bar chart comparing total sales by region."
}
```

---

## 🔒 Security

- Only `SELECT` queries are permitted — all `INSERT`, `UPDATE`, `DELETE`, `DROP`, and `ALTER` statements are blocked at both the LLM and database layers
- Uploaded files are stored locally in `backend/uploads/` and loaded into a local SQLite database
- No data is sent anywhere except to the Groq API for SQL generation and insight analysis

---

## 🛠️ Troubleshooting

**`ModuleNotFoundError`**
```bash
pip install flask flask-cors sqlalchemy pandas openpyxl groq python-dotenv
```

**`GROQ_API_KEY not found`**
Make sure `backend/.env` exists and contains your key:
```env
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxx
```

**`npm start` — Missing script error**
```bash
# Make sure you're inside the frontend folder
cd frontend
npm start
```

**React shows "Could not connect to server"**
Flask must be running first. Start `python app.py` before opening the React app.

**File upload fails**
Make sure `openpyxl` is installed for Excel files:
```bash
pip install openpyxl
```

---

## 🗺️ Roadmap

- [ ] Multi-table joins (upload multiple files)
- [ ] Export results as CSV / PDF
- [ ] Saved dashboards
- [ ] Authentication & user accounts
- [ ] PostgreSQL / MySQL support
- [ ] Voice input queries

---

## 📄 License

MIT License — free to use, modify, and distribute.

---

## 🙏 Acknowledgements

- [Groq](https://groq.com) — blazing fast LLM inference
- [Recharts](https://recharts.org) — React chart library
- [Streamlit](https://streamlit.io) — rapid dashboard framework
- [Meta Llama 3](https://llama.meta.com) — open source LLM powering the SQL generation

---

<p align="center">Built with ❤️ · <strong>DataWhisper</strong> — Talk to your data</p>
