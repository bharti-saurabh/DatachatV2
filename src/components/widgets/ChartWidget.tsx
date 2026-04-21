import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line, AreaChart, Area,
  PieChart, Pie, Cell, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend,
} from "recharts";
import type { Widget, QueryRow } from "@/types";

const COLORS = ["#3b82f6", "#8b5cf6", "#22d3ee", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#6366f1"];

const TOOLTIP_STYLE = {
  background: "rgba(10,10,20,0.9)", border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 10, fontSize: 11, color: "rgba(255,255,255,0.8)",
};

function numericKeys(data: QueryRow[]): string[] {
  if (!data.length) return [];
  return Object.keys(data[0]).filter((k) => typeof data[0][k] === "number" || !isNaN(Number(data[0][k])));
}

export function ChartWidget({ widget }: { widget: Widget }) {
  const data = widget.data ?? [];
  if (!data.length) return <div className="h-full flex items-center justify-center text-xs text-white/20">No data</div>;

  const keys = Object.keys(data[0]);
  const xKey = widget.xKey ?? keys[0];
  const rawYKey = widget.yKey;
  const yKeys = Array.isArray(rawYKey) ? rawYKey : rawYKey ? [rawYKey] : numericKeys(data).filter((k) => k !== xKey).slice(0, 4);

  const chartType = widget.chartType ?? "bar";
  const commonProps = { data, margin: { top: 4, right: 8, left: -16, bottom: 0 } };

  const axisProps = {
    tick: { fill: "rgba(255,255,255,0.3)", fontSize: 10 },
    axisLine: { stroke: "rgba(255,255,255,0.06)" },
    tickLine: false,
  };

  if (chartType === "pie" || chartType === "donut") {
    const valueKey = yKeys[0] ?? keys[1];
    return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey={valueKey} nameKey={xKey} cx="50%" cy="50%"
            innerRadius={chartType === "donut" ? "55%" : 0} outerRadius="70%"
            paddingAngle={2} strokeWidth={0}>
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} fillOpacity={0.9} />)}
          </Pie>
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }} />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  if (chartType === "scatter") {
    const xNumKey = yKeys[0] ?? keys[0];
    const yNumKey = yKeys[1] ?? keys[1];
    return (
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={commonProps.margin}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey={xNumKey} {...axisProps} />
          <YAxis {...axisProps} />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Scatter data={data} dataKey={yNumKey} fill={COLORS[0]} fillOpacity={0.8} />
        </ScatterChart>
      </ResponsiveContainer>
    );
  }

  const ChartComp = chartType === "line" ? LineChart : chartType === "area" ? AreaChart : BarChart;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ChartComp {...commonProps}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis dataKey={xKey} {...axisProps} tickFormatter={(v) => String(v).slice(0, 12)} />
        <YAxis {...axisProps} />
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        {yKeys.length > 1 && <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }} />}
        {yKeys.map((key, i) =>
          chartType === "line" ? (
            <Line key={key} type="monotone" dataKey={key} stroke={COLORS[i % COLORS.length]}
              strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
          ) : chartType === "area" ? (
            <Area key={key} type="monotone" dataKey={key} stroke={COLORS[i % COLORS.length]}
              fill={COLORS[i % COLORS.length]} strokeWidth={2} fillOpacity={0.15} />
          ) : (
            <Bar key={key} dataKey={key} fill={COLORS[i % COLORS.length]} fillOpacity={0.85} radius={[3, 3, 0, 0]} />
          )
        )}
      </ChartComp>
    </ResponsiveContainer>
  );
}
