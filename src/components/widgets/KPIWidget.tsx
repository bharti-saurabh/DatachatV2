import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import type { Widget } from "@/types";

export function KPIWidget({ widget }: { widget: Widget }) {
  const row = widget.data?.[0];
  const value = row ? Object.values(row).find((v) => v !== null && v !== undefined) : null;
  const label = (row as Record<string, unknown> | undefined)?.label as string | undefined;
  const unit = (row as Record<string, unknown> | undefined)?.unit as string | undefined;
  const delta = (row as Record<string, unknown> | undefined)?.delta as number | undefined;

  const deltaPositive = delta !== undefined && delta > 0;
  const deltaNegative = delta !== undefined && delta < 0;

  return (
    <div className="h-full flex flex-col justify-between p-1">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30">{label ?? widget.title}</p>
      <div className="flex items-end gap-2 flex-wrap">
        <motion.span
          key={String(value)}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-white/90 leading-none tabular-nums"
        >
          {value !== null && value !== undefined ? formatNumber(value) : "—"}
        </motion.span>
        {unit && <span className="text-sm text-white/30 mb-0.5">{unit}</span>}
      </div>
      {delta !== undefined && (
        <div className={`flex items-center gap-1 text-[11px] font-medium ${deltaPositive ? "text-green-400" : deltaNegative ? "text-red-400" : "text-white/40"}`}>
          {deltaPositive ? <TrendingUp size={11} /> : deltaNegative ? <TrendingDown size={11} /> : <Minus size={11} />}
          {delta > 0 ? "+" : ""}{formatNumber(delta)}%
        </div>
      )}
    </div>
  );
}
