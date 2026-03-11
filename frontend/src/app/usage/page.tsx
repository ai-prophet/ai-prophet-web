"use client";

import { useCallback, useEffect, useState } from "react";
import { useUser } from "@auth0/nextjs-auth0";
import Navbar from "@/components/Navbar";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/+$/, "");

interface CostStatsData {
  model_cost: number;
  search_cost: number;
  total_cost: number;
  planner_cost?: number;
  n_api_calls: number;
  n_searches: number;
  model_name?: string;
  search_backend?: string;
  planner_model?: string;
}

interface UsageRun {
  id: string;
  title: string;
  cost_stats: CostStatsData;
  created_at: number;
}

interface UsageTotals {
  total_cost: number;
  model_cost: number;
  search_cost: number;
  planner_cost: number;
  n_api_calls: number;
  n_searches: number;
  total_runs: number;
}

interface UsageData {
  totals: UsageTotals;
  runs: UsageRun[];
}

interface TraceMessage {
  key: string;
  message: {
    role: string;
    content: unknown;
    extra?: Record<string, unknown>;
  };
}

interface TraceStep {
  input: string[];
  output: string;
}

interface TraceData {
  info?: Record<string, unknown>;
  trajectory?: {
    messages: TraceMessage[];
    steps: TraceStep[];
  };
  sources?: Record<string, unknown>;
}

function formatCost(v: number): string {
  if (v === 0) return "$0.00";
  if (v < 0.01) return `$${v.toFixed(4)}`;
  return `$${v.toFixed(2)}`;
}

function formatModel(name?: string): string {
  if (!name) return "-";
  const parts = name.split("/");
  return parts[parts.length - 1];
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function extractTextContent(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((block) => {
        if (typeof block === "string") return block;
        if (block?.type === "text") return block.text || "";
        if (block?.type === "thinking") return `[thinking] ${block.thinking || ""}`;
        return "";
      })
      .filter(Boolean)
      .join("\n");
  }
  if (content && typeof content === "object") {
    return JSON.stringify(content, null, 2);
  }
  return "";
}

function roleLabel(role: string): string {
  switch (role) {
    case "system": return "System";
    case "user": return "User";
    case "assistant": return "Assistant";
    case "tool": return "Tool";
    default: return role;
  }
}

function roleColor(role: string): string {
  switch (role) {
    case "system": return "text-muted";
    case "user": return "text-accent";
    case "assistant": return "text-primary";
    case "tool": return "text-warning";
    default: return "text-secondary";
  }
}

