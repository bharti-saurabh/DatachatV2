import { callLLMJSON } from "@/lib/llm";
import { runQuery } from "@/lib/db";
import { generateId } from "@/lib/utils";
import type { Widget, LLMSettings, TableSchema, QueryRow, ChartType } from "@/types";

interface AIWidget {
  id: string;
  type: "kpi" | "chart" | "table" | "insight";
  title: string;
  sql?: string;
  chartType?: ChartType;
  xKey?: string;
  yKey?: string | string[];
  insight?: string;
  layout: { x: number; y: number; w: number; h: number };
}

interface AIResponse {
  dashboardTitle: string;
  widgets: AIWidget[];
}

const SCHEMA = {
  type: "object" as const,
  additionalProperties: false,
  required: ["dashboardTitle", "widgets"],
  properties: {
    dashboardTitle: { type: "string" },
    widgets: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "type", "title", "layout"],
        properties: {
          id: { type: "string" },
          type: { type: "string", enum: ["kpi", "chart", "table", "insight"] },
          title: { type: "string" },
          sql: { type: "string" },
          chartType: { type: "string", enum: ["bar", "line", "area", "pie", "donut", "scatter"] },
          xKey: { type: "string" },
          yKey: { anyOf: [{ type: "string" }, { type: "array", items: { type: "string" } }] },
          insight: { type: "string" },
          layout: {
            type: "object",
            additionalProperties: false,
            required: ["x", "y", "w", "h"],
            properties: {
              x: { type: "number" }, y: { type: "number" },
              w: { type: "number" }, h: { type: "number" },
            },
          },
        },
      },
    },
  },
};

export async function buildDashboard(
  prompt: string,
  schemas: TableSchema[],
  settings: LLMSettings,
  existingWidgets: Widget[],
): Promise<{ title: string; widgets: Widget[] }> {
  const schemaText = schemas.map((s) =>
    `Table: ${s.name} (${s.rowCount?.toLocaleString() ?? "?"} rows)\nColumns: ${s.columns.map((c) => `${c.name} (${c.type})`).join(", ")}`
  ).join("\n\n");

  const existingContext = existingWidgets.length > 0
    ? `\nExisting dashboard widgets: ${existingWidgets.map((w) => w.title).join(", ")}. Add new widgets or suggest modifications.\n`
    : "";

  const system = `You are an expert data analyst and dashboard designer. Given a dataset schema and user prompt, design a Bento Box dashboard with multiple widgets.

Rules:
- Use a 12-column grid (x+w ≤ 12). Max y position should be reasonable (use 0-8 range).
- KPI widgets: w=3, h=2. SQL must return a single row with a "value" column and optionally "label", "delta", "unit".
- Chart widgets: w=6 or w=9, h=4. SQL returns rows for chart. Specify xKey and yKey. chartType: bar/line/area/pie/donut/scatter.
- Table widgets: w=6 or w=12, h=4. SQL returns tabular data, max 100 rows.
- Insight widgets: w=4 or w=6, h=2. Write insight text directly (no SQL needed).
- Always use DuckDB SQL syntax (supports window functions, CTEs, PIVOT).
- Generate 4-8 diverse widgets that answer the user's prompt comprehensively.
- Make widget ids unique short strings.
- Pack the grid efficiently — fill rows left to right.
${existingContext}
Dataset schema:
${schemaText}`;

  const resp = await callLLMJSON<AIResponse>({ system, user: prompt, settings, schema: SCHEMA });

  const widgets: Widget[] = resp.widgets.map((w) => ({
    ...w,
    id: w.id || generateId(),
    chartType: (w.chartType as Widget["chartType"]) ?? "bar",
    layout: w.layout,
    loading: w.type !== "insight",
  }));

  return { title: resp.dashboardTitle, widgets };
}

export async function executeWidget(widget: Widget): Promise<Widget> {
  if (widget.type === "insight" || !widget.sql) return { ...widget, loading: false };
  try {
    const data: QueryRow[] = await runQuery(widget.sql);
    return { ...widget, data, loading: false, error: undefined };
  } catch (e) {
    return { ...widget, loading: false, error: String(e), data: [] };
  }
}

export async function refineWidget(
  widget: Widget,
  prompt: string,
  schemas: TableSchema[],
  settings: LLMSettings,
): Promise<Widget> {
  const schemaText = schemas.map((s) =>
    `Table: ${s.name}\nColumns: ${s.columns.map((c) => `${c.name} (${c.type})`).join(", ")}`
  ).join("\n\n");

  const system = `You are refining a single dashboard widget based on user instruction. Return ONLY the updated widget JSON.
Current widget: ${JSON.stringify(widget)}
Schema:
${schemaText}`;

  const updated = await callLLMJSON<AIWidget>({
    system, user: prompt, settings,
    schema: SCHEMA.properties.widgets.items,
  });

  const refined: Widget = {
    ...widget,
    ...updated,
    id: widget.id,
    layout: updated.layout ?? widget.layout,
    loading: updated.type !== "insight" && !!updated.sql,
  };

  if (refined.loading && refined.sql) {
    return executeWidget(refined);
  }
  return refined;
}
