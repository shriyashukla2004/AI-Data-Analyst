import ChartRenderer from "./ChartRenderer";
import InsightCard from "./InsightCard";

export default function Message({ role, text, sql, chart, insight }) {
  const isUser = role === "user";
  return (
    <div className={`message-row ${isUser ? "user" : "bot"}`}>
      <div className="bubble">
        <p>{text}</p>
        {sql && (
          <>
            <div className="sql-header">GENERATED SQL</div>
            <pre className="sql-code">{sql}</pre>
          </>
        )}
        {chart && <ChartRenderer chart={chart} />}
        {insight && <InsightCard insight={insight} />}
      </div>
    </div>
  );
}
