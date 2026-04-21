import { Lightbulb } from "lucide-react";
import type { Widget } from "@/types";

export function InsightWidget({ widget }: { widget: Widget }) {
  return (
    <div className="h-full flex gap-3 p-1">
      <div className="w-7 h-7 rounded-lg bg-amber-500/15 flex items-center justify-center shrink-0 mt-0.5">
        <Lightbulb size={13} className="text-amber-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-400/60 mb-1.5">Insight</p>
        <p className="text-xs text-white/70 leading-relaxed">{widget.insight ?? "No insight generated."}</p>
      </div>
    </div>
  );
}
