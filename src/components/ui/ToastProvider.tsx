import { AnimatePresence, motion } from "framer-motion";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { useDashboardStore } from "@/store/useDashboardStore";

const VARIANTS = {
  success: { icon: <CheckCircle size={14} />, color: "#059669", bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.2)" },
  error: { icon: <AlertCircle size={14} />, color: "#dc2626", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.2)" },
  warning: { icon: <AlertTriangle size={14} />, color: "#d97706", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)" },
  info: { icon: <Info size={14} />, color: "#6366f1", bg: "rgba(99,102,241,0.08)", border: "rgba(99,102,241,0.2)" },
};

export function ToastProvider() {
  const { toasts, removeToast } = useDashboardStore();
  return (
    <div className="fixed bottom-24 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => {
          const v = VARIANTS[t.variant];
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 60, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="pointer-events-auto rounded-xl px-3 py-2.5 flex items-start gap-2.5 max-w-xs"
              style={{
                background: "rgba(255,255,255,0.97)",
                border: `1px solid ${v.border}`,
                boxShadow: "0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(99,102,241,0.06)",
                backdropFilter: "blur(12px)",
              }}
            >
              <span className="mt-0.5 shrink-0" style={{ color: v.color }}>{v.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate" style={{ color: "#0d0d1a" }}>{t.title}</p>
                {t.message && <p className="mt-0.5 line-clamp-2" style={{ fontSize: 11, color: "#6b7280" }}>{t.message}</p>}
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="shrink-0 transition-colors"
                style={{ color: "#d1d5db" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#6b7280"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#d1d5db"; }}
              >
                <X size={12} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
