import React, { useState, useRef, useEffect } from "react";
import ChatWindow from "./components/ChatWindow";
import HistoryPanel from "./components/HistoryPanel";
import FileUpload from "./components/FileUpload";
import DatasetBanner from "./components/DatasetBanner";
import MetricsCards from "./components/MetricsCards";
import TableViewer from "./components/TableViewer";
import SettingsPanel from "./components/SettingsPanel";
import "./App.css";

function App() {
  const [messages, setMessages] = useState([]);
  const [activeNav, setActiveNav] = useState("chat");
  const [dataset, setDataset] = useState(null);
  const rerunRef = useRef(null);

  // ── Startup Check ──
  // Check if a dataset is already loaded on the backend when the app starts
  useEffect(() => {
    fetch("http://127.0.0.1:5000/dataset")
      .then(r => r.json())
      .then(data => { 
        if (!data.error) setDataset(data); 
      })
      .catch(() => {});
  }, []);

  const handleUploadSuccess = (data) => {
    setDataset(data);
    setMessages([]); // Fresh chat for new dataset
    setActiveNav("chat");
  };

  const handleChangeDataset = () => {
    setDataset(null);
    setActiveNav("chat");
  };

  const handleRerun = (query) => {
    setActiveNav("chat");
    setTimeout(() => {
      if (rerunRef.current) {
        // Support both function styles from provided snippets
        const rerunFunc = rerunRef.current.rerun || rerunRef.current;
        rerunFunc(query);
      }
    }, 100);
  };

  const placeholderStyle = {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "#4a5568",
    gap: 8
  };

  return (
    <div className="app-root">
      <div className="mesh">
        <div className="mesh-blob mb1" />
        <div className="mesh-blob mb2" />
        <div className="mesh-blob mb3" />
      </div>
      <div className="grid-bg" />

      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sb-top">
          <div className="brand">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <polygon points="14,2 25,8 25,20 14,26 3,20 3,8"
                stroke="#f0c040" strokeWidth="1.2" fill="rgba(240,192,64,0.08)" />
              <polygon points="14,7 20,10.5 20,17.5 14,21 8,17.5 8,10.5"
                stroke="#f0c040" strokeWidth="0.7" strokeDasharray="2 1.5" fill="none" opacity=".5" />
              <circle cx="14" cy="14" r="2.5" fill="#f0c040" opacity=".9" />
            </svg>
            <span className="brand-name">ANALYST</span>
          </div>
          
          {dataset && (
            <div className="dataset-badge" title={dataset.filename}>
              <span className="dataset-icon">📊</span>
              <span className="dataset-name">{dataset.filename}</span>
            </div>
          )}
        </div>

        <nav className="sb-nav">
          <div className="sec-label">WORKSPACE</div>
          <button className={`nav-btn ${activeNav === "chat" ? "active" : ""}`}
            onClick={() => setActiveNav("chat")}>
            <span className="nav-icon">◈</span> Chat Query
          </button>
          <button className={`nav-btn ${activeNav === "history" ? "active" : ""}`}
            onClick={() => setActiveNav("history")}>
            <span className="nav-icon">◉</span> History
          </button>
          <button className={`nav-btn ${activeNav === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveNav("dashboard")}>
            <span className="nav-icon">◧</span> Dashboard
          </button>

          <div className="sec-label" style={{ marginTop: 6 }}>SYSTEM</div>
          <button className={`nav-btn ${activeNav === "tables" ? "active" : ""}`}
            onClick={() => setActiveNav("tables")}>
            <span className="nav-icon">⊙</span> Tables
          </button>
          <button className={`nav-btn ${activeNav === "settings" ? "active" : ""}`}
            onClick={() => setActiveNav("settings")}>
            <span className="nav-icon">◎</span> Settings
          </button>
        </nav>

        <div className="sb-foot">
          <div className="status-row">
            <span className="live-dot" />
            {dataset ? "Dataset loaded" : "No dataset"}
          </div>
          <div className="model-tag">Llama 3.3 70B</div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="main-content">
        <header className="topbar">
          <div>
            <span className="topbar-eyebrow">AI DATA ANALYST</span>
            <h1 className="topbar-heading">
              {activeNav === "history" ? "Query History" : 
               activeNav === "tables" ? `${dataset?.filename || 'Table'} Data` : 
               activeNav === "settings" ? "System Settings" :
               "Query Intelligence"}
            </h1>
          </div>
          <div className="topbar-pills">
            {dataset ? (
              <div className="pill">{dataset.filename}</div>
            ) : (
              <div className="pill" style={{ color: "var(--rose)" }}>No dataset</div>
            )}
            <div className="pill live">● Live</div>
          </div>
        </header>

        {/* Dataset Banner */}
        {dataset ? (
          <DatasetBanner dataset={dataset} onChangeDataset={handleChangeDataset} />
        ) : (
          activeNav === "chat" && (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <FileUpload onUploadSuccess={handleUploadSuccess} />
            </div>
          )
        )}

        {/* Metrics Section */}
        {activeNav === "chat" && dataset && <MetricsCards dataset={dataset} />}

        {/* ── Panel Rendering ── */}
        <div className="panel-container" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {activeNav === "chat" && dataset && (
            <ChatWindow
              messages={messages}
              setMessages={setMessages}
              rerunRef={rerunRef}
              dataset={dataset}
            />
          )}

          {activeNav === "history" && (
            <HistoryPanel onRerun={handleRerun} />
          )}

          {activeNav === "dashboard" && (
            <div style={{ width: '100%', height: 'calc(100vh - 150px)', padding: '20px' }}>
              <iframe
                src="http://localhost:8501/?embed=true"
                style={{
                  width: '100%',
                  height: '100%',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '16px',
                  background: '#0d1117'
                }}
                title="Streamlit Analytics"
              />
            </div>
          )}

          {activeNav === "tables" && dataset ? (
            <TableViewer dataset={dataset} tableName={dataset.table_name} />
          ) : activeNav === "tables" ? (
            <div style={placeholderStyle}>
              <div style={{ fontSize: 32, marginBottom: 12, color: "#4a5568" }}>⊙</div>
              <p style={{ fontFamily: "'Syne',sans-serif", fontSize: 16, color: "#8892a4" }}>
                Upload a dataset to view tables
              </p>
            </div>
          ) : null}

          {activeNav === "settings" && <SettingsPanel />}
        </div>
      </main>
    </div>
  );
}

export default App;