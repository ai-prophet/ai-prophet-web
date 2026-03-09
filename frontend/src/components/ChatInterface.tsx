"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import useAgentStream from "@/hooks/useAgentStream";
import type { SearchGroup, BoardEntry, UserSettings } from "@/types";
import UserMessage from "./UserMessage";
import ForecastPlan from "./ForecastPlan";
import AgentDivider from "./AgentDivider";
import StepMessage from "./StepMessage";
import ForecastResultCard from "./ForecastResultCard";

interface ChatInterfaceProps {
  initialQuery?: string;
  settings: UserSettings;
  onSearchResult: (group: SearchGroup) => void;
  onBoardUpdate: (entries: BoardEntry[]) => void;
  onStepClick: (stepNumber: number) => void;
  onOpenSourceBoardEntry: (boardId: number) => void;
  onRunStart: () => void;
  onOpenSettings: () => void;
  onToggleSettings: () => void;
  settingsOpen: boolean;
  onForecastComplete?: (title: string, submission: Record<string, number>) => void;
  onToggleHistory?: () => void;
  onToggleSidebar?: () => void;
  historyOpen?: boolean;
  sidebarOpen?: boolean;
  onNewForecast?: () => void;
}

export default function ChatInterface({
  initialQuery,
  settings,
  onSearchResult,
  onBoardUpdate,
  onStepClick,
  onOpenSourceBoardEntry,
  onRunStart,
  onOpenSettings,
  onToggleSettings,
  settingsOpen,
  onForecastComplete,
  onToggleHistory,
  onToggleSidebar,
  historyOpen,
  sidebarOpen,
  onNewForecast,
}: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const initialQueryFired = useRef(false);
  const {
    messages,
    isRunning,
    isPlanning,
    plan,
    startRun,
    clearMessages,
    onSearchResult: searchRef,
    onBoardUpdate: boardRef,
  } = useAgentStream();

  useEffect(() => {
    searchRef.current = onSearchResult;
    boardRef.current = onBoardUpdate;
  }, [onSearchResult, onBoardUpdate, searchRef, boardRef]);

  useEffect(() => {
    if (initialQuery && !initialQueryFired.current) {
      initialQueryFired.current = true;
      plan(initialQuery, settings);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const savedResultIdsRef = useRef<Set<string>>(new Set());
  const hydratedResultsRef = useRef(false);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    if (!hydratedResultsRef.current) {
      hydratedResultsRef.current = true;
      for (const m of messages) {
        if (m.type === "result" && m.submission && Object.keys(m.submission).length > 0) {
          savedResultIdsRef.current.add(m.id);
        }
      }
      return;
    }
    const resultMsgs = messages.filter((m) => m.type === "result" && m.submission && Object.keys(m.submission).length > 0);
    for (const msg of resultMsgs) {
      if (savedResultIdsRef.current.has(msg.id)) continue;
      savedResultIdsRef.current.add(msg.id);
      const planMsg = [...messages].reverse().find((m) => m.type === "plan" && m.planTitle);
      if (msg.submission && onForecastComplete) {
        onForecastComplete(planMsg?.planTitle || "Untitled Forecast", msg.submission);
      }
    }
  }, [messages, onForecastComplete]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isPlanning || isRunning) return;
    setInput("");
    plan(text, settings);
  };

  const handleRun = (title: string, outcomes: string[]) => {
    if (isRunning) return;
    onRunStart();
    startRun(title, outcomes, settings);
  };

  const handleNewForecast = () => {
    if (isRunning || isPlanning) return;
    clearMessages();
    savedResultIdsRef.current.clear();
    hydratedResultsRef.current = true;
    onNewForecast?.();
  };

  const inputDisabled = isPlanning || isRunning;
  const hasForecastPlans = messages.some((msg) => msg.type === "plan");
  const hasMessages = messages.length > 0;

  const openLatestForecastEdit = useCallback(() => {
    const buttons = document.querySelectorAll<HTMLButtonElement>(
      "[data-forecast-edit='true']"
    );
    buttons[buttons.length - 1]?.click();
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!event.ctrlKey && !event.metaKey) return;
      const key = event.key.toLowerCase();
      if (key === "k") {
        event.preventDefault();
        onToggleSettings();
      } else if (key === "o" && hasForecastPlans) {
        event.preventDefault();
        openLatestForecastEdit();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [hasForecastPlans, onToggleSettings, openLatestForecastEdit]);

  return (
    <div className="h-full flex flex-col bg-ground">
      {/* ── Toolbar ── */}
      <div className="flex-shrink-0 h-11 border-b border-edge bg-surface/80 backdrop-blur-sm flex items-center justify-between px-3">
        {/* Left */}
        <div className="flex items-center gap-0.5">
          {onToggleHistory && (
            <button
              onClick={onToggleHistory}
              className={`p-1.5 rounded-lg transition-all duration-150 ${
                historyOpen
                  ? "text-accent bg-accent/10"
                  : "text-muted hover:text-secondary hover:bg-surface-hover"
              }`}
              aria-label="Toggle history"
              title="Forecast history"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          )}
          {onToggleHistory && <div className="w-px h-4 bg-edge mx-1" />}
          <button
            onClick={handleNewForecast}
            disabled={isRunning || isPlanning || !hasMessages}
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium text-muted hover:text-secondary hover:bg-surface-hover transition-all duration-150 disabled:opacity-25 disabled:cursor-not-allowed"
            title="New forecast"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span>New</span>
          </button>
        </div>

        {/* Center status */}
        <div className="flex items-center gap-2 text-[11px] text-muted">
          {(isRunning || isPlanning) && (
            <>
              <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <span>{isPlanning ? "Planning..." : "Agent running"}</span>
            </>
          )}
        </div>

        {/* Right */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={onOpenSettings}
            className="p-1.5 rounded-lg text-muted hover:text-secondary hover:bg-surface-hover transition-all duration-150"
            aria-label="Settings"
            title="Settings"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          {onToggleSidebar && (
            <>
              <div className="w-px h-4 bg-edge mx-1" />
              <button
                onClick={onToggleSidebar}
                className={`p-1.5 rounded-lg transition-all duration-150 ${
                  sidebarOpen
                    ? "text-accent bg-accent/10"
                    : "text-muted hover:text-secondary hover:bg-surface-hover"
                }`}
                aria-label="Toggle research panel"
                title="Research panel"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-3xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4">
          {/* Empty state */}
          {!hasMessages && !isPlanning && (
            <div className="flex items-center justify-center pt-32">
              <div className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-accent/8 flex items-center justify-center mx-auto mb-5">
                  <svg className="w-6 h-6 text-accent/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-secondary mb-1">Start a new forecast</p>
                <p className="text-xs text-muted">Ask a question about the future below</p>
              </div>
            </div>
          )}

          {messages.map((msg) => {
            switch (msg.type) {
              case "user":
                return <UserMessage key={msg.id} content={msg.content} />;
              case "plan":
                return (
                  <ForecastPlan
                    key={msg.id}
                    title={msg.planTitle || ""}
                    outcomes={msg.planOutcomes || []}
                    onRun={handleRun}
                    disabled={isRunning}
                  />
                );
              case "divider":
                return <AgentDivider key={msg.id} />;
              case "step":
                return (
                  <StepMessage
                    key={msg.id}
                    message={msg}
                    onStepClick={onStepClick}
                    onAddSourceClick={onOpenSourceBoardEntry}
                  />
                );
              case "think":
                return <StepMessage key={msg.id} message={msg} />;
              case "result":
                return (
                  <ForecastResultCard
                    key={msg.id}
                    submission={msg.submission || {}}
                    exitStatus={msg.exitStatus || "unknown"}
                  />
                );
              case "error":
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="pl-4 sm:pl-12"
                  >
                    <div className="bg-danger/10 border border-danger/20 rounded-lg px-4 py-3 text-sm text-danger">
                      {msg.content}
                    </div>
                  </motion.div>
                );
              default:
                return null;
            }
          })}

          {(isPlanning || isRunning) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="pl-4 sm:pl-12 flex items-center gap-2.5 py-2"
            >
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
              <span className="text-xs text-muted">
                {isPlanning ? "Generating plan..." : "Agent is researching..."}
              </span>
            </motion.div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* ── Input ── */}
      <div className="flex-shrink-0 border-t border-edge bg-surface/80 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-3 sm:px-6 py-3">
          <form onSubmit={handleSubmit} className="relative">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-accent/10 via-accent-primary/10 to-accent/10 rounded-xl blur-sm opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={inputDisabled}
                placeholder={inputDisabled ? "Agent is running..." : "What do you want to forecast?"}
                className="relative w-full px-4 py-3 bg-ground border border-edge rounded-xl text-sm text-primary focus:ring-1 focus:ring-accent/50 focus:border-accent/50 outline-none placeholder:text-muted disabled:opacity-40 pr-12 transition-all duration-200"
              />
              <button
                type="submit"
                disabled={inputDisabled || !input.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-accent text-ground hover:bg-accent-dim transition-all duration-150 disabled:opacity-15 hover:scale-105 active:scale-95"
                aria-label="Send"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
