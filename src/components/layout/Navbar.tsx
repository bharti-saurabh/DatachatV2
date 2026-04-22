import { Database, Settings, PlusCircle, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { useDashboardStore } from "@/store/useDashboardStore";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { dataReady, schemas, dashboardTitle, widgets, toggleDataSource, toggleSettings, clearDashboard } = useDashboardStore();

  return (
    <header className="h-14 shrink-0 flex items-center px-5 gap-4 border-b bg-white/80 backdrop-blur-xl" style={{ borderColor: "var(--border)" }}>
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
          <Database size={13} className="text-white" />
        </div>
        <span className="text-sm font-bold gradient-text tracking-tight">DataChat</span>
      </div>

      {/* Breadcrumb */}
      {dashboardTitle && (
        <motion.div initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2">
          <span className="text-gray-300">/</span>
          <span className="text-xs font-medium text-gray-500 max-w-[220px] truncate">{dashboardTitle}</span>
          {widgets.length > 0 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: "rgba(99,102,241,0.1)", color: "var(--indigo)" }}>
              {widgets.length} widgets
            </span>
          )}
        </motion.div>
      )}

      <div className="flex-1" />

      {/* Live data pill */}
      {dataReady && schemas.length > 0 && (
        <button onClick={toggleDataSource}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium transition-all hover:opacity-80"
          style={{ background: "rgba(16,185,129,0.08)", color: "#059669", border: "1px solid rgba(16,185,129,0.2)" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          {schemas.map(s => s.name).join(", ").slice(0, 28)}
        </button>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1">
        <NavBtn onClick={toggleDataSource} title="Connect data source">
          <PlusCircle size={15} />
          <span>Data</span>
        </NavBtn>
        {widgets.length > 0 && (
          <NavBtn onClick={clearDashboard} title="Clear dashboard" className="text-red-400 hover:bg-red-50">
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
      className={cn("flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-all text-xs font-medium", className)}>
      {children}
    </button>
  );
}
