import { useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { PromptBar } from "@/components/layout/PromptBar";
import { BentoGrid } from "@/components/grid/BentoGrid";
import { DataSourceModal } from "@/components/datasource/DataSourceModal";
import { SettingsPanel } from "@/components/ui/SettingsPanel";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { useDashboardStore } from "@/store/useDashboardStore";
import { loadLLMSettings, DEFAULT_LLM_SETTINGS } from "@/lib/persistence";

export default function App() {
  const { setLLMSettings } = useDashboardStore();

  useEffect(() => {
    loadLLMSettings().then((s) => {
      if (!s) return;
      const modelOk = s.model && !/[A-Z\s]/.test(s.model);
      setLLMSettings(modelOk ? s : { ...s, model: DEFAULT_LLM_SETTINGS.model });
    }).catch(console.error);
  }, [setLLMSettings]);

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: "var(--bg-base)" }}>
      {/* Soft ambient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full opacity-30" style={{ background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)" }} />
        <div className="absolute -bottom-40 -right-20 w-[500px] h-[500px] rounded-full opacity-25" style={{ background: "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)" }} />
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] rounded-full opacity-20" style={{ background: "radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)" }} />
      </div>

      <Navbar />

      <div className="flex-1 flex flex-col min-h-0 relative">
        <BentoGrid />
        <PromptBar />
      </div>

      <DataSourceModal />
      <SettingsPanel />
      <ToastProvider />
    </div>
  );
}
