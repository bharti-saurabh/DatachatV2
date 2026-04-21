// ── Widget ────────────────────────────────────────────────────────────────────
export type WidgetType = "kpi" | "chart" | "table" | "insight";
export type ChartType = "bar" | "line" | "area" | "pie" | "donut" | "scatter";

export interface WidgetLayout {
  x: number; y: number; w: number; h: number;
}

export interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  sql?: string;
  chartType?: ChartType;
  xKey?: string;
  yKey?: string | string[];
  insight?: string;
  layout: WidgetLayout;
  // runtime state
  data?: QueryRow[];
  loading?: boolean;
  error?: string;
}

// ── Data ─────────────────────────────────────────────────────────────────────
export type QueryRow = Record<string, unknown>;

export interface TableSchema {
  name: string;
  sql: string;
  columns: { name: string; type: string }[];
  rowCount?: number;
}

// ── LLM ──────────────────────────────────────────────────────────────────────
export interface LLMSettings {
  endpoint: string;
  model: string;
  apiKey: string;
}

export const DEFAULT_LLM_SETTINGS: LLMSettings = {
  endpoint: "https://api.openai.com/v1",
  model: "gpt-4o-mini",
  apiKey: "",
};

// ── Dashboard ─────────────────────────────────────────────────────────────────
export interface Dashboard {
  id: string;
  name: string;
  widgets: Widget[];
  createdAt: number;
  updatedAt: number;
}

// ── Toast ─────────────────────────────────────────────────────────────────────
export interface Toast {
  id: string;
  variant: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
}
