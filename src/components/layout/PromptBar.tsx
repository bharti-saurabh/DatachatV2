import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, Loader2, Wand2 } from "lucide-react";
import { useDashboardStore } from "@/store/useDashboardStore";
import { buildDashboard, executeWidget } from "@/lib/widgetBuilder";
import { cn } from "@/lib/utils";

const EXAMPLE_PROMPTS = [
  "Build me an executive overview of this data",
  "Show me the top trends and key metrics",
  "Create a sales performance dashboard",
  "Analyse distributions and outliers",
];

export function PromptBar() {
  const { schemas, llmSettings, isBuilding, setIsBuilding, setWidgets, setDashboardTitle, addToast, dataReady, widgets, updateWidget } = useDashboardStore();
  const [input, setInput] = useState("");
  const [focused, setFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = useCallback(async () => {
    const q = input.trim();
    if (!q || isBuilding || !dataReady) return;
    setInput("");
    setIsBuilding(true);

    try {
      const { title, widgets: newWidgets } = await buildDashboard(q, schemas, llmSettings, widgets);
      setDashboardTitle(title);
      // Add new widgets to existing ones (or replace if first build)
      const finalWidgets = widgets.length === 0 ? newWidgets : [...widgets, ...newWidgets];
      setWidgets(finalWidgets);

      // Execute each widget's SQL in parallel
      const withData = await Promise.all(
        newWidgets.map((w) => executeWidget(w))
      );
      // Update only the new widgets with their data
      withData.forEach((w) => updateWidget(w.id, { data: w.data, loading: false, error: w.error }));
    } catch (e) {
      addToast({ variant: "error", title: "Build failed", message: String(e) });
    } finally {
      setIsBuilding(false);
    }
  }, [input, isBuilding, dataReady, schemas, llmSettings, widgets]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); handleSubmit(); }
  };

  return (
    <div className="shrink-0 px-4 pb-4 pt-2">
      <motion.div
        animate={{ boxShadow: focused ? "0 0 0 1px rgba(59,130,246,0.4), 0 0 40px rgba(59,130,246,0.1)" : "0 0 0 1px rgba(255,255,255,0.08)" }}
        className="rounded-2xl overflow-hidden"
        style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)" }}
      >
        {/* Example prompts */}
        <AnimatePresence>
          {focused && !input && !isBuilding && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              className="px-3 pt-3 flex flex-wrap gap-1.5"
            >
              {EXAMPLE_PROMPTS.map((p) => (
                <button key={p} onClick={() => { setInput(p); textareaRef.current?.focus(); }}
                  className="text-[11px] px-2.5 py-1 rounded-full border border-white/10 text-white/40 hover:text-white/70 hover:border-white/20 transition-all">
                  {p}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-end gap-3 px-4 py-3">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center shrink-0 mb-0.5">
            <Wand2 size={12} className="text-blue-400" />
          </div>

          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            disabled={isBuilding || !dataReady}
            placeholder={!dataReady ? "Connect a data source first…" : "Describe the dashboard you want to build… (⌘+Enter)"}
            rows={1}
            className="flex-1 bg-transparent resize-none text-sm text-white/90 placeholder:text-white/25 focus:outline-none leading-relaxed"
            style={{ maxHeight: 120, overflowY: "auto" }}
          />

          <button
            onClick={handleSubmit}
            disabled={!input.trim() || isBuilding || !dataReady}
            className={cn(
              "shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all mb-0.5",
              input.trim() && !isBuilding && dataReady
                ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/25"
                : "bg-white/[0.06] text-white/20 cursor-not-allowed",
            )}
          >
            {isBuilding ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          </button>
        </div>

        {isBuilding && (
          <div className="px-4 pb-3">
            <div className="flex items-center gap-2 text-[11px] text-blue-400/80">
              <Sparkles size={10} className="animate-pulse" />
              Building your dashboard…
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
