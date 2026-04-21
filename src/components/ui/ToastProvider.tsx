import { AnimatePresence, motion } from "framer-motion";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { useDashboardStore } from "@/store/useDashboardStore";
import { cn } from "@/lib/utils";

const icons = {
  success: <CheckCircle size={14} className="text-green-400" />,
  error: <AlertCircle size={14} className="text-red-400" />,
  warning: <AlertTriangle size={14} className="text-amber-400" />,
  info: <Info size={14} className="text-blue-400" />,
};

export function ToastProvider() {
  const { toasts, removeToast } = useDashboardStore();
  return (
    <div className="fixed bottom-24 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 60, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className={cn("glass-bright pointer-events-auto rounded-xl px-3 py-2.5 flex items-start gap-2.5 max-w-xs shadow-xl")}
          >
            <span className="mt-0.5 shrink-0">{icons[t.variant]}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white/90 truncate">{t.title}</p>
              {t.message && <p className="text-[11px] text-white/50 mt-0.5 line-clamp-2">{t.message}</p>}
            </div>
            <button onClick={() => removeToast(t.id)} className="shrink-0 text-white/30 hover:text-white/70 transition-colors">
              <X size={12} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
