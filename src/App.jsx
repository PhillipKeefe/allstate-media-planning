import { useState, useMemo } from "react";
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Label, Cell
} from "recharts";

const RAW_DATA = [
  { app: "Hulu", honda_pct: 21.4, median_index: 119 },
  { app: "Netflix", honda_pct: 18.0, median_index: 96 },
  { app: "Amazon Prime Video", honda_pct: 9.5, median_index: 118 },
  { app: "Dish", honda_pct: 8.2, median_index: 117 },
  { app: "Paramount+", honda_pct: 7.1, median_index: 110 },
  { app: "Max", honda_pct: 4.7, median_index: 99 },
  { app: "Peacock", honda_pct: 4.2, median_index: 117 },
  { app: "Sling TV", honda_pct: 2.7, median_index: 95 },
  { app: "DirecTV", honda_pct: 2.6, median_index: 85 },
  { app: "Xfinity Stream", honda_pct: 2.3, median_index: 102 },
  { app: "Disney+", honda_pct: 2.3, median_index: 80 },
  { app: "Apple TV", honda_pct: 2.2, median_index: 103 },
  { app: "fubo", honda_pct: 1.8, median_index: 106 },
  { app: "Fox Nation", honda_pct: 1.4, median_index: 120 },
  { app: "Pluto TV", honda_pct: 1.3, median_index: 93 },
  { app: "Vudu", honda_pct: 1.3, median_index: 91 },
  { app: "YouTube TV", honda_pct: 1.2, median_index: 95 },
  { app: "Tubi", honda_pct: 1.0, median_index: 93 },
  { app: "Roku", honda_pct: 1.0, median_index: 109 },
  { app: "Discovery+", honda_pct: 1.0, median_index: 86 },
  { app: "Apple TV+", honda_pct: 0.7, median_index: 117 },
  { app: "YouTube", honda_pct: 0.6, median_index: 91 },
  { app: "Google Play Store", honda_pct: 0.6, median_index: 101 },
];

const REACH_THRESHOLD = 4;
const PROPENSITY_THRESHOLD = 100;

function getTier(d) {
  if (d.honda_pct >= REACH_THRESHOLD && d.median_index >= PROPENSITY_THRESHOLD) return "anchor";
  if (d.honda_pct < REACH_THRESHOLD && d.median_index >= PROPENSITY_THRESHOLD) return "efficiency";
  if (d.honda_pct >= REACH_THRESHOLD && d.median_index < PROPENSITY_THRESHOLD) return "scale";
  return "deprioritize";
}

const TIER_META = {
  anchor:       { label: "Priority Investment", full: "High Reach + High Propensity",  color: "#22c55e", bg: "rgba(34,197,94,0.08)",   rec: "Allocate majority of budget" },
  efficiency:   { label: "Efficiency",    full: "Low Reach + High Propensity",   color: "#3b82f6", bg: "rgba(59,130,246,0.08)",  rec: "Layer in for incremental reach" },
  scale:        { label: "Scale Only",    full: "High Reach + Low Propensity",   color: "#f59e0b", bg: "rgba(245,158,11,0.08)",  rec: "Use selectively for broad reach" },
  deprioritize: { label: "Deprioritize",  full: "Low Reach + Low Propensity",    color: "#94a3b8", bg: "rgba(148,163,184,0.06)", rec: "Shift budget away" },
};

