import React, { useState, useEffect } from 'react';

export default function TableViewer({ dataset, tableName }) {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!dataset || !tableName) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Fetching from the dedicated table endpoint for reliability
    fetch(`http://127.0.0.1:5000/table/${tableName}?limit=100`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
          setTableData([]);
        } else {
          // Backend returns data in 'rows' array
          setTableData(data.rows || []);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Table fetch error:', err);
        setError('Failed to load table data. Is backend running?');
        setTableData([]);
        setLoading(false);
      });
  }, [dataset, tableName]); // Closing the useEffect correctly

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', flexDirection: 'column', alignItems: 'center', 
        justifyContent: 'center', height: '100%', padding: '60px 24px' 
      }}>
        <div style={{ 
          width: '32px', height: '32px', border: '3px solid #f3f4f6', 
          borderTop: '3px solid #f0c040', borderRadius: '50%', 
          animation: 'spin 1s linear infinite', marginBottom: '16px' 
        }} />
        <p style={{ color: '#8892a4', fontSize: '14px', fontFamily: "'Inter', sans-serif" }}>
          Loading table data...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: '60px 24px', textAlign: 'center', color: '#fb7185', 
        fontFamily: "'Inter', sans-serif" 
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
        <p style={{ fontSize: '16px', marginBottom: '8px' }}>Error</p>
        <p style={{ fontSize: '14px', color: '#8892a4' }}>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#0d1117' }}>
      {/* Header */}
      <div style={{ 
        padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.05)', 
        background: 'rgba(255,255,255,0.02)', fontFamily: "'Inter', sans-serif" 
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ 
              fontSize: '22px', fontWeight: 700, color: '#f0f2f8', 
              margin: '0 0 4px 0', fontFamily: "'Syne', sans-serif" 
            }}>
              {dataset?.filename || 'Table Preview'}
            </h2>
            <div style={{ 
              fontSize: '12px', color: '#4a5568', fontFamily: "'JetBrains Mono', monospace" 
            }}>
              {dataset?.row_count?.toLocaleString() || 0} rows • {dataset?.columns?.length || 0} columns • Showing top 100
            </div>
          </div>
          <div style={{ 
            fontSize: '11px', color: '#f0c040', background: 'rgba(240,192,64,0.1)', 
            padding: '4px 10px', borderRadius: '6px', border: '1px solid rgba(240,192,64,0.2)' 
          }}>
            DB Table: <code style={{ fontFamily: "monospace" }}>{tableName}</code>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
        {tableData.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#4a5568' }}>
            <p>No data found in this table.</p>
          </div>
        ) : (
          <table style={{ 
            width: '100%', borderCollapse: 'separate', borderSpacing: 0,
            fontFamily: "'Inter', sans-serif", color: '#f0f2f8',
            background: 'rgba(255,255,255,0.02)', borderRadius: '12px', overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.05)'
          }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                {dataset.columns?.map(col => (
                  <th key={col.name} style={{ 
                    padding: '12px 16px', textAlign: 'left', fontWeight: 600,
                    color: '#8892a4', fontSize: '11px', borderBottom: '1px solid rgba(255,255,255,0.08)',
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                    position: 'sticky', top: 0, background: '#161b22', zIndex: 10
                  }}>
                    {col.name.replace(/_/g, ' ')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, rowIndex) => (
                <tr key={rowIndex} className="table-row-hover">
                  {dataset.columns?.map(col => (
                    <td key={col.name} style={{ 
                      padding: '12px 16px', fontSize: '13px', borderBottom: '1px solid rgba(255,255,255,0.03)',
                      color: '#f0f2f8', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                    }}>
                      {row[col.name] !== null && row[col.name] !== undefined ? String(row[col.name]) : '—'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}