export default function UsagePage() {
  const { user, isLoading: authLoading } = useUser();
  const [data, setData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedTrace, setExpandedTrace] = useState<string | null>(null);
  const [traceData, setTraceData] = useState<Record<string, TraceData>>({});
  const [traceLoading, setTraceLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.sub) return;
    setLoading(true);
    fetch(`${API_BASE}/api/history/${user.sub}/usage`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [user]);

  const toggleTrace = useCallback(async (entryId: string) => {
    if (expandedTrace === entryId) {
      setExpandedTrace(null);
      return;
    }
    setExpandedTrace(entryId);
    if (traceData[entryId]) return;
    setTraceLoading(entryId);
    try {
      const res = await fetch(`${API_BASE}/api/history/${entryId}/trace`);
      const json = await res.json();
      if (json.trace) {
        setTraceData((prev) => ({ ...prev, [entryId]: json.trace }));
      }
    } catch {}
    setTraceLoading(null);
  }, [expandedTrace, traceData]);

  if (authLoading) {
    return (
      <div className="h-dvh flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-dvh flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-sm text-secondary mb-2">Sign in to view your usage</p>
            <a
              href="/auth/login"
              className="inline-block px-4 py-2 text-sm font-semibold rounded-lg bg-accent text-ground hover:bg-accent-dim transition-colors"
            >
              Login
            </a>
          </div>
        </div>
      </div>
    );
  }

  const totals = data?.totals;
  const runs = data?.runs ?? [];

  return (
    <div className="h-dvh flex flex-col">
      <Navbar />
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <h1 className="text-xl font-bold text-primary mb-6">Usage</h1>

          {loading ? (
            <p className="text-sm text-muted">Loading usage data...</p>
          ) : !totals || totals.total_runs === 0 ? (
            <p className="text-sm text-muted">No usage data yet. Run a forecast to see your costs here.</p>
          ) : (
            <>
              {/* Summary cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                <SummaryCard label="Total Cost" value={formatCost(totals.total_cost)} />
                <SummaryCard label="Total Runs" value={String(totals.total_runs)} />
                <SummaryCard label="API Calls" value={String(totals.n_api_calls)} />
                <SummaryCard label="Searches" value={String(totals.n_searches)} />
              </div>

              {/* Per-run list */}
              <div className="space-y-2">
                {runs.map((run) => {
                  const cs = run.cost_stats;
                  const runTotal = cs.total_cost + (cs.planner_cost || 0);
                  const isExpanded = expandedTrace === run.id;
                  const trace = traceData[run.id];
                  const isLoading = traceLoading === run.id;

                  return (
                    <div key={run.id} className="border border-edge rounded-lg overflow-hidden">
                      {/* Run summary row */}
                      <div className="flex items-center gap-3 px-4 py-3 bg-surface hover:bg-surface-hover transition-colors">
                        <button
                          onClick={() => toggleTrace(run.id)}
                          className="flex-shrink-0 p-0.5 text-muted hover:text-primary transition-colors"
                          aria-label={isExpanded ? "Collapse trace" : "Expand trace"}
                        >
                          <svg className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                          </svg>
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-primary truncate">{run.title}</p>
                          <div className="flex items-center gap-3 mt-0.5 text-xs text-muted">
                            <span>{formatDate(run.created_at)}</span>
                            <span>{formatModel(cs.model_name)}</span>
                            <span className="capitalize">{cs.search_backend || "-"}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-xs flex-shrink-0">
                          <div className="text-right">
                            <span className="text-muted">Model</span>
                            <p className="font-mono text-secondary">{formatCost(cs.model_cost)}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-muted">Search</span>
                            <p className="font-mono text-secondary">{formatCost(cs.search_cost)}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-muted">Total</span>
                            <p className="font-mono font-semibold text-primary">{formatCost(runTotal)}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-muted">Calls</span>
                            <p className="text-secondary">{cs.n_api_calls}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-muted">Searches</span>
                            <p className="text-secondary">{cs.n_searches}</p>
                          </div>
                        </div>
                      </div>

                      {/* Expanded trace */}
                      {isExpanded && (
                        <div className="border-t border-edge bg-ground">
                          {isLoading ? (
                            <div className="px-4 py-6 text-center text-sm text-muted">Loading trace...</div>
                          ) : !trace ? (
                            <div className="px-4 py-6 text-center text-sm text-muted">No trace available for this run.</div>
                          ) : (
                            <TraceViewer trace={trace} />
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function TraceViewer({ trace }: { trace: TraceData }) {
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set());
  const trajectory = trace.trajectory;

  if (!trajectory?.messages?.length) {
    return <div className="px-4 py-6 text-center text-sm text-muted">Trace is empty.</div>;
  }

  // Build a lookup from key to message
  const msgMap = new Map<string, TraceMessage["message"]>();
  for (const entry of trajectory.messages) {
    msgMap.set(entry.key, entry.message);
  }

  const steps = trajectory.steps || [];
  const toggleStep = (idx: number) => {
    setExpandedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  return (
    <div className="divide-y divide-edge">
      {/* System prompt (first message, usually S0) */}
      {trajectory.messages.length > 0 && trajectory.messages[0].message.role === "system" && (
        <details className="group">
          <summary className="px-4 py-2 cursor-pointer text-xs font-semibold text-muted hover:text-secondary transition-colors">
            System Prompt
          </summary>
          <div className="px-4 pb-3">
            <pre className="text-xs text-muted whitespace-pre-wrap font-mono bg-surface rounded-lg p-3 max-h-48 overflow-y-auto custom-scrollbar">
              {extractTextContent(trajectory.messages[0].message.content)}
            </pre>
          </div>
        </details>
      )}

      {/* Steps */}
      {steps.map((step, idx) => {
        const isOpen = expandedSteps.has(idx);
        const outputMsg = msgMap.get(step.output);
        const inputMsgs = step.input.map((k) => ({ key: k, msg: msgMap.get(k) })).filter((m) => m.msg);

        // Get a summary for the step
        const assistantContent = outputMsg ? extractTextContent(outputMsg.content) : "";
        const actions = outputMsg?.extra?.actions as Array<{ name: string }> | undefined;
        const actionNames = actions?.map((a) => a.name).join(", ");
        const preview = actionNames
          ? `Actions: ${actionNames}`
          : assistantContent.slice(0, 120) + (assistantContent.length > 120 ? "..." : "");

        return (
          <div key={idx}>
            <button
              onClick={() => toggleStep(idx)}
              className="w-full flex items-start gap-3 px-4 py-2.5 text-left hover:bg-surface-hover transition-colors"
            >
              <svg className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-muted transition-transform ${isOpen ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-semibold text-accent">Step {idx + 1}</span>
                <p className="text-xs text-muted truncate mt-0.5">{preview}</p>
              </div>
            </button>

            {isOpen && (
              <div className="px-4 pb-3 space-y-2 ml-6">
                {/* Input messages (user / tool results) */}
                {inputMsgs.map(({ key, msg }) => {
                  if (!msg || msg.role === "system") return null;
                  const text = extractTextContent(msg.content);
                  if (!text) return null;
                  return (
                    <div key={key} className="rounded-lg bg-surface p-3">
                      <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${roleColor(msg.role)}`}>
                        {roleLabel(msg.role)} <span className="text-muted font-normal">({key})</span>
                      </p>
                      <pre className="text-xs text-secondary whitespace-pre-wrap font-mono max-h-64 overflow-y-auto custom-scrollbar">
                        {text}
                      </pre>
                    </div>
                  );
                })}

                {/* Output message (assistant) */}
                {outputMsg && (
                  <div className="rounded-lg bg-surface p-3 border-l-2 border-accent/30">
                    <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${roleColor(outputMsg.role)}`}>
                      {roleLabel(outputMsg.role)} <span className="text-muted font-normal">({step.output})</span>
                    </p>
                    <pre className="text-xs text-secondary whitespace-pre-wrap font-mono max-h-64 overflow-y-auto custom-scrollbar">
                      {extractTextContent(outputMsg.content)}
                    </pre>
                    {actions && actions.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {actions.map((a, i) => (
                          <span key={i} className="inline-block px-1.5 py-0.5 text-[10px] font-mono bg-accent/10 text-accent rounded">
                            {(a as Record<string, string>).name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface border border-edge rounded-lg px-4 py-3">
      <p className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-1">{label}</p>
      <p className="text-lg font-bold text-primary">{value}</p>
    </div>
  );
}
