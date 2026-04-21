import Dexie, { type Table } from "dexie";
import type { LLMSettings, Dashboard } from "@/types";
import { DEFAULT_LLM_SETTINGS } from "@/types";

class AppDB extends Dexie {
  settings!: Table<{ key: string; value: unknown }>;
  dashboards!: Table<Dashboard>;

  constructor() {
    super("datachat_v3");
    this.version(1).stores({
      settings: "key",
      dashboards: "id,updatedAt",
    });
  }
}

export const db = new AppDB();

export async function loadLLMSettings(): Promise<LLMSettings | null> {
  const row = await db.settings.get("llm");
  return row ? (row.value as LLMSettings) : null;
}

export async function saveLLMSettings(s: LLMSettings): Promise<void> {
  await db.settings.put({ key: "llm", value: s });
}

export async function saveDashboard(d: Dashboard): Promise<void> {
  await db.dashboards.put(d);
}

export async function loadDashboards(): Promise<Dashboard[]> {
  return db.dashboards.orderBy("updatedAt").reverse().toArray();
}

export async function deleteDashboard(id: string): Promise<void> {
  await db.dashboards.delete(id);
}

export { DEFAULT_LLM_SETTINGS };
