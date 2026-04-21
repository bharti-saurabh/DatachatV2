import { useCallback } from "react";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const ReactGridLayout = require("react-grid-layout").default as React.ComponentType<Record<string, unknown>>;
import type { Layout, LayoutItem } from "react-grid-layout";
import React from "react";
import { motion } from "framer-motion";
import { useDashboardStore } from "@/store/useDashboardStore";
import { WidgetShell } from "@/components/grid/WidgetShell";
import { Sparkles, Database } from "lucide-react";

export function BentoGrid() {
  const { widgets, setWidgets, dataReady, isBuilding } = useDashboardStore();

  const layout: LayoutItem[] = widgets.map((w) => ({
    i: w.id, x: w.layout.x, y: w.layout.y, w: w.layout.w, h: w.layout.h,
    minW: w.type === "kpi" ? 2 : 3, minH: w.type === "kpi" ? 2 : 3,
  }));

  const onLayoutChange = useCallback((newLayout: Layout) => {
    setWidgets(widgets.map((w) => {
      const l = (newLayout as LayoutItem[]).find((n) => n.i === w.id);
      if (!l) return w;
      return { ...w, layout: { x: l.x, y: l.y, w: l.w, h: l.h } };
    }));
  }, [widgets, setWidgets]);

  if (!dataReady && !isBuilding) {
    return <EmptyState type="no-data" />;
  }

  if (dataReady && widgets.length === 0 && !isBuilding) {
    return <EmptyState type="no-widgets" />;
  }

  if (isBuilding && widgets.length === 0) {
    return <EmptyState type="building" />;
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 pt-2">
      <ReactGridLayout
        className="layout"
        layout={layout as Layout}
        cols={12}
        rowHeight={80}
        width={window.innerWidth - 32}
        onLayoutChange={onLayoutChange}
        draggableHandle=".drag-handle"
        margin={[12, 12]}
        containerPadding={[0, 0]}
        isResizable
        isDraggable
      >
        {widgets.map((widget) => (
          <div key={widget.id} className="drag-handle cursor-grab active:cursor-grabbing">
            <WidgetShell widget={widget} />
          </div>
        ))}
      </ReactGridLayout>
    </div>
  );
}

function EmptyState({ type }: { type: "no-data" | "no-widgets" | "building" }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-6 px-8 text-center">
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/[0.08] flex items-center justify-center"
      >
        {type === "no-data" ? <Database size={32} className="text-blue-400/60" /> : <Sparkles size={32} className="text-purple-400/60" />}
      </motion.div>

      {type === "no-data" && (
        <>
          <div>
            <h2 className="text-xl font-semibold text-white/80 mb-2">Connect your data</h2>
            <p className="text-sm text-white/35 max-w-sm leading-relaxed">
              Upload a CSV, Excel, JSON, Parquet, or SQLite file — then describe the dashboard you want to build.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {["CSV", "Excel", "JSON", "Parquet", "SQLite"].map((f) => (
              <span key={f} className="text-[11px] px-2.5 py-1 rounded-full border border-white/[0.08] text-white/30">{f}</span>
            ))}
          </div>
        </>
      )}

      {type === "no-widgets" && (
        <div>
          <h2 className="text-xl font-semibold text-white/80 mb-2">Data ready</h2>
          <p className="text-sm text-white/35 max-w-sm leading-relaxed">
            Describe the dashboard you want — the AI will generate KPIs, charts, and tables instantly.
          </p>
        </div>
      )}

      {type === "building" && (
        <div>
          <h2 className="text-xl font-semibold text-white/80 mb-2">Building your dashboard…</h2>
          <p className="text-sm text-white/35">Designing widgets and running queries</p>
          <div className="flex justify-center gap-1.5 mt-4">
            {[0, 1, 2, 3].map((i) => (
              <motion.div key={i} animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ duration: 1.2, delay: i * 0.2, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
