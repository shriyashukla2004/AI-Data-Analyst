import { useState, useRef, useEffect } from "react";
import Message from "./Message";

// Build smart suggestions from the actual column names
function buildSuggestions(dataset) {
  if (!dataset || !dataset.columns) return [
    "Show me all the data",
    "What columns are available?",
    "Count total rows",
    "Show sample data"
  ];

  const cols = dataset.columns.map(c => c.name);
  const table = dataset.table_name;

  // Try to pick numeric + categorical columns for smart suggestions
  const numericCols = dataset.columns
    .filter(c => c.type.includes("float") || c.type.includes("int"))
    .map(c => c.name);
  const textCols = dataset.columns
    .filter(c => c.type.includes("object") || c.type.includes("str"))
    .map(c => c.name);

  const suggestions = [];

  if (numericCols[0] && textCols[0]) {
    suggestions.push(`Total ${numericCols[0]} by ${textCols[0]}`);
    suggestions.push(`Average ${numericCols[0]} grouped by ${textCols[0]}`);
  }
  if (numericCols[0]) {
    suggestions.push(`Top 10 rows by ${numericCols[0]}`);
    suggestions.push(`Show max and min of ${numericCols[0]}`);
  }

  // Always add these
  suggestions.push(`Show first 20 rows of ${table}`);
  suggestions.push(`How many rows are in ${table}?`);

  return suggestions.slice(0, 4);
}

export default function ChatWindow({ messages, setMessages, rerunRef, dataset }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const query = text || input;
    if (!query.trim()) return;

    const newMessages = [...messages, { role: "user", text: query }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:5000/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query })
      });
      const data = await res.json();

      if (data.error) {
        setMessages([...newMessages, { role: "bot", text: `⚠ ${data.error}` }]);
      } else {
        setMessages([...newMessages, {
          role: "bot",
          text: data.chart_explanation || "Here are your results.",
          sql: data.sql,
          chart: data.chart,
          insight: data.insight
        }]);
      }
    } catch {
      setMessages([...newMessages, {
        role: "bot",
        text: "⚠ Could not connect to the server. Is Flask running on port 5000?"
      }]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (rerunRef) rerunRef.current = sendMessage;
  });

  const suggestions = buildSuggestions(dataset);

  return (
    <div className="chat-window">
      <div className="chat-messages">

        {messages.length === 0 && (
          <div className="empty-state">
            <div className="empty-ring">
              <span className="empty-icon-text">AI</span>
            </div>
            <h2 className="empty-title">Ask your data anything</h2>
            <p className="empty-sub">
              Your dataset <span style={{ color: "#f0c040", fontFamily: "monospace" }}>
                {dataset?.filename}
              </span> is ready — query it in plain English.
            </p>
            <div className="quick-suggestions">
              {suggestions.map(s => (
                <button key={s} className="quick-chip" onClick={() => sendMessage(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <Message key={i} {...msg} />
        ))}

        {loading && (
          <div className="loader-row">
            <div className="loader-bubble">
              <div className="loader-dot" />
              <div className="loader-dot" />
              <div className="loader-dot" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="input-bar">
        <div className="input-inner">
          <input
            className="chat-input"
            placeholder={`Ask anything about ${dataset?.filename || "your data"}…`}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMessage()}
          />
          <button className="send-button" onClick={() => sendMessage()}>
            SEND ↑
          </button>
        </div>
        <p className="input-hint">
          ↵ Enter to send &nbsp;·&nbsp; Powered by Llama 3.3 70B &nbsp;·&nbsp;
          Table: <span style={{ color: "#2dd4bf" }}>{dataset?.table_name || "—"}</span>
        </p>
      </div>
    </div>
  );
}
