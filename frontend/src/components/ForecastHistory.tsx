"use client";

import type { ForecastHistoryEntry } from "@/types";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
).replace(/\/+$/, "");

export async function fetchHistory(
  userId: string
): Promise<ForecastHistoryEntry[]> {
  try {
    const res = await fetch(`${API_BASE}/api/history/${userId}`);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function deleteFromHistory(entryId: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/history/${entryId}`, {
      method: "DELETE",
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function saveToHistory(
  userId: string,
  title: string,
  submission: Record<string, number>
): Promise<{ id: string; timestamp: number } | null> {
  try {
    const res = await fetch(`${API_BASE}/api/history`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, title, submission }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

interface ForecastHistoryProps {
  history: ForecastHistoryEntry[];
  onSelect: (entry: ForecastHistoryEntry) => void;
  onDelete?: (entryId: string) => void;
  onClose?: () => void;
}

export default function ForecastHistory({
  history,
  onSelect,
  onDelete,
  onClose,
}: ForecastHistoryProps) {
  return (
    <>
    {/* Mobile backdrop */}
    {onClose && (
      <div className="fixed inset-0 z-30 bg-black/40 sm:hidden" onClick={onClose} />
    )}
    <div className="fixed inset-y-0 left-0 z-40 w-72 sm:relative sm:inset-auto sm:w-64 flex-shrink-0 border-r border-edge bg-surface flex flex-col">
      {/* Header */}
      <div className="px-4 h-11 border-b border-edge flex items-center justify-between flex-shrink-0">
        <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">
          History
        </span>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-md text-muted hover:text-primary hover:bg-surface-hover transition-colors"
            aria-label="Close history"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {history.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <div className="w-10 h-10 rounded-xl bg-overlay flex items-center justify-center mx-auto mb-3">
              <svg className="w-5 h-5 text-muted/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-xs font-medium text-muted">No forecasts yet</p>
            <p className="text-[10px] text-muted/60 mt-1">Completed forecasts appear here</p>
          </div>
        ) : (
          <div className="p-1.5 space-y-px">
            {history.map((entry) => {
              const topOutcome = Object.entries(entry.submission).sort(
                ([, a], [, b]) => b - a
              )[0];
              return (
                <div
                  key={entry.id}
                  className="relative rounded-lg hover:bg-surface-hover transition-colors group"
                >
                  <button
                    onClick={() => onSelect(entry)}
                    className="w-full text-left px-3 py-2.5 pr-7"
                  >
                    <p className="text-[13px] text-primary truncate leading-snug group-hover:text-accent transition-colors">
                      {entry.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {topOutcome && (
                        <span className="text-[11px] text-accent/80 font-mono">
                          {topOutcome[0].length > 18 ? topOutcome[0].slice(0, 18) + "..." : topOutcome[0]}: {(topOutcome[1] * 100).toFixed(0)}%
                        </span>
                      )}
                      <span className="text-[10px] text-muted ml-auto">
                        {timeAgo(entry.timestamp)}
                      </span>
                    </div>
                  </button>
                  {onDelete && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onDelete(entry.id); }}
                      className="absolute right-1.5 top-2 p-1 rounded-md text-muted opacity-0 group-hover:opacity-100 hover:text-danger hover:bg-danger/10 transition-all"
                      aria-label="Delete forecast"
                      title="Delete"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
    </>
  );
}
