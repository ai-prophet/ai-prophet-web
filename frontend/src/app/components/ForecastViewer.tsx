'use client';

import React from 'react';
import Navbar from "@/components/Navbar";
import ForecastHistory from "@/components/ForecastHistory";
import type { ForecastHistoryEntry } from "@/types";

interface ForecastViewerProps {
  entry: ForecastHistoryEntry;
  user: any;
  historyOpen: boolean;
  setHistoryOpen: (v: boolean) => void;
  forecastHistory: ForecastHistoryEntry[];
  onHistorySelect: (entry: ForecastHistoryEntry) => void;
  onHistoryDelete: (id: string) => void;
  onBack: () => void;
  onLogoDoubleClick: () => void;
}

export default function ForecastViewer({
  entry,
  user,
  historyOpen,
  setHistoryOpen,
  forecastHistory,
  onHistorySelect,
  onHistoryDelete,
  onBack,
  onLogoDoubleClick,
}: ForecastViewerProps) {
  const entries = Object.entries(entry.submission).sort(([, a], [, b]) => b - a);
  const maxProb = entries.length > 0 ? entries[0][1] : 1;

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Navbar onToggleHistory={user ? () => setHistoryOpen(!historyOpen) : undefined} historyOpen={historyOpen} onLogoDoubleClick={onLogoDoubleClick} />
      <div className="flex-1 flex overflow-hidden min-h-0">
        {historyOpen && user && (
          <ForecastHistory history={forecastHistory} onSelect={onHistorySelect} onDelete={onHistoryDelete} onClose={() => setHistoryOpen(false)} />
        )}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <div className="flex-shrink-0 h-11 border-b border-edge bg-surface flex items-center px-3 gap-1">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-muted hover:text-secondary hover:bg-surface-hover transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              <span>Back</span>
            </button>
          </div>

          {/* Forecast detail */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="max-w-xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
              {/* Header */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                  <span className="text-[11px] font-medium text-accent uppercase tracking-wider">Forecast Result</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-primary leading-snug mb-2">{entry.title}</h2>
                <p className="text-xs text-muted">
                  {new Date(entry.timestamp).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              {/* Probability bars */}
              <div className="space-y-3">
                {entries.map(([name, prob], i) => {
                  const pct = prob * 100;
                  const isTop = i === 0;
                  return (
                    <div key={name} className="group">
                      <div className="flex items-baseline justify-between mb-1.5">
                        <span className={`text-sm ${isTop ? "font-semibold text-primary" : "text-secondary"}`}>
                          {name}
                        </span>
                        <span className={`text-sm font-mono tabular-nums ${isTop ? "text-accent font-semibold" : "text-muted"}`}>
                          {pct.toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-2.5 bg-overlay rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full bar-animated ${isTop ? "bg-accent" : "bg-accent/25"}`}
                          style={{ width: `${Math.max(1, (prob / maxProb) * 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Summary */}
              <div className="mt-8 pt-6 border-t border-edge">
                <div className="flex items-center justify-between text-xs text-muted">
                  <span>{entries.length} outcome{entries.length !== 1 ? "s" : ""}</span>
                  <span>Total: {(entries.reduce((s, [, p]) => s + p, 0) * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
