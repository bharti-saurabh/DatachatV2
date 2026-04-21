import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Link2, ClipboardPaste, FileText, Database, CheckCircle } from "lucide-react";
import { useDashboardStore } from "@/store/useDashboardStore";
import { loadFile, loadURL, pasteData } from "@/lib/db";
import { cn } from "@/lib/utils";

type Tab = "upload" | "url" | "paste";

export function DataSourceModal() {
  const { dataSourceOpen, toggleDataSource, setSchemas, setDataReady, addToast } = useDashboardStore();
  const [tab, setTab] = useState<Tab>("upload");
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState("");
  const [urlName, setUrlName] = useState("");
  const [pasteText, setPasteText] = useState("");
  const [loaded, setLoaded] = useState(false);

  const processFile = async (file: File) => {
    setLoading(true);
    try {
      const schemas = await loadFile(file);
      setSchemas(schemas);
      setDataReady(true);
      setLoaded(true);
      addToast({ variant: "success", title: `Loaded ${file.name}`, message: `${schemas.length} table(s) ready` });
      setTimeout(() => { setLoaded(false); toggleDataSource(); }, 800);
    } catch (e) {
      addToast({ variant: "error", title: "Failed to load file", message: String(e) });
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, []);

  const handleURL = async () => {
    if (!url) return;
    setLoading(true);
    try {
      const schemas = await loadURL(url, urlName || "data");
      setSchemas(schemas);
      setDataReady(true);
      setLoaded(true);
      addToast({ variant: "success", title: "Data loaded from URL" });
      setTimeout(() => { setLoaded(false); toggleDataSource(); }, 800);
    } catch (e) {
      addToast({ variant: "error", title: "Failed to load URL", message: String(e) });
    } finally {
      setLoading(false);
    }
  };

  const handlePaste = async () => {
    if (!pasteText.trim()) return;
    setLoading(true);
    try {
      const schemas = await pasteData(pasteText, "pasted_data");
      setSchemas(schemas);
      setDataReady(true);
      setLoaded(true);
      addToast({ variant: "success", title: "Pasted data loaded" });
      setTimeout(() => { setLoaded(false); toggleDataSource(); }, 800);
    } catch (e) {
      addToast({ variant: "error", title: "Failed to parse pasted data", message: String(e) });
    } finally {
      setLoading(false);
    }
  };

  const TABS: { id: Tab; icon: React.ReactNode; label: string }[] = [
    { id: "upload", icon: <Upload size={14} />, label: "Upload File" },
    { id: "url", icon: <Link2 size={14} />, label: "From URL" },
    { id: "paste", icon: <ClipboardPaste size={14} />, label: "Paste Data" },
  ];

  const FILE_TYPES = ["CSV", "TSV", "Excel", "JSON", "Parquet", "SQLite"];

  return (
    <AnimatePresence>
      {dataSourceOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" onClick={toggleDataSource} />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md glass-bright rounded-2xl p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Database size={15} className="text-blue-400" />
                </div>
                <h2 className="text-sm font-semibold text-white/90">Connect Data Source</h2>
              </div>
              <button onClick={toggleDataSource} className="text-white/30 hover:text-white/70 transition-colors"><X size={16} /></button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-5 p-1 rounded-lg bg-white/[0.04]">
              {TABS.map((t) => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={cn("flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-all",
                    tab === t.id ? "bg-blue-600 text-white" : "text-white/50 hover:text-white/70")}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>

            {tab === "upload" && (
              <div>
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById("file-input")?.click()}
                  className={cn(
                    "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
                    dragging ? "border-blue-500 bg-blue-500/10" : "border-white/10 hover:border-white/20 hover:bg-white/[0.02]",
                    loaded && "border-green-500 bg-green-500/10",
                  )}
                >
                  {loaded ? (
                    <div className="flex flex-col items-center gap-2">
                      <CheckCircle size={32} className="text-green-400" />
                      <p className="text-sm text-green-400 font-medium">Data loaded!</p>
                    </div>
                  ) : loading ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      <p className="text-sm text-white/50">Processing…</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-white/[0.06] flex items-center justify-center">
                        <FileText size={22} className="text-white/40" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white/70">Drop file here or click to browse</p>
                        <p className="text-xs text-white/30 mt-1">{FILE_TYPES.join(" · ")}</p>
                      </div>
                    </div>
                  )}
                  <input id="file-input" type="file" className="hidden"
                    accept=".csv,.tsv,.txt,.xlsx,.xls,.json,.parquet,.db,.sqlite,.sqlite3"
                    onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])} />
                </div>
              </div>
            )}

            {tab === "url" && (
              <div className="space-y-3">
                <div>
                  <label className="label">Data URL</label>
                  <input value={url} onChange={(e) => setUrl(e.target.value)}
                    className="input w-full" placeholder="https://example.com/data.csv" />
                  <p className="text-[10px] text-white/30 mt-1">Supports CSV, JSON, Parquet URLs</p>
                </div>
                <div>
                  <label className="label">Table Name</label>
                  <input value={urlName} onChange={(e) => setUrlName(e.target.value)}
                    className="input w-full" placeholder="my_data" />
                </div>
                <button onClick={handleURL} disabled={!url || loading} className="btn-primary w-full">
                  {loading ? "Loading…" : "Load Data"}
                </button>
              </div>
            )}

            {tab === "paste" && (
              <div className="space-y-3">
                <div>
                  <label className="label">Paste CSV / TSV data</label>
                  <textarea value={pasteText} onChange={(e) => setPasteText(e.target.value)}
                    rows={7} className="input w-full resize-none font-mono text-[11px]"
                    placeholder={"name,value,category\nAlpha,42,A\nBeta,87,B"} />
                </div>
                <button onClick={handlePaste} disabled={!pasteText.trim() || loading} className="btn-primary w-full">
                  {loading ? "Parsing…" : "Load Data"}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
