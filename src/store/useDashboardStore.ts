import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { Widget, TableSchema, LLMSettings, Toast, Dashboard } from "@/types";
import { DEFAULT_LLM_SETTINGS } from "@/types";
import { generateId } from "@/lib/utils";

interface State {
  // Data
  schemas: TableSchema[];
  dataReady: boolean;
  // Dashboard
  widgets: Widget[];
  dashboardTitle: string;
  isBuilding: boolean;
  // Settings
  llmSettings: LLMSettings;
  settingsOpen: boolean;
  // Data source modal
  dataSourceOpen: boolean;
  // Saved dashboards
  savedDashboards: Dashboard[];
  // Toasts
  toasts: Toast[];
  // Widget edit
  editingWidgetId: string | null;
}

interface Actions {
  setSchemas: (s: TableSchema[]) => void;
  setDataReady: (v: boolean) => void;
  setWidgets: (w: Widget[]) => void;
  updateWidget: (id: string, patch: Partial<Widget>) => void;
  removeWidget: (id: string) => void;
  setDashboardTitle: (t: string) => void;
  setIsBuilding: (v: boolean) => void;
  setLLMSettings: (s: LLMSettings) => void;
  toggleSettings: () => void;
  toggleDataSource: () => void;
  setSavedDashboards: (d: Dashboard[]) => void;
  addToast: (t: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
  setEditingWidget: (id: string | null) => void;
  clearDashboard: () => void;
}

export const useDashboardStore = create<State & Actions>()(
  immer((set) => ({
    schemas: [],
    dataReady: false,
    widgets: [],
    dashboardTitle: "",
    isBuilding: false,
    llmSettings: DEFAULT_LLM_SETTINGS,
    settingsOpen: false,
    dataSourceOpen: false,
    savedDashboards: [],
    toasts: [],
    editingWidgetId: null,

    setSchemas: (s) => set((st) => { st.schemas = s; }),
    setDataReady: (v) => set((st) => { st.dataReady = v; }),
    setWidgets: (w) => set((st) => { st.widgets = w; }),
    updateWidget: (id, patch) => set((st) => {
      const idx = st.widgets.findIndex((w) => w.id === id);
      if (idx !== -1) Object.assign(st.widgets[idx], patch);
    }),
    removeWidget: (id) => set((st) => { st.widgets = st.widgets.filter((w) => w.id !== id); }),
    setDashboardTitle: (t) => set((st) => { st.dashboardTitle = t; }),
    setIsBuilding: (v) => set((st) => { st.isBuilding = v; }),
    setLLMSettings: (s) => set((st) => { st.llmSettings = s; }),
    toggleSettings: () => set((st) => { st.settingsOpen = !st.settingsOpen; }),
    toggleDataSource: () => set((st) => { st.dataSourceOpen = !st.dataSourceOpen; }),
    setSavedDashboards: (d) => set((st) => { st.savedDashboards = d; }),
    addToast: (t) => set((st) => {
      const id = generateId();
      st.toasts.push({ ...t, id });
      setTimeout(() => set((s) => { s.toasts = s.toasts.filter((x) => x.id !== id); }), 4000);
    }),
    removeToast: (id) => set((st) => { st.toasts = st.toasts.filter((t) => t.id !== id); }),
    setEditingWidget: (id) => set((st) => { st.editingWidgetId = id; }),
    clearDashboard: () => set((st) => { st.widgets = []; st.dashboardTitle = ""; }),
  }))
);
