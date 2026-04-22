import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Eye, EyeOff, Check, Settings } from "lucide-react";
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
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            style={{ background: "rgba(13,13,26,0.35)", backdropFilter: "blur(4px)" }}
            onClick={handleOpen}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }}
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-80 flex flex-col"
            style={{
              background: "rgba(255,255,255,0.98)",
              borderLeft: "1px solid var(--border)",
              boxShadow: "-8px 0 40px rgba(99,102,241,0.08)",
            }}
          >
            {/* Header */}
            <div className="px-6 py-5 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.10))", border: "1px solid rgba(99,102,241,0.15)" }}>
                  <Settings size={14} style={{ color: "var(--indigo)" }} />
                </div>
                <h2 className="text-sm font-semibold" style={{ color: "var(--text-1)" }}>LLM Settings</h2>
              </div>
              <button onClick={handleOpen} className="transition-colors" style={{ color: "var(--text-3)" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--text-1)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--text-3)"; }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Fields */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              <Field label="API Endpoint">
                <input
                  value={draft.endpoint}
                  onChange={(e) => setDraft({ ...draft, endpoint: e.target.value })}
                  className="input w-full"
                  placeholder="https://api.openai.com/v1"
                />
              </Field>

              <Field label="Model">
                <input
                  value={draft.model}
                  onChange={(e) => setDraft({ ...draft, model: e.target.value })}
                  className="input w-full"
                  placeholder="gpt-4o-mini"
                  list="model-list"
                />
                <datalist id="model-list">
                  {PRESET_MODELS.map((m) => <option key={m} value={m} />)}
                </datalist>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {PRESET_MODELS.map((m) => (
                    <button
                      key={m}
                      onClick={() => setDraft({ ...draft, model: m })}
                      className="text-[10px] px-2 py-0.5 rounded-full border transition-all"
                      style={{
                        borderColor: draft.model === m ? "var(--indigo)" : "var(--border)",
                        background: draft.model === m ? "rgba(99,102,241,0.08)" : "transparent",
                        color: draft.model === m ? "var(--indigo)" : "var(--text-3)",
                        fontWeight: draft.model === m ? 600 : 400,
                      }}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="API Key">
                <div className="relative">
                  <input
                    type={showKey ? "text" : "password"}
                    value={draft.apiKey}
                    onChange={(e) => setDraft({ ...draft, apiKey: e.target.value })}
                    className="input w-full"
                    style={{ paddingRight: "2.25rem" }}
                    placeholder="sk-..."
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey((v) => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: "var(--text-3)" }}
                  >
                    {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <p className="mt-1" style={{ fontSize: 10, color: "var(--text-3)" }}>
                  Stored locally in your browser only.
                </p>
              </Field>
            </div>

            {/* Save */}
            <div className="px-6 py-5" style={{ borderTop: "1px solid var(--border)" }}>
              <button
                onClick={handleSave}
                className={cn("btn-primary w-full flex items-center justify-center gap-2")}
                style={saved ? { background: "#059669" } : {}}
              >
                {saved ? <><Check size={14} /> Saved!</> : "Save Settings"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="label">{label}</label>
      {children}
    </div>
  );
}
