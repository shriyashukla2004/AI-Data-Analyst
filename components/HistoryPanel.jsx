import { useState, useEffect } from 'react';

export default function HistoryPanel({ onRerun }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [clearing, setClearing] = useState(false);
  const [search, setSearch] = useState('');

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('http://127.0.0.1:5000/history');
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      setError('Could not load history. Is Flask running?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleClear = async () => {
    if (!window.confirm('Clear all history? This cannot be undone.')) return;
    
    setClearing(true);
    try {
      await fetch('http://127.0.0.1:5000/history/clear', { method: 'DELETE' });
      setHistory([]);
    } catch (err) {
      setError('Failed to clear history.');
    } finally {
      setClearing(false);
    }
  };

  const filtered = history.filter(h => 
    h.query.toLowerCase().includes(search.toLowerCase()) ||
    h.sql.toLowerCase().includes(search.toLowerCase())
  );

  const styles = {
    root: { 
      flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 
    },
    header: { 
      display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', 
      padding: '18px 24px 14px', borderBottom: '1px solid rgba(255,255,255,0.07)', 
      flexShrink: 0 
    },
    eyebrow: { 
      fontFamily: "'JetBrains Mono', monospace", fontSize: '8.5px', 
      letterSpacing: '.2em', color: '#f0c040', marginBottom: '3px' 
    },
    heading: { 
      fontFamily: "'Syne', sans-serif", fontSize: '20px', fontWeight: 700, 
      color: '#f0f2f8', letterSpacing: '-.02em' 
    },
    headerRight: { display: 'flex', alignItems: 'center', gap: '10px' },
    count: { 
      fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', 
      color: '#4a5568', marginRight: '4px' 
    },
    refreshBtn: {
      fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', 
      padding: '6px 12px', background: 'rgba(255,255,255,0.04)', 
      border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', 
      color: '#8892a4', cursor: 'pointer', border: 'none'
    },
    clearBtn: {
      fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', 
      padding: '6px 12px', background: 'rgba(251,113,133,0.08)', 
      border: '1px solid rgba(251,113,133,0.2)', borderRadius: '8px', 
      color: '#fb7185', cursor: 'pointer'
    },
    searchWrap: { 
      padding: '12px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', 
      flexShrink: 0 
    },
    searchInput: {
      width: '100%', background: 'rgba(255,255,255,0.04)', 
      border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', 
      padding: '9px 14px', fontFamily: "'Inter', sans-serif", fontSize: '13px', 
      color: '#f0f2f8', outline: 'none'
    },
    list: { 
      flex: 1, overflowY: 'auto', padding: '16px 24px', 
      display: 'flex', flexDirection: 'column', gap: '10px' 
    },
    center: { 
      display: 'flex', flexDirection: 'column', alignItems: 'center', 
      justifyContent: 'center', gap: '10px', paddingTop: '60px' 
    },
    spinner: { 
      width: '28px', height: '28px', border: '2px solid rgba(255,255,255,0.08)', 
      borderTop: '2px solid #f0c040', borderRadius: '50%', 
      animation: 'spin 0.8s linear infinite' 
    },
    muted: { fontFamily: "'Inter', sans-serif", fontSize: '12px', color: '#4a5568' },
    emptyTitle: { 
      fontFamily: "'Syne', sans-serif", fontSize: '16px', fontWeight: 600, 
      color: '#8892a4' 
    },
    emptyIcon: { fontSize: '28px', color: '#4a5568' },
    errorBox: { 
      background: 'rgba(251,113,133,0.08)', border: '1px solid rgba(251,113,133,0.2)', 
      borderRadius: '10px', padding: '14px 16px', fontFamily: "'JetBrains Mono', monospace", 
      fontSize: '12px', color: '#fb7185' 
    }
  };

  return (
    <div style={styles.root}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <div style={styles.eyebrow}>QUERY HISTORY</div>
          <h2 style={styles.heading}>Past Queries</h2>
        </div>
        <div style={styles.headerRight}>
          <span style={styles.count}>{history.length} queries</span>
          <button style={styles.refreshBtn} onClick={fetchHistory}>Refresh</button>
          {history.length > 0 && (
            <button 
              style={{...styles.clearBtn, opacity: clearing ? 0.5 : 1 }} 
              onClick={handleClear} 
              disabled={clearing}
            >
              {clearing ? 'Clearing...' : 'Clear All'}
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <div style={styles.searchWrap}>
        <input 
          style={styles.searchInput} 
          placeholder="Search queries or SQL..." 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
        />
      </div>

      {/* Body */}
      <div style={styles.list}>
        {loading && (
          <div style={styles.center}>
            <div style={styles.spinner}></div>
            <span style={styles.muted}>Loading history...</span>
          </div>
        )}
        
        {!loading && error && (
          <div style={styles.errorBox}>{error}</div>
        )}
        
        {!loading && !error && filtered.length === 0 && (
          <div style={styles.center}>
            <div style={styles.emptyIcon}>📝</div>
            <p style={styles.emptyTitle}>
              {search ? 'No matching queries' : 'No history yet'}
            </p>
            <p style={styles.muted}>
              {search ? 'Try a different search term.' : 'Run a query from Chat to see it here.'}
            </p>
          </div>
        )}
        
        {!loading && filtered.map((item, i) => (
          <div key={item.id} style={{ 
            background: 'rgba(255,255,255,0.03)', 
            border: '1px solid rgba(255,255,255,0.08)', 
            borderRadius: '12px', 
            overflow: 'hidden' 
          }}>
            {/* Card top */}
            <div style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
              padding: '13px 16px', gap: '12px', cursor: 'pointer' 
            }} onClick={() => setExpanded(expanded === i ? null : i)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                <div style={{ 
                  fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', 
                  color: '#4a5568', minWidth: '28px' 
                }}>
                  #{history.length - i}
                </div>
                <div style={{ 
                  fontFamily: "'Inter', sans-serif", fontSize: '13.5px', 
                  color: '#f0f2f8', fontWeight: 500, overflow: 'hidden', 
                  textOverflow: 'ellipsis', whiteSpace: 'nowrap' 
                }}>
                  {item.query}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ 
                  fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', 
                  color: '#4a5568' 
                }}>
                  {item.timestamp}
                </span>
                {item.row_count > 0 && (
                  <span style={{ 
                    fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', 
                    padding: '3px 8px', background: 'rgba(45,212,191,0.1)', 
                    border: '1px solid rgba(45,212,191,0.2)', borderRadius: '20px', 
                    color: '#2dd4bf' 
                  }}>
                    {item.row_count} rows
                  </span>
                )}
                <button 
                  style={{ 
                    fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', 
                    padding: '4px 10px', background: 'rgba(240,192,64,0.1)', 
                    border: '1px solid rgba(240,192,64,0.25)', borderRadius: '8px', 
                    color: '#f0c040', cursor: 'pointer', border: 'none' 
                  }} 
                  onClick={e => { e.stopPropagation(); onRerun(item.query); }}
                  title="Re-run this query"
                >
                  Re-run
                </button>
                <button 
                  style={{ 
                    fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', 
                    padding: '4px 8px', background: 'rgba(255,255,255,0.04)', 
                    border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', 
                    color: '#8892a4', cursor: 'pointer', border: 'none' 
                  }}
                  onClick={e => { e.stopPropagation(); setExpanded(expanded === i ? null : i); }}
                >
                  {expanded === i ? '−' : '+'}
                </button>
              </div>
            </div>

            {/* Expanded detail */}
            {expanded === i && (
              <div style={{ 
                borderTop: '1px solid rgba(255,255,255,0.06)', 
                padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '14px' 
              }}>
                <div>
                  <div style={{ 
                    fontFamily: "'JetBrains Mono', monospace", fontSize: '8.5px', 
                    letterSpacing: '.16em', color: '#2dd4bf', marginBottom: '6px' 
                  }}>
                    GENERATED SQL
                  </div>
                  <pre style={{ 
                    fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', 
                    background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(45,212,191,0.15)', 
                    color: '#2dd4bf', padding: '11px 14px', borderRadius: '8px', 
                    overflowX: 'auto', lineHeight: 1.8, whiteSpace: 'pre', margin: 0 
                  }}>
                    {item.sql}
                  </pre>
                </div>
                {item.insight && (
                  <div>
                    <div style={{ 
                      fontFamily: "'JetBrains Mono', monospace", fontSize: '8.5px', 
                      letterSpacing: '.16em', color: '#f0c040', marginBottom: '6px' 
                    }}>
                      AI INSIGHT
                    </div>
                    <div style={{ 
                      fontFamily: "'Inter', sans-serif", fontSize: '12.5px', 
                      lineHeight: 1.7, color: '#8892a4', 
                      background: 'linear-gradient(135deg, rgba(240,192,64,0.06), rgba(240,192,64,0.02))', 
                      border: '1px solid rgba(240,192,64,0.15)', borderRadius: '8px', 
                      padding: '12px 14px' 
                    }}>
                      {item.insight}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
