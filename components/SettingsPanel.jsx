import React, { useState, useEffect } from 'react';

export default function SettingsPanel() {
  const [status, setStatus] = useState({ backend: 'checking...', streamlit: 'checking...' });
  const [message, setMessage] = useState('');

  // Check system health on load
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch('http://127.0.0.1:5000/');
        const data = await res.json();
        setStatus(prev => ({ ...prev, backend: 'Live' }));
      } catch {
        setStatus(prev => ({ ...prev, backend: 'Offline' }));
      }
    };
    checkHealth();
  }, []);

  const handleAction = async (endpoint, method = 'POST') => {
    if (!window.confirm("Are you sure you want to perform this action?")) return;
    try {
      const res = await fetch(`http://127.0.0.1:5000${endpoint}`, { method });
      const data = await res.json();
      setMessage(data.message || data.error);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage("Connection error");
    }
  };

  return (
    <div style={s.container}>
      <header style={s.header}>
        <h2 style={s.title}>System Settings</h2>
        <p style={s.subtitle}>Configure AI models and manage local data storage.</p>
      </header>

      {message && <div style={s.alert}>{message}</div>}

      <div style={s.grid}>
        {/* Connection Status */}
        <section style={s.section}>
          <h3 style={s.sectionTitle}>◈ Connectivity</h3>
          <div style={s.statusRow}>
            <span>Flask API (Port 5000)</span>
            <span style={{ color: status.backend === 'Live' ? '#2dd4bf' : '#fb7185' }}>● {status.backend}</span>
          </div>
          <div style={s.statusRow}>
            <span>Streamlit (Port 8501)</span>
            <span style={{ color: '#f0c040' }}>● Monitoring</span>
          </div>
        </section>

        {/* Model Preferences */}
        <section style={s.section}>
          <h3 style={s.sectionTitle}>◈ AI Intelligence</h3>
          <p style={s.label}>Primary SQL Model</p>
          <select style={s.select} defaultValue="llama-3.3-70b">
            <option value="llama-3.3-70b">Llama 3.3 70B (Default)</option>
            <option value="mixtral">Mixtral 8x7B</option>
            <option value="llama-3.1-8b">Llama 3.1 8B (Fast)</option>
          </select>
        </section>

        {/* Danger Zone */}
        <section style={{ ...s.section, border: '1px solid rgba(251,113,133,0.2)' }}>
          <h3 style={{ ...s.sectionTitle, color: '#fb7185' }}>◈ Danger Zone</h3>
          <p style={s.label}>Permanently delete all stored records</p>
          <div style={s.btnGroup}>
            <button style={s.dangerBtn} onClick={() => handleAction('/history/clear', 'DELETE')}>
              Clear History
            </button>
            <button style={s.dangerBtn} onClick={() => handleAction('/dataset/reset', 'POST')}>
              Reset Database
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

const s = {
  container: { padding: '40px', maxWidth: '900px', margin: '0 auto', fontFamily: "'Inter', sans-serif" },
  header: { marginBottom: '32px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '20px' },
  title: { fontFamily: "'Syne', sans-serif", fontSize: '28px', color: '#f0f2f8', marginBottom: '8px' },
  subtitle: { color: '#8892a4', fontSize: '14px' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' },
  section: { background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' },
  sectionTitle: { fontSize: '12px', letterSpacing: '0.1em', color: '#f0c040', marginBottom: '20px', textTransform: 'uppercase' },
  statusRow: { display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#f0f2f8', marginBottom: '12px' },
  label: { fontSize: '13px', color: '#8892a4', marginBottom: '10px' },
  select: { width: '100%', background: '#161b22', color: '#f0f2f8', border: '1px solid #30363d', padding: '10px', borderRadius: '8px' },
  btnGroup: { display: 'flex', gap: '12px', marginTop: '10px' },
  dangerBtn: { flex: 1, padding: '10px', background: 'rgba(251,113,133,0.1)', color: '#fb7185', border: '1px solid rgba(251,113,133,0.2)', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 },
  alert: { padding: '12px', background: '#f0c04022', color: '#f0c040', borderRadius: '8px', marginBottom: '20px', textAlign: 'center', fontSize: '13px' }
};