const LOG_TICKS = [0.5, 1, 2, 4, 8, 16, 24];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const tier = getTier(d);
  const meta = TIER_META[tier];
  return (
    <div style={{
      background: "#1a1a2e", border: `1px solid ${meta.color}`,
      borderRadius: 8, padding: "12px 16px", fontFamily: "'DM Sans', sans-serif",
      color: "#e2e8f0", fontSize: 13, lineHeight: 1.7, minWidth: 200,
      boxShadow: "0 8px 32px rgba(0,0,0,0.4)"
    }}>
      <div style={{ fontWeight: 700, fontSize: 15, color: "#f8fafc", marginBottom: 4 }}>{d.app}</div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 24 }}>
        <span style={{ color: "#94a3b8" }}>Honda Share</span>
        <span style={{ fontFamily: "JetBrains Mono", fontWeight: 500 }}>{d.honda_pct.toFixed(1)}%</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 24 }}>
        <span style={{ color: "#94a3b8" }}>Median Index</span>
        <span style={{ fontFamily: "JetBrains Mono", fontWeight: 500 }}>{d.median_index}</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 24 }}>
        <span style={{ color: "#94a3b8" }}>Priority</span>
        <span style={{ fontFamily: "JetBrains Mono", fontWeight: 600 }}>{d.priority.toFixed(1)}</span>
      </div>
      <div style={{
        marginTop: 8, paddingTop: 8, borderTop: `1px solid ${meta.color}33`,
        color: meta.color, fontWeight: 600, fontSize: 12
      }}>
        {meta.label} — {meta.rec}
      </div>
    </div>
  );
};

const CustomDot = (props) => {
  const { cx, cy, payload } = props;
  const tier = getTier(payload);
  const color = TIER_META[tier].color;
  const r = Math.max(7, Math.min(28, payload.honda_pct * 2));
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={color} fillOpacity={0.2} stroke={color} strokeWidth={1.5} />
      <circle cx={cx} cy={cy} r={3.5} fill={color} />
    </g>
  );
};

