"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ArenaLayout from "@/components/arena/ArenaLayout";
import { getApiUrl } from "@/config/api";
import { niceName, isModelConfigured } from "@/config/models";
import { formatDate } from "@/lib/date-utils";
import { parseProb, heatColor } from "@/lib/color-utils";

/* ── Types ── */
interface MarketEvent {
  event_ticker: string;
  title?: string;
  question?: string;
  topic: string;
  close_time: string | null;
  event_result: string | Record<string, number> | null;
  markets: string;
  options?: string[];
}

interface ModelData {
  predictions: { market: string; probability: string | number }[];
  insights?: { rationale: string; submission_id?: string };
  sources: { id: string; name: string; description: string; url?: string }[];
}

interface ConsolidatedData {
  event: MarketEvent;
  models: Record<string, ModelData>;
}

/* ── Helpers ── */
function getWinners(result: MarketEvent["event_result"]): string[] {
  if (!result) return [];
  try {
    const obj = typeof result === "string" ? JSON.parse(result) : result;
    return Object.entries(obj).filter(([, v]) => v === 1).map(([k]) => k);
  } catch { return []; }
}

/* ── Page ── */
export default function MarketDetail() {
  const params = useParams();
  const ticker = params.ticker as string;
  const [data, setData] = useState<ConsolidatedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [showAllMarkets, setShowAllMarkets] = useState(false);
  const [showAllPredictions, setShowAllPredictions] = useState(false);

  /* Fetch consolidated market data */
  useEffect(() => {
    if (!ticker) return;
    setLoading(true);
    setError(null);
    fetch(getApiUrl(`/events/${ticker}/market-data`))
      .then((r) => r.json())
      .then((res) => {
        if (res.status === "success" && res.data) {
          setData(res.data);
        } else {
          setError("Event not found");
        }
      })
      .catch(() => setError("Failed to load event"))
      .finally(() => setLoading(false));
  }, [ticker]);

  /* Derived data */
  const event = data?.event ?? null;
  const models = data?.models ?? {};

  const llmNames = useMemo(() =>
    Object.keys(models).filter(isModelConfigured),
    [models]
  );

  const allMarkets = useMemo(() => {
    const set = new Set<string>();
    for (const name of llmNames) {
      for (const p of models[name].predictions) if (p.market) set.add(p.market);
    }
    // Sort by max probability across models (descending)
    return Array.from(set).sort((a, b) => {
      const maxA = Math.max(...llmNames.map((n) => {
        const p = models[n].predictions.find((x) => x.market === a);
        return p ? parseProb(p.probability) : -1;
      }));
      const maxB = Math.max(...llmNames.map((n) => {
        const p = models[n].predictions.find((x) => x.market === b);
        return p ? parseProb(p.probability) : -1;
      }));
      return maxB - maxA;
    });
  }, [llmNames, models]);

  const visibleMarkets = showAllMarkets ? allMarkets : allMarkets.slice(0, 5);

  const winners = useMemo(() => getWinners(event?.event_result ?? null), [event?.event_result]);
  const isClosed = event?.close_time ? new Date() > new Date(event.close_time) : false;
  const isResolved = winners.length > 0;

  // Auto-select first model
  useEffect(() => {
    if (llmNames.length > 0 && !selectedModel) {
      setSelectedModel(llmNames[0]);
    }
  }, [llmNames, selectedModel]);

  const currentModelData = selectedModel ? models[selectedModel] : null;
  const sortedPredictions = useMemo(() => {
    if (!currentModelData) return [];
    return [...currentModelData.predictions].sort((a, b) => parseProb(b.probability) - parseProb(a.probability));
  }, [currentModelData]);
  const visiblePredictions = showAllPredictions ? sortedPredictions : sortedPredictions.slice(0, 5);

  /* ── Loading / Error ── */
  if (loading) {
    return (
      <ArenaLayout>
        <div className="max-w-screen-2xl mx-auto px-3 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-3 text-muted">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-sm">Loading event...</span>
          </div>
        </div>
      </ArenaLayout>
    );
  }

  if (error || !event) {
    return (
      <ArenaLayout>
        <div className="max-w-screen-2xl mx-auto px-3 sm:px-6 lg:px-8 py-12">
          <p className="text-danger text-sm mb-4">{error || "Event not found"}</p>
          <Link href="/markets" className="text-accent text-sm hover:underline">&larr; Back to Events</Link>
        </div>
      </ArenaLayout>
    );
  }

  const displayTitle = event.title || event.question || event.event_ticker;

  return (
    <ArenaLayout>
      <div className="max-w-screen-2xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/markets"
            className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-secondary transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Events
          </Link>
          <a
            href={`https://kalshi.com/events/${event.event_ticker}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-accent text-ground hover:bg-accent-dim transition-colors"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            View on Kalshi
          </a>
        </div>

        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="px-2.5 py-0.5 text-[11px] font-medium rounded-full bg-accent/10 text-accent">
              {event.topic}
            </span>
            {isResolved ? (
              <span className="px-2.5 py-0.5 text-[11px] font-medium rounded-full bg-overlay text-muted">Resolved</span>
            ) : isClosed ? (
              <span className="px-2.5 py-0.5 text-[11px] font-medium rounded-full bg-warning/10 text-warning">Closed</span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-medium rounded-full bg-green-500/10 text-green-400">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                Live
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary leading-snug mb-2">{displayTitle}</h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
            <span>{isClosed ? "Closed" : "Closes"} {formatDate(event.close_time)}</span>
            <span className="font-mono text-[11px]">{event.event_ticker}</span>
          </div>
        </div>

        {/* Result banner */}
        {isResolved && (
          <div className="px-4 py-3 rounded-xl bg-accent/10 border border-accent/20">
            <p className="text-xs font-medium text-muted uppercase tracking-wider mb-1">Result</p>
            <p className="text-lg font-bold text-accent">{winners.join(", ")}</p>
          </div>
        )}

        {/* ── Predictions Heat Map ── */}
        {llmNames.length > 0 && allMarkets.length > 0 && (
          <div className="bg-surface rounded-xl border border-edge p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-primary">Predictions</h2>
              {allMarkets.length > 5 && (
                <button
                  onClick={() => setShowAllMarkets(!showAllMarkets)}
                  className="text-xs font-medium text-accent hover:text-accent-dim transition-colors"
                >
                  {showAllMarkets ? `Show Less (5)` : `Show All (${allMarkets.length})`}
                </button>
              )}
            </div>

            {/* Heat map table */}
            <div className="relative border border-edge rounded-lg overflow-hidden">
              <div className="flex">
                {/* Sticky left column — market names */}
                <div className="flex-shrink-0 z-10 bg-surface">
                  <div className="h-14 w-32 sm:w-48 border-b border-r border-edge flex items-center justify-center">
                    <span className="text-xs font-medium text-muted">Markets</span>
                  </div>
                  {visibleMarkets.map((mkt, r) => {
                    const isWinner = winners.some((w) => w.toLowerCase() === mkt.toLowerCase() || mkt.toLowerCase().includes(w.toLowerCase()));
                    return (
                      <div
                        key={mkt}
                        className={`h-14 w-32 sm:w-48 border-r border-edge flex items-center px-2 sm:px-3 bg-surface ${r < visibleMarkets.length - 1 ? "border-b" : ""}`}
                      >
                        <span className="text-xs sm:text-sm font-medium text-primary truncate flex-1" title={mkt}>{mkt}</span>
                        {isWinner && (
                          <svg className="w-3.5 h-3.5 text-green-400 flex-shrink-0 ml-1" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Scrollable model columns */}
                <div className="flex-1 overflow-x-auto">
                  <div
                    className="grid"
                    style={{
                      gridTemplateColumns: `repeat(${llmNames.length}, minmax(100px, 150px))`,
                      gridTemplateRows: `56px repeat(${visibleMarkets.length}, 56px)`,
                    }}
                  >
                    {/* Header row */}
                    {llmNames.map((name, i) => (
                      <div
                        key={name}
                        className={`border-b border-edge ${i < llmNames.length - 1 ? "border-r" : ""} flex items-center justify-center p-1 cursor-pointer hover:bg-surface-hover transition-colors`}
                        onClick={() => setSelectedModel(name)}
                        title={niceName(name) || name}
                      >
                        <span className={`text-[10px] sm:text-xs text-center leading-tight ${selectedModel === name ? "text-accent font-semibold" : "text-secondary"}`}>
                          {niceName(name) || name}
                        </span>
                      </div>
                    ))}

                    {/* Data cells */}
                    {visibleMarkets.map((mkt, r) => (
                      <React.Fragment key={mkt}>
                        {llmNames.map((name, c) => {
                          const prob = parseProb(
                            models[name].predictions.find((p) => p.market === mkt)?.probability
                          );
                          return (
                            <div
                              key={`${mkt}-${name}`}
                              className={`flex items-center justify-center ${heatColor(prob)} ${c < llmNames.length - 1 ? "border-r border-edge" : ""} ${r < visibleMarkets.length - 1 ? "border-b border-edge" : ""}`}
                              title={prob === -1 ? `${mkt} — ${niceName(name) || name}: No data` : `${mkt} — ${niceName(name) || name}: ${(prob * 100).toFixed(1)}%`}
                            >
                              <span className={`text-xs sm:text-sm font-semibold ${prob === -1 ? "text-muted" : "text-primary"}`}>
                                {prob === -1 ? "–" : `${(prob * 100).toFixed(0)}%`}
                              </span>
                            </div>
                          );
                        })}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center flex-wrap gap-3 text-[11px] text-muted mt-4">
              {[
                ["bg-accent/10", "0–20%"],
                ["bg-accent/20", "20–40%"],
                ["bg-accent/30", "40–60%"],
                ["bg-accent/45", "60–80%"],
                ["bg-accent/60", "80–100%"],
                ["bg-overlay", "No Data"],
              ].map(([bg, label]) => (
                <div key={label} className="flex items-center gap-1">
                  <div className={`w-3 h-3 rounded ${bg} border border-edge`} />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Model Insights ── */}
        {llmNames.length > 0 && (
          <div className="bg-surface rounded-xl border border-edge p-4 sm:p-6">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <h2 className="text-lg font-bold text-primary">Model Insights from</h2>
              <select
                value={selectedModel}
                onChange={(e) => { setSelectedModel(e.target.value); setShowAllPredictions(false); }}
                className="px-3 py-1.5 text-sm rounded-lg bg-overlay border border-edge text-primary focus:ring-1 focus:ring-accent outline-none"
              >
                {llmNames.map((n) => (
                  <option key={n} value={n}>{niceName(n) || n}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left: Rationale + Predictions */}
              <div className="lg:col-span-2 space-y-6">
                {/* Rationale */}
                {currentModelData?.insights?.rationale ? (
                  <div>
                    <h3 className="text-sm font-semibold text-primary mb-2">Prediction Rationale</h3>
                    <p className="text-sm text-secondary leading-relaxed whitespace-pre-wrap">
                      {currentModelData.insights.rationale}
                    </p>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-sm font-semibold text-primary mb-2">Model Insights</h3>
                    <p className="text-sm text-muted">No detailed insights available for this model.</p>
                  </div>
                )}

                {/* Predictions list */}
                {sortedPredictions.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-primary mb-2 flex items-center gap-2">
                      Model Predictions
                      {sortedPredictions.length > 5 && (
                        <span className="text-xs text-muted font-normal">({sortedPredictions.length} total)</span>
                      )}
                    </h3>
                    <div className="divide-y divide-edge">
                      {visiblePredictions.map((pred, i) => {
                        const prob = parseProb(pred.probability);
                        return (
                          <div key={i} className="flex items-center justify-between py-2">
                            <span className="text-sm text-primary font-medium">{pred.market}</span>
                            <span className="text-sm font-bold text-accent font-mono tabular-nums">
                              {prob === -1 ? "–" : `${(prob * 100).toFixed(1)}%`}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    {sortedPredictions.length > 5 && (
                      <button
                        onClick={() => setShowAllPredictions(!showAllPredictions)}
                        className="mt-2 w-full text-xs font-medium text-accent hover:text-accent-dim py-2 rounded-lg hover:bg-accent/5 transition-colors"
                      >
                        {showAllPredictions ? "Show Less" : `Show ${sortedPredictions.length - 5} More`}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Right: Sources */}
              <div className="lg:col-span-1">
                {currentModelData?.sources && currentModelData.sources.length > 0 ? (
                  <>
                    <h3 className="text-sm font-semibold text-primary mb-3">
                      Sources Used ({currentModelData.sources.length})
                    </h3>
                    {/* Desktop: vertical scroll */}
                    <div className="hidden lg:block max-h-[500px] overflow-y-auto space-y-3 custom-scrollbar">
                      {currentModelData.sources.map((src) => (
                        <SourceCard key={src.id} source={src} />
                      ))}
                    </div>
                    {/* Mobile: horizontal scroll */}
                    <div className="lg:hidden overflow-x-auto pb-2 -mx-1">
                      <div className="flex gap-3 px-1 min-w-max">
                        {currentModelData.sources.map((src) => (
                          <div key={src.id} className="w-64 flex-shrink-0">
                            <SourceCard source={src} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div>
                    <h3 className="text-sm font-semibold text-primary mb-3">Sources</h3>
                    <p className="text-xs text-muted">No sources available for this model.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </ArenaLayout>
  );
}

/* ── Source Card ── */
function SourceCard({ source }: { source: { id: string; name: string; description: string; url?: string } }) {
  const [expanded, setExpanded] = useState(false);
  let domain = "";
  if (source.url) {
    try { domain = new URL(source.url).hostname.replace("www.", ""); } catch { domain = ""; }
  }
  const long = source.description && source.description.length > 120;
  const desc = long && !expanded ? source.description.slice(0, 120) + "..." : source.description;

  return (
    <div className="bg-overlay rounded-lg p-3 border border-edge">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] text-muted truncate flex-1 mr-2">{domain}</span>
        {source.url && (
          <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-accent hover:text-accent-dim flex-shrink-0">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        )}
      </div>
      <p className="text-xs font-medium text-primary mb-1.5 line-clamp-2 leading-tight">{source.name}</p>
      <p className="text-[11px] text-secondary leading-relaxed">{desc}</p>
      {long && (
        <button onClick={() => setExpanded(!expanded)} className="mt-1.5 text-[11px] font-medium text-accent hover:text-accent-dim">
          {expanded ? "Show Less" : "Show More"}
        </button>
      )}
    </div>
  );
}
