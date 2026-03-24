export default function DatasetBanner({ dataset, onChangeDataset }) {
  const colCount = dataset.columns?.length || 0;

  return (
    <div style={s.banner}>
      {/* Left: file info */}
      <div style={s.left}>
        <div style={s.icon}>⬡</div>
        <div>
          <div style={s.filename}>{dataset.filename}</div>
          <div style={s.meta}>
            <span style={s.metaChip}>{dataset.row_count?.toLocaleString()} rows</span>
            <span style={s.metaChip}>{colCount} columns</span>
            <span style={s.metaChip}>Table: <span style={s.tableName}>{dataset.table_name}</span></span>
          </div>
        </div>
      </div>

      {/* Right: columns preview + change btn */}
      <div style={s.right}>
        <div style={s.cols}>
          {dataset.columns?.slice(0, 5).map((c, i) => (
            <span key={i} style={s.col}>{c.name}</span>
          ))}
          {colCount > 5 && (
            <span style={{ ...s.col, color: "#4a5568" }}>+{colCount - 5} more</span>
          )}
        </div>
        <button style={s.changeBtn} onClick={onChangeDataset}>
          ↑ Change dataset
        </button>
      </div>
    </div>
  );
}

const s = {
  banner: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 24px",
    background: "rgba(240,192,64,0.05)",
    borderBottom: "1px solid rgba(240,192,64,0.15)",
    flexShrink: 0,
    gap: "16px",
    flexWrap: "wrap"
  },
  left: {
    display: "flex",
    alignItems: "center",
    gap: "12px"
  },
  icon: {
    fontSize: "20px",
    color: "#f0c040",
    flexShrink: 0
  },
  filename: {
    fontFamily: "'Syne', sans-serif",
    fontSize: "13px",
    fontWeight: 700,
    color: "#f0f2f8",
    marginBottom: "3px"
  },
  meta: {
    display: "flex",
    gap: "6px",
    flexWrap: "wrap"
  },
  metaChip: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "9.5px",
    color: "#8892a4",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    padding: "2px 8px",
    borderRadius: "20px"
  },
  tableName: {
    color: "#2dd4bf"
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: "12px"
  },
  cols: {
    display: "flex",
    gap: "5px",
    flexWrap: "wrap"
  },
  col: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "9.5px",
    color: "#f0c040",
    background: "rgba(240,192,64,0.08)",
    border: "1px solid rgba(240,192,64,0.15)",
    padding: "2px 8px",
    borderRadius: "20px"
  },
  changeBtn: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "10px",
    padding: "5px 12px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "8px",
    color: "#8892a4",
    cursor: "pointer",
    transition: "all .15s",
    whiteSpace: "nowrap"
  }
};
