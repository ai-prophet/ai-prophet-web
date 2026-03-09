"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ArenaLayout from "@/components/arena/ArenaLayout";
import { getApiUrl } from "@/config/api";
import { niceName, isModelConfigured } from "@/config/models";

interface EventData {
  event_ticker: string;
  title: string;
  category: string;
  markets: string[];
  close_time: string | null;
  market_outcome: Record<string, number> | null;
  rules: string;
  updated_at: string;
}

interface Prediction {
  market: string;
  probability: string;
}

type PredictionsMap = Record<string, Prediction[]>;

function formatDate(dateString: string | null) {
  if (!dateString) return "No date";
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function parseProbability(p: string): number {
  return parseFloat(p.replace("%", "")) / 100;
}

export default function MarketDetail() {
  const params = useParams();
  const ticker = params.ticker as string;
  const [event, setEvent] = useState<EventData | null>(null);
  const [predictions, setPredictions] = useState<PredictionsMap | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMarket, setSelectedMarket] = useState<string | null>(null);

  useEffect(() => {
    if (!ticker) return;
    setLoading(true);
    setError(null);

    Promise.all([
      fetch(getApiUrl(`/events/${ticker}`)).then((r) => r.json()),
      fetch(getApiUrl(`/events/${ticker}/predictions`)).then((r) => r.json()),
    ])
      .then(([eventRes, predRes]) => {
        if (eventRes.status === "success") {
          setEvent(eventRes.data);
        } else {
          setError("Event not found");
        }
        if (predRes.status === "success") {
          setPredictions(predRes.data);
        }
      })
      .catch(() => setError("Failed to load event"))
      .finally(() => setLoading(false));
  }, [ticker]);

  const closeTime = event?.close_time ? new Date(event.close_time) : null;
  const isClosed = closeTime ? new Date() > closeTime : false;
  const isResolved = event?.market_outcome && Object.keys(event.market_outcome).length > 0;

  // Compute consensus (average across models) for each market
  const consensus = useMemo(() => {
    if (!predictions) return new Map<string, number>();
    const sums = new Map<string, { total: number; count: number }>();
    for (const [model, preds] of Object.entries(predictions)) {
      if (!isModelConfigured(model)) continue;
      for (const p of preds) {
        const prob = parseProbability(p.probability);
        const entry = sums.get(p.market) || { total: 0, count: 0 };
        entry.total += prob;
        entry.count += 1;
        sums.set(p.market, entry);
      }
    }
    const result = new Map<string, number>();
    for (const [market, { total, count }] of sums) {
      result.set(market, total / count);
    }
    return result;
  }, [predictions]);

  // Sorted markets by consensus probability
  const sortedMarkets = useMemo(() => {
    return Array.from(consensus.entries()).sort(([, a], [, b]) => b - a);
  }, [consensus]);

  // Models with predictions for the selected market
  const modelPredictions = useMemo(() => {
    if (!predictions || !selectedMarket) return [];
    const result: { model: string; displayName: string; probability: number }[] = [];
    for (const [model, preds] of Object.entries(predictions)) {
      if (!isModelConfigured(model)) continue;
      const pred = preds.find((p) => p.market === selectedMarket);
      if (pred) {
        result.push({
          model,
          displayName: niceName(model) || model,
          probability: parseProbability(pred.probability),
        });
      }
    }
    return result.sort((a, b) => b.probability - a.probability);
  }, [predictions, selectedMarket]);

  // Winner from outcome
  const winners = useMemo(() => {
    if (!event?.market_outcome) return [];
    return Object.entries(event.market_outcome)
      .filter(([, v]) => v === 1)
      .map(([k]) => k);
  }, [event?.market_outcome]);

  if (loading) {
    return (
      <ArenaLayout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
          <p className="text-danger text-sm mb-4">{error || "Event not found"}</p>
          <Link href="/markets" className="text-accent text-sm hover:underline">
            &larr; Back to Events
          </Link>
        </div>
      </ArenaLayout>
    );
  }

  const maxConsensus = sortedMarkets.length > 0 ? sortedMarkets[0][1] : 1;

  return (
    <ArenaLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Breadcrumb */}
        <Link
          href="/markets"
          className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-secondary transition-colors mb-6"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to Events
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-accent/10 text-accent">
              {event.category}
            </span>
            {isResolved ? (
              <span className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-overlay text-muted">
                Resolved
              </span>
            ) : isClosed ? (
              <span className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-warning/10 text-warning">
                Closed
              </span>
            ) : (
              <span className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-green-500/10 text-green-400">
                Live
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary leading-snug mb-3">
            {event.title}
          </h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
            <span>{isClosed ? "Closed" : "Closes"} {formatDate(event.close_time)}</span>
            <span>Updated {formatDate(event.updated_at)}</span>
            <span className="font-mono text-[11px]">{event.event_ticker}</span>
          </div>
        </div>

        {/* Winner banner */}
        {winners.length > 0 && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-accent/10 border border-accent/20">
            <p className="text-sm text-accent font-medium">
              Result: {winners.join(", ")}
            </p>
          </div>
        )}

        {/* Rules */}
        {event.rules && (
          <div className="mb-8 px-4 py-3 rounded-xl bg-surface border border-edge">
            <p className="text-xs font-medium text-muted uppercase tracking-wider mb-1">Resolution Rules</p>
            <p className="text-sm text-secondary leading-relaxed">{event.rules}</p>
          </div>
        )}

        {/* Market probabilities */}
        {sortedMarkets.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-primary mb-4">
              AI Consensus ({sortedMarkets.length} market{sortedMarkets.length !== 1 ? "s" : ""})
            </h2>
            <div className="space-y-2">
              {sortedMarkets.map(([market, prob]) => {
                const pct = prob * 100;
                const isWinner = winners.includes(market);
                const isSelected = selectedMarket === market;
                return (
                  <button
                    key={market}
                    onClick={() => setSelectedMarket(isSelected ? null : market)}
                    className={`w-full text-left group rounded-xl px-4 py-3 transition-colors ${
                      isSelected
                        ? "bg-accent/10 border border-accent/30"
                        : "bg-surface border border-edge hover:border-accent/20"
                    }`}
                  >
                    <div className="flex items-baseline justify-between mb-1.5">
                      <span className={`text-sm ${isWinner ? "font-semibold text-accent" : "text-primary"}`}>
                        {market}
                        {isWinner && (
                          <span className="ml-2 text-[10px] font-medium text-accent bg-accent/10 px-1.5 py-0.5 rounded-full">
                            Winner
                          </span>
                        )}
                      </span>
                      <span className={`text-sm font-mono tabular-nums ml-3 ${isWinner ? "text-accent font-semibold" : "text-muted"}`}>
                        {pct.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-overlay rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${isWinner ? "bg-accent" : "bg-accent/30"}`}
                        style={{ width: `${Math.max(1, (prob / maxConsensus) * 100)}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Model breakdown for selected market */}
        {selectedMarket && modelPredictions.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-primary mb-1">
              Model Predictions for &ldquo;{selectedMarket}&rdquo;
            </h2>
            <p className="text-xs text-muted mb-4">{modelPredictions.length} models</p>
            <div className="bg-surface border border-edge rounded-xl overflow-hidden">
              <div className="divide-y divide-edge">
                {modelPredictions.map(({ model, displayName, probability }) => (
                  <div key={model} className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-sm text-primary">{displayName}</span>
                    <span className="text-sm font-mono tabular-nums text-accent">
                      {(probability * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* All markets list (if many) */}
        {event.markets.length > 0 && sortedMarkets.length === 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-primary mb-3">
              Markets ({event.markets.length})
            </h2>
            <div className="flex flex-wrap gap-2">
              {event.markets.map((m) => (
                <span
                  key={m}
                  className="px-2.5 py-1 text-xs rounded-lg bg-surface border border-edge text-secondary"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </ArenaLayout>
  );
}
