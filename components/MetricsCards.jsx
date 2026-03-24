import React, { useState, useEffect } from 'react';

const GRADIENTS = [
  'linear-gradient(90deg, #f0c040, #e8a820)',
  'linear-gradient(90deg, #2dd4bf, #0d9488)', 
  'linear-gradient(90deg, #60a5fa, #3b82f6)',
  'linear-gradient(90deg, #fb7185, #e11d48)'
];

export default function MetricsCards({ dataset }) {
  const [showRange, setShowRange] = useState(false);
  const [stats, setStats] = useState({});

  useEffect(() => {
    if (!dataset?.columns) return;

    const numericCols = dataset.columns
      .filter(c => c.type.includes("int") || c.type.includes("float"))
      .map(c => c.name)
      .slice(0, 2);

    numericCols.forEach(col => {
      // Fetch Sum, Min, and Max in one go or separate calls
      fetch(`http://127.0.0.1:5000/query`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ query: `show sum, min, and max of ${col}` })
      })
      .then(res => res.json())
      .then(data => {
        if (!data.error && data.rows?.length > 0) {
          setStats(prev => ({ ...prev, [col]: data.rows[0] }));
        }
      })
      .catch(console.error);
    });
  }, [dataset]);

  const renderCard = (label, value, sub, gradient) => (
    <div className="metric-card">
      <div className="metric-accent" style={{ background: gradient }} />
      <div className="metric-label">{label}</div>
      <div className="metric-val">{value}</div>
      <div className="metric-sub">{sub}</div>
    </div>
  );

  return (
    <div className="metrics-container">
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 10px 10px' }}>
        <button 
          onClick={() => setShowRange(!showRange)}
          style={s.toggleBtn}
        >
          {showRange ? '◈ Show Totals' : '⊙ Show Ranges'}
        </button>
      </div>
      
      <div className="metrics">
        {renderCard('TOTAL ROWS', dataset.row_count?.toLocaleString(), 'in dataset', GRADIENTS[2])}
        {renderCard('FIELDS', dataset.columns.length, 'total columns', GRADIENTS[3])}
        
        {Object.keys(stats).map((col, i) => {
          const colData = stats[col];
          const label = col.replace(/_/g, ' ').toUpperCase();
          
          // Inside the MetricsCards map function
        if (showRange) {
            return renderCard(
            `STATS: ${label}`,
           `Avg: ${Number(colData.avg).toFixed(2)} | ${colData.min} - ${colData.max}`,
           'average, min, and max',
           GRADIENTS[i % 2]
        );
    }
          
          return renderCard(
            `TOTAL ${label}`,
            Number(colData.sum || 0).toLocaleString(undefined, { maximumFractionDigits: 0 }),
            'aggregate sum',
            GRADIENTS[i % 2]
          );
        })}
      </div>
    </div>
  );
}

const s = {
  toggleBtn: {
    background: 'rgba(240,192,64,0.1)',
    border: '1px solid rgba(240,192,64,0.3)',
    color: '#f0c040',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '11px',
    cursor: 'pointer',
    fontFamily: "'JetBrains Mono', monospace"
  }
};