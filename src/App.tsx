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
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-600/5 blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-purple-600/5 blur-[100px]" />
        <div className="absolute top-2/3 left-1/2 w-64 h-64 rounded-full bg-cyan-600/4 blur-[80px]" />
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
