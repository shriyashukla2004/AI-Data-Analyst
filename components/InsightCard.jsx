export default function InsightCard({ insight }) {
  if (!insight) return null;

  // ── Parse the insight text into structured points ──────────────
  // Handles formats like:
  //   "1. **Title**: explanation"
  //   "**Title**: explanation"
  //   Plain paragraph text
  const parseInsight = (text) => {
    // Split on numbered points like "1. " "2. " etc.
    const numberedSplit = text.split(/(?=\d+\.\s+\*\*|\d+\.\s+[A-Z])/g).filter(Boolean);

    if (numberedSplit.length > 1) {
      return numberedSplit.map((chunk) => {
        // Strip leading "1. " etc.
        const stripped = chunk.replace(/^\d+\.\s+/, "").trim();
        return parseChunk(stripped);
      });
    }

    // Fallback: split on double newlines or bullet dashes
    const lines = text.split(/\n+/).filter(s => s.trim());
    if (lines.length > 1) {
      return lines.map(line => parseChunk(line.replace(/^[-•]\s*/, "").trim()));
    }

    // Single block — return as one item
    return [parseChunk(text.trim())];
  };

  // Parse "**Title**: body" or "**Title** body" into { title, body }
  const parseChunk = (chunk) => {
    const match = chunk.match(/^\*\*(.+?)\*\*[:\s]+(.+)/s);
    if (match) {
      return { title: match[1].trim(), body: match[2].trim() };
    }
    // No bold title — treat whole thing as body
    return { title: null, body: chunk.replace(/\*\*/g, "") };
  };

  const points = parseInsight(insight);

  return (
    <div style={s.wrap}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.headerLine} />
        <span style={s.headerLabel}>AI INSIGHT</span>
        <div style={s.headerLine} />
      </div>

      {/* Points */}
      <div style={s.list}>
        {points.map((pt, i) => (
          <div key={i} style={s.point}>
            {/* Number badge */}
            <div style={s.badge}>{i + 1}</div>

            {/* Content */}
            <div style={s.content}>
              {pt.title && <div style={s.title}>{pt.title}</div>}
              <div style={s.body}>{pt.body}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const s = {
  wrap: {
    marginTop: "14px",
    background: "linear-gradient(135deg, rgba(240,192,64,0.06), rgba(240,192,64,0.02))",
    border: "1px solid rgba(240,192,64,0.18)",
    borderRadius: "12px",
    overflow: "hidden"
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 16px 8px"
  },
  headerLine: {
    flex: 1,
    height: "1px",
    background: "rgba(240,192,64,0.2)"
  },
  headerLabel: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "8.5px",
    letterSpacing: ".18em",
    color: "#f0c040",
    flexShrink: 0
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "0px",
    padding: "4px 0 12px"
  },
  point: {
    display: "flex",
    gap: "12px",
    alignItems: "flex-start",
    padding: "8px 16px",
    borderBottom: "1px solid rgba(240,192,64,0.06)"
  },
  badge: {
    minWidth: "20px",
    height: "20px",
    borderRadius: "6px",
    background: "rgba(240,192,64,0.12)",
    border: "1px solid rgba(240,192,64,0.25)",
    color: "#f0c040",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "10px",
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: "1px"
  },
  content: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "2px"
  },
  title: {
    fontFamily: "'Syne', sans-serif",
    fontSize: "12.5px",
    fontWeight: 700,
    color: "#f0f2f8",
    letterSpacing: "-.01em"
  },
  body: {
    fontFamily: "'Inter', sans-serif",
    fontSize: "12px",
    color: "#8892a4",
    lineHeight: 1.7
  }
};
