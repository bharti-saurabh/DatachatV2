import { Database, Settings, PlusCircle, LayoutDashboard, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { useDashboardStore } from "@/store/useDashboardStore";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { dataReady, schemas, dashboardTitle, widgets, toggleDataSource, toggleSettings, clearDashboard } = useDashboardStore();

  return (
    <header className="h-12 shrink-0 flex items-center px-4 gap-3 border-b border-white/[0.06]" style={{ background: "rgba(6,6,15,0.8)", backdropFilter: "blur(20px)" }}>
      {/* Logo */}
      <div className="flex items-center gap-2 mr-2">
        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <Database size={12} className="text-white" />
        </div>
        <span className="text-sm font-semibold gradient-text">DataChat</span>
        <span className="text-[10px] text-white/20 font-mono">v2</span>
      </div>

      {/* Breadcrumb */}
      {dashboardTitle && (
        <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2">
          <span className="text-white/20">/</span>
          <span className="text-xs text-white/60 max-w-[200px] truncate">{dashboardTitle}</span>
          {widgets.length > 0 && (
            <span className="text-[10px] text-white/30 bg-white/[0.06] rounded px-1.5 py-0.5">{widgets.length} widgets</span>
          )}
        </motion.div>
      )}

      <div className="flex-1" />

      {/* Schema pill */}
      {dataReady && schemas.length > 0 && (
        <button onClick={toggleDataSource}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-green-500/10 border border-green-500/20 text-[11px] text-green-400 hover:bg-green-500/15 transition-colors">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          {schemas.map((s) => s.name).join(", ").slice(0, 30)}
          {schemas.map((s) => s.name).join(", ").length > 30 && "…"}
        </button>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1">
        <NavBtn onClick={toggleDataSource} title="Connect data source">
          <PlusCircle size={15} />
          <span className="text-xs">Data</span>
        </NavBtn>

        {widgets.length > 0 && (
          <NavBtn onClick={clearDashboard} title="Clear dashboard" className="text-red-400/60 hover:text-red-400">
            <Trash2 size={15} />
          </NavBtn>
        )}

        <NavBtn onClick={toggleSettings} title="Settings">
          <Settings size={15} />
        </NavBtn>
      </div>
    </header>
  );
}

function NavBtn({ children, onClick, title, className }: {
  children: React.ReactNode; onClick: () => void; title?: string; className?: string;
}) {
  return (
    <button onClick={onClick} title={title}
      className={cn("flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-white/50 hover:text-white/80 hover:bg-white/[0.06] transition-all text-xs", className)}>
      {children}
    </button>
  );
}

// Suppress unused import warning
const _LayoutDashboard = LayoutDashboard;
void _LayoutDashboard;
