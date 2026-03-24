import { useState, useRef } from "react";

export default function FileUpload({ onUploadSuccess }) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef();

  const handleFile = async (file) => {
    if (!file) return;

    const ext = file.name.split(".").pop().toLowerCase();
    if (!["csv", "xlsx", "xls"].includes(ext)) {
      setError("Only CSV, XLSX, or XLS files are supported.");
      return;
    }

    setError("");
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://127.0.0.1:5000/upload", {
        method: "POST",
        body: formData
      });
      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        onUploadSuccess(data);
      }
    } catch {
      setError("Could not connect to server. Is Flask running?");
    }

    setUploading(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  return (
    <div style={s.root}>
      {/* Animated ring */}
      <div style={s.ringWrap}>
        <div style={s.ring}>
          <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
            <circle cx="36" cy="36" r="32" stroke="rgba(240,192,64,0.15)" strokeWidth="1.5" />
            <circle cx="36" cy="36" r="24" stroke="rgba(240,192,64,0.25)" strokeWidth="1" strokeDasharray="4 3" />
            <circle cx="36" cy="36" r="14" fill="rgba(240,192,64,0.08)" stroke="rgba(240,192,64,0.4)" strokeWidth="1" />
            <text x="36" y="41" textAnchor="middle" fontSize="16" fill="#f0c040" fontFamily="sans-serif">↑</text>
          </svg>
        </div>
      </div>

      <h2 style={s.heading}>Upload your dataset</h2>
      <p style={s.sub}>
        Drag & drop a <span style={s.tag}>CSV</span> or <span style={s.tag}>Excel</span> file
        to start querying it with AI
      </p>

      {/* Drop zone */}
      <div
        style={{
          ...s.dropzone,
          borderColor: dragging ? "#f0c040" : "rgba(255,255,255,0.1)",
          background: dragging ? "rgba(240,192,64,0.05)" : "rgba(255,255,255,0.02)"
        }}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => fileRef.current.click()}
      >
        {uploading ? (
          <div style={s.uploading}>
            <div style={s.spinner} />
            <span style={s.uploadText}>Uploading & processing…</span>
          </div>
        ) : (
          <>
            <div style={s.dropIcon}>
              {dragging ? "⬇" : "📂"}
            </div>
            <p style={s.dropMain}>
              {dragging ? "Drop to upload" : "Click or drag file here"}
            </p>
            <p style={s.dropSub}>Supports .csv, .xlsx, .xls — up to 50MB</p>
          </>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept=".csv,.xlsx,.xls"
        style={{ display: "none" }}
        onChange={e => handleFile(e.target.files[0])}
      />

      {error && <div style={s.error}>{error}</div>}

      {/* Example datasets hint */}
      <div style={s.examples}>
        <span style={s.exLabel}>Works with any dataset —</span>
        <span style={s.exChip}>Sales data</span>
        <span style={s.exChip}>Finance reports</span>
        <span style={s.exChip}>HR records</span>
        <span style={s.exChip}>Survey results</span>
      </div>
    </div>
  );
}

const s = {
  root: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 32px",
    gap: "18px"
  },
  ringWrap: { marginBottom: "4px" },
  ring: { animation: "spin 14s linear infinite" },
  heading: {
    fontFamily: "'Syne', sans-serif",
    fontSize: "26px",
    fontWeight: 700,
    color: "#f0f2f8",
    letterSpacing: "-.02em",
    textAlign: "center"
  },
  sub: {
    fontFamily: "'Inter', sans-serif",
    fontSize: "13.5px",
    color: "#8892a4",
    textAlign: "center",
    lineHeight: 1.6
  },
  tag: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "12px",
    color: "#f0c040",
    background: "rgba(240,192,64,0.1)",
    border: "1px solid rgba(240,192,64,0.2)",
    padding: "1px 7px",
    borderRadius: "5px"
  },
  dropzone: {
    width: "100%",
    maxWidth: "520px",
    minHeight: "160px",
    border: "1.5px dashed",
    borderRadius: "16px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    cursor: "pointer",
    transition: "all .2s",
    padding: "32px"
  },
  dropIcon: {
    fontSize: "32px",
    lineHeight: 1
  },
  dropMain: {
    fontFamily: "'Syne', sans-serif",
    fontSize: "15px",
    fontWeight: 600,
    color: "#f0f2f8"
  },
  dropSub: {
    fontFamily: "'Inter', sans-serif",
    fontSize: "12px",
    color: "#4a5568"
  },
  uploading: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px"
  },
  spinner: {
    width: "28px",
    height: "28px",
    border: "2px solid rgba(255,255,255,0.08)",
    borderTop: "2px solid #f0c040",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite"
  },
  uploadText: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "12px",
    color: "#8892a4"
  },
  error: {
    background: "rgba(251,113,133,0.08)",
    border: "1px solid rgba(251,113,133,0.25)",
    borderRadius: "10px",
    padding: "10px 16px",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "12px",
    color: "#fb7185",
    maxWidth: "520px",
    width: "100%",
    textAlign: "center"
  },
  examples: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: "4px"
  },
  exLabel: {
    fontFamily: "'Inter', sans-serif",
    fontSize: "12px",
    color: "#4a5568"
  },
  exChip: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "10px",
    padding: "4px 10px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "20px",
    color: "#8892a4"
  }
};