function TierCard({ tierKey, apps }) {
  const meta = TIER_META[tierKey];
  return (
    <div style={{
      background: meta.bg, border: `1px solid ${meta.color}22`,
      borderRadius: 8, padding: "14px 18px", flex: "1 1 220px", minWidth: 220,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: meta.color }} />
        <span style={{ color: meta.color, fontWeight: 700, fontSize: 14 }}>{meta.label}</span>
      </div>
      <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 10, lineHeight: 1.5 }}>
        {meta.full}. {meta.rec}.
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
        {apps.map(a => (
          <span key={a} style={{
            fontSize: 11, padding: "2px 8px", borderRadius: 4,
            background: `${meta.color}15`, color: "#e2e8f0",
            border: `1px solid ${meta.color}22`, fontWeight: 500,
          }}>{a}</span>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [sortCol, setSortCol] = useState("priority");
  const [sortDir, setSortDir] = useState("desc");

  const data = useMemo(() =>
    RAW_DATA.map(d => ({
      ...d,
      priority: d.honda_pct * d.median_index / 100,
    })),
  []);

  const tierGroups = useMemo(() => {
    const groups = { anchor: [], efficiency: [], scale: [], deprioritize: [] };
    data.forEach(d => groups[getTier(d)].push(d.app));
    return groups;
  }, [data]);

  const sorted = useMemo(() => {
    const arr = [...data];
    arr.sort((a, b) => {
      const av = sortCol === "app" ? a.app : a[sortCol];
      const bv = sortCol === "app" ? b.app : b[sortCol];
      if (sortCol === "app") return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      return sortDir === "asc" ? av - bv : bv - av;
    });
    return arr;
  }, [data, sortCol, sortDir]);

  const toggleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("desc"); }
  };

  const arrow = (col) => sortCol === col ? (sortDir === "desc" ? " \u2193" : " \u2191") : "";

  return (
    <div style={{
      fontFamily: "'DM Sans', sans-serif",
      background: "#0f0f1a",
      color: "#e2e8f0",
      minHeight: "100vh",
      padding: "40px 28px 60px",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />

      <div style={{ maxWidth: 1000, margin: "0 auto" }}>

        <div style={{ marginBottom: 40 }}>
          <div style={{
            fontSize: 11, fontWeight: 600, letterSpacing: "0.12em",
            color: "#64748b", textTransform: "uppercase", marginBottom: 8,
          }}>
            Streaming Media Analysis — March 2026
          </div>
          <h1 style={{
            fontSize: 32, fontWeight: 700, letterSpacing: "-0.03em",
            margin: "0 0 20px 0", color: "#f8fafc", lineHeight: 1.2,
          }}>
            Streaming Investment Opportunities for Honda Intenders
          </h1>

          <div style={{
            background: "#16162a", borderRadius: 12, border: "1px solid #1e293b",
            padding: "22px 26px", marginBottom: 0,
          }}>
            <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.7, marginBottom: 14 }}>
              Samba leveraged how consumers engage online to identify where Honda purchase intenders
              spend their streaming time and where media investment will have the highest impact.
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 14 }}>
              <span style={{ fontSize: 18, fontWeight: 700, color: "#f8fafc" }}>Honda Intenders</span>
              <span style={{ fontSize: 13, color: "#64748b" }}>·</span>
              <span style={{ fontSize: 13, color: "#94a3b8" }}>[X.X]MM Households</span>
            </div>
            <div style={{ fontSize: 13, color: "#cbd5e1", lineHeight: 1.7, marginBottom: 10 }}>
              Households actively researching a potential Honda purchase by:
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 24px", fontSize: 13, color: "#94a3b8", lineHeight: 1.8 }}>
              <span>• Browsing listings on <span style={{ color: "#f1f5f9", fontWeight: 600 }}>CarGurus</span></span>
              <span>• Checking valuations on <span style={{ color: "#f1f5f9", fontWeight: 600 }}>Kelley Blue Book</span></span>
              <span>• Reading reviews on <span style={{ color: "#f1f5f9", fontWeight: 600 }}>MotorTrend</span> and <span style={{ color: "#f1f5f9", fontWeight: 600 }}>Car and Driver</span></span>
              <span>• Scanning owner feedback on <span style={{ color: "#f1f5f9", fontWeight: 600 }}>CarComplaints</span></span>
            </div>
            <div style={{
              fontSize: 13, color: "#94a3b8", lineHeight: 1.7, marginTop: 16,
              paddingTop: 14, borderTop: "1px solid #1e293b",
            }}>
              Using this cohort, we mapped their streaming behavior against the general population
              to surface which platforms offer the strongest combination of reach and behavioral concentration.
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, marginBottom: 32, flexWrap: "wrap" }}>
          {Object.entries(tierGroups).map(([key, apps]) => (
            <TierCard key={key} tierKey={key} apps={apps} />
          ))}
        </div>

        <div style={{
          background: "#16162a", borderRadius: 12, padding: "28px 20px 16px 8px",
          border: "1px solid #1e293b", marginBottom: 8, position: "relative"
        }}>
          <div style={{
            fontSize: 16, fontWeight: 700, color: "#f8fafc",
            padding: "0 0 16px 16px", textAlign: "center",
          }}>
            Viewing Propensity vs. Share of Total Viewing
          </div>
          <div style={{ position: "absolute", top: 56, right: 34, fontSize: 10, color: "#22c55e", fontWeight: 600, opacity: 0.4, textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "right" }}>
            High Reach +<br/>High Propensity
          </div>
          <div style={{ position: "absolute", top: 56, left: 72, fontSize: 10, color: "#3b82f6", fontWeight: 600, opacity: 0.4, textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "left" }}>
            Low Reach +<br/>High Propensity
          </div>
          <div style={{ position: "absolute", bottom: 90, right: 34, fontSize: 10, color: "#f59e0b", fontWeight: 600, opacity: 0.4, textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "right" }}>
            High Reach +<br/>Low Propensity
          </div>
          <div style={{ position: "absolute", bottom: 90, left: 72, fontSize: 10, color: "#94a3b8", fontWeight: 600, opacity: 0.4, textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "left" }}>
            Low Reach +<br/>Low Propensity
          </div>
          <ResponsiveContainer width="100%" height={460}>
            <ScatterChart margin={{ top: 10, right: 30, bottom: 35, left: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="honda_pct" type="number"
                scale="log" domain={[0.5, 28]}
                ticks={LOG_TICKS}
                tick={{ fill: "#94a3b8", fontSize: 12, fontFamily: "JetBrains Mono" }}
                stroke="#334155"
                tickFormatter={v => `${v}%`}
              >
                <Label value="Share of Total Viewing" position="bottom" offset={14}
                  style={{ fill: "#94a3b8", fontSize: 12, fontFamily: "DM Sans" }} />
              </XAxis>
              <YAxis
                dataKey="median_index" type="number"
                tick={{ fill: "#94a3b8", fontSize: 12, fontFamily: "JetBrains Mono" }}
                stroke="#334155"
                domain={[75, 125]}
              >
                <Label angle={-90} position="insideLeft" dy={12}
                  content={({ viewBox }) => {
                    const cx = viewBox.x + 2;
                    const cy = viewBox.y + viewBox.height / 2;
                    return (
                      <text x={cx} y={cy} textAnchor="middle" fill="#94a3b8" fontSize={12} fontFamily="DM Sans" transform={`rotate(-90, ${cx}, ${cy})`}>
                        <tspan x={cx} dy="-0.6em">Viewing Propensity</tspan>
                        <tspan x={cx} dy="1.3em">(Median Viewing Index)</tspan>
                      </text>
                    );
                  }}
                />
              </YAxis>
              <ReferenceLine y={PROPENSITY_THRESHOLD} stroke="#475569" strokeDasharray="6 4" strokeWidth={1.5} />
              <ReferenceLine x={REACH_THRESHOLD} stroke="#475569" strokeDasharray="6 4" strokeWidth={1.5} />
              <Tooltip content={<CustomTooltip />} cursor={false} />
              <Scatter data={data} shape={<CustomDot />}>
                {data.map((d, i) => <Cell key={i} />)}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        <div style={{
          fontSize: 11, color: "#475569", fontStyle: "italic",
          padding: "0 0 28px 16px",
        }}>
          X-axis uses a logarithmic scale to better distribute clustered values. Actual percentages shown on axis labels, tooltips, and table.
        </div>

        <div style={{
          background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.15)",
          borderRadius: 10, padding: "18px 22px", marginBottom: 32, lineHeight: 1.7,
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#22c55e", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
            Key Insight
          </div>
          <div style={{ fontSize: 14, color: "#cbd5e1" }}>
            Honda intenders watch the same total amount of streaming as the general population (Wilcoxon p = 0.39, not significant).
            However, they distribute that time differently across platforms (Chi-square p &lt; 0.001, highly significant).
            The opportunity is not in buying more impressions — it's in buying them in the right places.
            Priority Investment platforms (Hulu, Amazon Prime Video, Dish, Paramount+, Peacock) combine scale with behavioral lean
            and should receive the majority of budget allocation.
          </div>
        </div>

        <div style={{
          background: "#16162a", borderRadius: 12, border: "1px solid #1e293b",
          overflow: "hidden", marginBottom: 32,
        }}>
          <div style={{ padding: "18px 22px 14px", borderBottom: "1px solid #1e293b" }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#f8fafc" }}>
              Priority Score Table
            </div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
              Priority = Honda Share × Weighted Median Index. Click headers to sort.
            </div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #1e293b" }}>
                  {[
                    { key: "app", label: "Application", align: "left" },
                    { key: "honda_pct", label: "Honda Share %", align: "right" },
                    { key: "median_index", label: "Median Index", align: "right" },
                    { key: "priority", label: "Priority", align: "right" },
                  ].map(col => (
                    <th key={col.key}
                      onClick={() => toggleSort(col.key)}
                      style={{
                        padding: "11px 18px", textAlign: col.align, fontWeight: 600,
                        color: sortCol === col.key ? "#f8fafc" : "#94a3b8",
                        cursor: "pointer", userSelect: "none", whiteSpace: "nowrap",
                        fontFamily: "DM Sans", fontSize: 11, textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        background: sortCol === col.key ? "rgba(255,255,255,0.03)" : "transparent",
                      }}>
                      {col.label}{arrow(col.key)}
                    </th>
                  ))}
                  <th style={{
                    padding: "11px 18px", textAlign: "left", fontWeight: 600,
                    color: "#94a3b8", fontSize: 11, textTransform: "uppercase",
                    letterSpacing: "0.06em", fontFamily: "DM Sans"
                  }}>
                    Tier
                  </th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((d, i) => {
                  const tier = getTier(d);
                  const meta = TIER_META[tier];
                  return (
                    <tr key={d.app} style={{
                      borderBottom: "1px solid #1e293b",
                      background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.012)",
                    }}>
                      <td style={{ padding: "10px 18px", fontWeight: 500, color: "#f1f5f9" }}>
                        {d.app}
                      </td>
                      <td style={{
                        padding: "10px 18px", textAlign: "right",
                        fontFamily: "JetBrains Mono", fontSize: 12, color: "#cbd5e1"
                      }}>
                        {d.honda_pct.toFixed(1)}%
                      </td>
                      <td style={{
                        padding: "10px 18px", textAlign: "right",
                        fontFamily: "JetBrains Mono", fontSize: 12,
                        color: d.median_index >= PROPENSITY_THRESHOLD ? "#22c55e" : "#ef4444",
                        fontWeight: 600,
                      }}>
                        {d.median_index}
                      </td>
                      <td style={{
                        padding: "10px 18px", textAlign: "right",
                        fontFamily: "JetBrains Mono", fontSize: 12, fontWeight: 600,
                        color: "#f8fafc"
                      }}>
                        {d.priority.toFixed(1)}
                      </td>
                      <td style={{ padding: "10px 18px" }}>
                        <span style={{
                          display: "inline-block", padding: "3px 10px", borderRadius: 4,
                          fontSize: 11, fontWeight: 600, letterSpacing: "0.03em",
                          color: meta.color, background: meta.bg,
                          border: `1px solid ${meta.color}33`,
                        }}>
                          {meta.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{
          background: "#16162a", borderRadius: 12, border: "1px solid #1e293b",
          padding: "20px 22px", marginBottom: 32,
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#f8fafc", marginBottom: 10 }}>
            Methodology
          </div>
          <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.8 }}>
            <strong style={{ color: "#cbd5e1" }}>Reach (x-axis):</strong> Honda intender viewing share — the percentage of total Honda intender
            weighted streaming minutes captured by each app. Displayed on a logarithmic scale to better
            distribute the wide range of values (0.6% to 21.4%). Actual percentages are shown on all labels.
          </div>
          <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.8, marginTop: 8 }}>
            <strong style={{ color: "#cbd5e1" }}>Propensity (y-axis):</strong> Weighted median viewing index — the typical Honda intender
            household's viewing on each app divided by the typical general population household's viewing,
            indexed to 100. Uses population-weighted medians to eliminate outlier bias. Values above 100 indicate
            Honda intenders lean into an app harder than the average household.
          </div>
          <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.8, marginTop: 8 }}>
            <strong style={{ color: "#cbd5e1" }}>Priority score:</strong> Honda share × median index. Rewards both scale and behavioral
            concentration. A high-share app at index 100 scores lower than a high-share app at index 115,
            correctly reflecting the latter's superior targeting efficiency.
          </div>
          <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.8, marginTop: 8 }}>
            <strong style={{ color: "#cbd5e1" }}>Tier thresholds:</strong> Priority Investment = share ≥ {REACH_THRESHOLD}% and index ≥ {PROPENSITY_THRESHOLD}.
            Efficiency = index ≥ {PROPENSITY_THRESHOLD}, share &lt; {REACH_THRESHOLD}%. Scale Only = share ≥ {REACH_THRESHOLD}%, index &lt; {PROPENSITY_THRESHOLD}.
            Deprioritize = below both.
          </div>
        </div>

        <div style={{
          fontSize: 11, color: "#334155", textAlign: "center", paddingTop: 16,
          borderTop: "1px solid #1e293b",
        }}>
          Source: SambaTV Streaming Panel · Honda Auto Intender Web Behavior Cohort · March 2026
        </div>
      </div>
    </div>
  );
}
