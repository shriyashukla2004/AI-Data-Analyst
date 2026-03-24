import React from "react";
import {
  BarChart, Bar,
  LineChart, Line,
  PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer
} from "recharts";

const PALETTE = ["#f0c040", "#2dd4bf", "#60a5fa", "#fb7185", "#a78bfa", "#34d399"];

const tooltipStyle = {
  backgroundColor: "#0d1117",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "10px",
  color: "#f0f2f8",
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: "11px",
  padding: "8px 12px"
};

const axisStyle = {
  fill: "#4a5568",
  fontSize: 10,
  fontFamily: "'JetBrains Mono', monospace"
};

export default function ChartRenderer({ chart }) {
  if (!chart || !chart.labels || !chart.data) return null;

  const formattedData = chart.labels.map((label, i) => ({
    label,
    value: chart.data[i]
  }));

  const renderChart = () => {
    if (chart.type === "bar") {
      return (
        <BarChart data={formattedData} barSize={24}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="label" tick={axisStyle} axisLine={false} tickLine={false} />
          <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(240,192,64,0.05)" }} />
          <Bar dataKey="value" fill="#f0c040" radius={[4, 4, 0, 0]} opacity={0.9} />
        </BarChart>
      );
    }
    if (chart.type === "line") {
      return (
        <LineChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="label" tick={axisStyle} axisLine={false} tickLine={false} />
          <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={tooltipStyle} />
          <Line
            dataKey="value"
            stroke="#2dd4bf"
            strokeWidth={2.5}
            dot={{ r: 3, fill: "#2dd4bf", strokeWidth: 0 }}
            activeDot={{ r: 5, fill: "#2dd4bf", stroke: "rgba(45,212,191,0.3)", strokeWidth: 4 }}
          />
        </LineChart>
      );
    }
    if (chart.type === "pie") {
      return (
        <PieChart>
          <Pie
            data={formattedData}
            dataKey="value"
            nameKey="label"
            cx="50%" cy="50%"
            outerRadius={90} innerRadius={45}
            paddingAngle={3}
          >
            {formattedData.map((_, i) => (
              <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} />
        </PieChart>
      );
    }
    return null;
  };

  return (
    <div className="chart-container">
      <div className="chart-title">◈ CHART</div>
      <div style={{ width: "100%", height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
