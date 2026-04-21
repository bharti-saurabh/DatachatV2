import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Eye, EyeOff, Check } from "lucide-react";
import { useDashboardStore } from "@/store/useDashboardStore";
import { saveLLMSettings } from "@/lib/persistence";
import { cn } from "@/lib/utils";
import type { LLMSettings } from "@/types";

const PRESET_MODELS = ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"];

export function SettingsPanel() {
  const { settingsOpen, toggleSettings, llmSettings, setLLMSettings } = useDashboardStore();
  const [draft, setDraft] = useState<LLMSettings>(llmSettings);
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleOpen = () => { setDraft(llmSettings); toggleSettings(); };

  const handleSave = async () => {
    setLLMSettings(draft);
    await saveLLMSettings(draft).catch(() => {});
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <AnimatePresence>
      {settingsOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={handleOpen}
          />
          <motion.div
            initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }}
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-80 glass-bright border-l border-white/10 p-6 flex flex-col gap-5"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white/90">LLM Settings</h2>
              <button onClick={handleOpen} className="text-white/40 hover:text-white/80 transition-colors"><X size={16} /></button>
            </div>

            <div className="space-y-4 flex-1">
              <Field label="API Endpoint">
                <input value={draft.endpoint} onChange={(e) => setDraft({ ...draft, endpoint: e.target.value })}
                  className="input w-full" placeholder="https://api.openai.com/v1" />
              </Field>

              <Field label="Model">
                <input value={draft.model} onChange={(e) => setDraft({ ...draft, model: e.target.value })}
                  className="input w-full" placeholder="gpt-4o-mini" list="model-list" />
                <datalist id="model-list">
                  {PRESET_MODELS.map((m) => <option key={m} value={m} />)}
                </datalist>
              </Field>

              <Field label="API Key">
                <div className="relative">
                  <input
                    type={showKey ? "text" : "password"}
                    value={draft.apiKey}
                    onChange={(e) => setDraft({ ...draft, apiKey: e.target.value })}
                    className="input w-full pr-9"
                    placeholder="sk-..."
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey((v) => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                  >
                    {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </Field>
            </div>

            <button
              onClick={handleSave}
              className={cn("btn-primary w-full flex items-center justify-center gap-2", saved && "bg-green-600")}
            >
              {saved ? <><Check size={14} /> Saved</> : "Save Settings"}
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-semibold uppercase tracking-wider text-white/40">{label}</label>
      {children}
    </div>
  );
}
