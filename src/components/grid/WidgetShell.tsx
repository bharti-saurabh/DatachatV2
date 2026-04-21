import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, RefreshCw, MessageSquare, Loader2, AlertCircle, BarChart2, Hash, Table2, Lightbulb } from "lucide-react";
import { useDashboardStore } from "@/store/useDashboardStore";
import { refineWidget } from "@/lib/widgetBuilder";
import { KPIWidget } from "@/components/widgets/KPIWidget";
import { ChartWidget } from "@/components/widgets/ChartWidget";
import { TableWidget } from "@/components/widgets/TableWidget";
import { InsightWidget } from "@/components/widgets/InsightWidget";
import { cn } from "@/lib/utils";
import type { Widget } from "@/types";

const TYPE_ICONS = {
  kpi: <Hash size={11} />,
  chart: <BarChart2 size={11} />,
  table: <Table2 size={11} />,
  insight: <Lightbulb size={11} />,
};

export function WidgetShell({ widget }: { widget: Widget }) {
  const { removeWidget, updateWidget, schemas, llmSettings, addToast } = useDashboardStore();
  const [hovered, setHovered] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [refining, setRefining] = useState(false);

  const handleRefine = async () => {
    if (!chatInput.trim() || refining) return;
    setRefining(true);
    try {
      const updated = await refineWidget(widget, chatInput, schemas, llmSettings);
      updateWidget(widget.id, updated);
      setChatInput("");
      setChatOpen(false);
    } catch (e) {
      addToast({ variant: "error", title: "Refinement failed", message: String(e) });
    } finally {
      setRefining(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 500, damping: 35 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); }}
      className="h-full glass rounded-2xl flex flex-col overflow-hidden glow-blue group relative"
      style={{ transition: "box-shadow 0.3s ease" }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-3 pt-3 pb-2 shrink-0">
        <span className={cn("text-white/30", widget.type === "insight" && "text-amber-400/60")}>{TYPE_ICONS[widget.type]}</span>
        <p className="text-[11px] font-semibold text-white/60 flex-1 truncate">{widget.title}</p>

        {/* Controls */}
        <AnimatePresence>
          {hovered && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex items-center gap-0.5">
              <ToolBtn onClick={() => setChatOpen((v) => !v)} title="Refine with AI" active={chatOpen}>
                <MessageSquare size={11} />
              </ToolBtn>
              <ToolBtn onClick={() => removeWidget(widget.id)} title="Remove" danger>
                <X size={11} />
              </ToolBtn>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 px-3 pb-3">
        {widget.loading ? (
          <div className="h-full flex flex-col items-center justify-center gap-2">
            <div className="shimmer rounded-lg w-full h-8" />
            <div className="shimmer rounded-lg w-3/4 h-4" />
            <div className="shimmer rounded-lg w-1/2 h-4" />
            <Loader2 size={14} className="text-blue-400/40 animate-spin mt-2" />
          </div>
        ) : widget.error ? (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-center p-2">
            <AlertCircle size={16} className="text-red-400/60" />
            <p className="text-[10px] text-red-400/60 font-mono leading-relaxed line-clamp-4">{widget.error}</p>
          </div>
        ) : (
          <>
            {widget.type === "kpi" && <KPIWidget widget={widget} />}
            {widget.type === "chart" && <ChartWidget widget={widget} />}
            {widget.type === "table" && <TableWidget widget={widget} />}
            {widget.type === "insight" && <InsightWidget widget={widget} />}
          </>
        )}
      </div>

      {/* AI Chat Drawer */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
            className="overflow-hidden border-t border-white/[0.06]"
          >
            <div className="p-2 flex gap-2">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleRefine()}
                placeholder="Change this to a line chart…"
                className="flex-1 bg-white/[0.06] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white/80 placeholder:text-white/25 focus:outline-none focus:border-blue-500/40"
                autoFocus
              />
              <button onClick={handleRefine} disabled={!chatInput.trim() || refining}
                className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-30 text-white text-xs transition-colors flex items-center gap-1">
                {refining ? <Loader2 size={10} className="animate-spin" /> : <RefreshCw size={10} />}
                Update
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ToolBtn({ children, onClick, title, active, danger }: {
  children: React.ReactNode; onClick: () => void; title?: string; active?: boolean; danger?: boolean;
}) {
  return (
    <button onClick={onClick} title={title}
      className={cn(
        "w-5 h-5 rounded-md flex items-center justify-center transition-all",
        danger ? "text-white/30 hover:text-red-400 hover:bg-red-400/10" :
          active ? "bg-blue-500/20 text-blue-400" : "text-white/30 hover:text-white/70 hover:bg-white/[0.06]",
      )}>
      {children}
    </button>
  );
}
