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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  const inputDisabled = isPlanning || isRunning;
  const hasForecastPlans = messages.some((msg) => msg.type === "plan");

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
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-6 space-y-4">
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
                  className="pl-12"
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
            className="pl-12 flex items-center gap-2"
          >
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
            <span className="text-xs text-muted">
              {isPlanning ? "Generating plan..." : "Agent is thinking..."}
            </span>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="flex-shrink-0 border-t border-edge bg-surface px-6 py-4">
        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenSettings}
            className="p-2.5 rounded-xl text-muted hover:text-secondary hover:bg-surface-hover transition-all group"
            aria-label="Settings"
          >
            <svg className="w-5 h-5 group-hover:rotate-45 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={inputDisabled}
            placeholder={inputDisabled ? "Agent is running..." : "Ask anything..."}
            className="flex-1 px-4 py-2.5 bg-overlay border border-edge rounded-xl text-sm text-primary focus:ring-1 focus:ring-accent focus:border-accent outline-none placeholder:text-muted disabled:opacity-40"
          />
          <button
            type="submit"
            disabled={inputDisabled || !input.trim()}
            className="p-2.5 rounded-xl bg-accent text-ground hover:bg-accent-dim transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Send"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
