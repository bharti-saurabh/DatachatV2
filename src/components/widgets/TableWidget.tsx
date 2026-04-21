import { useState } from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import type { Widget } from "@/types";

export function TableWidget({ widget }: { widget: Widget }) {
  const data = widget.data ?? [];
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 8;

  if (!data.length) return <div className="h-full flex items-center justify-center text-xs text-white/20">No data</div>;

  const cols = Object.keys(data[0]);

  const sorted = sortKey ? [...data].sort((a, b) => {
    const av = a[sortKey], bv = b[sortKey];
    const cmp = String(av ?? "").localeCompare(String(bv ?? ""), undefined, { numeric: true });
    return sortDir === "asc" ? cmp : -cmp;
  }) : data;

  const pages = Math.ceil(sorted.length / PAGE_SIZE);
  const rows = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const toggleSort = (key: string) => {
    if (sortKey === key) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-auto">
        <table className="w-full text-[11px]">
          <thead className="sticky top-0" style={{ background: "rgba(6,6,15,0.9)" }}>
            <tr>
              {cols.map((col) => (
                <th key={col} onClick={() => toggleSort(col)}
                  className="text-left px-2 py-1.5 text-white/40 font-medium uppercase tracking-wider cursor-pointer hover:text-white/60 transition-colors whitespace-nowrap border-b border-white/[0.06]">
                  <div className="flex items-center gap-1">
                    {col}
                    {sortKey === col ? (sortDir === "asc" ? <ChevronUp size={10} /> : <ChevronDown size={10} />) : <ChevronsUpDown size={10} className="opacity-30" />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors">
                {cols.map((col) => (
                  <td key={col} className="px-2 py-1.5 text-white/70 max-w-[140px] truncate">{String(row[col] ?? "")}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pages > 1 && (
        <div className="flex items-center justify-between px-2 py-1.5 border-t border-white/[0.06] shrink-0">
          <span className="text-[10px] text-white/30">Page {page + 1}/{pages} · {data.length} rows</span>
          <div className="flex gap-1">
            <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}
              className="px-1.5 py-0.5 rounded text-[10px] border border-white/10 text-white/40 hover:text-white/70 disabled:opacity-30">‹</button>
            <button onClick={() => setPage((p) => Math.min(pages - 1, p + 1))} disabled={page >= pages - 1}
              className="px-1.5 py-0.5 rounded text-[10px] border border-white/10 text-white/40 hover:text-white/70 disabled:opacity-30">›</button>
          </div>
        </div>
      )}
    </div>
  );
}
