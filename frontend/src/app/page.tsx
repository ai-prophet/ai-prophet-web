"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useUser } from "@auth0/nextjs-auth0";
import ChatInterface from "@/components/ChatInterface";
import Sidebar from "@/components/Sidebar";
import SettingsModal from "@/components/SettingsModal";
import Navbar from "@/components/Navbar";
import type { SearchGroup, BoardEntry, UserSettings, ForecastHistoryEntry } from "@/types";
import { DEFAULT_SETTINGS } from "@/types";
import { getApiUrl } from "@/config/api";
import ForecastHistory, { fetchHistory, saveToHistory, deleteFromHistory } from "@/components/ForecastHistory";

const SETTINGS_KEY = "prophet_settings";
const SESSION_KEY = "prophet_session";
const DEFAULT_SIDEBAR_WIDTH = 380;
const MIN_SIDEBAR_WIDTH = 320;
const MAX_SIDEBAR_WIDTH = 720;
const MIN_MAIN_WIDTH = 520;

interface SessionState {
  started: boolean;
  searchGroups: SearchGroup[];
  boardEntries: BoardEntry[];
  activeTab: "board" | "searches";
}

function loadSettings(): UserSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT_SETTINGS;
}

function saveSettings(s: UserSettings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  } catch {}
}

function loadSession(): SessionState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function saveSession(s: SessionState) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
  } catch {}
}

export default function Home() {
  const { user } = useUser();
  const [started, setStarted] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [initialQuery, setInitialQuery] = useState("");
  const [heroInput, setHeroInput] = useState("");
  const [searchGroups, setSearchGroups] = useState<SearchGroup[]>([]);
  const [boardEntries, setBoardEntries] = useState<BoardEntry[]>([]);
  const [activeTab, setActiveTab] = useState<"board" | "searches">("board");
  const [highlightStep, setHighlightStep] = useState<number | null>(null);
  const [highlightBoardId, setHighlightBoardId] = useState<number | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_SIDEBAR_WIDTH);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [forecastHistory, setForecastHistory] = useState<ForecastHistoryEntry[]>([]);
  const [viewingEntry, setViewingEntry] = useState<ForecastHistoryEntry | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const layoutRef = useRef<HTMLDivElement>(null);
  const resizingRef = useRef(false);

  useEffect(() => {
    setSettings(loadSettings());
    const session = loadSession();
    if (session) {
      setStarted(session.started);
      setSearchGroups(session.searchGroups);
      setBoardEntries(session.boardEntries);
      setActiveTab(session.activeTab);
    }
    setSessionLoaded(true);
  }, []);

  useEffect(() => {
    if (!user?.sub) return;
    fetchHistory(user.sub as string).then(setForecastHistory);
  }, [user]);

  useEffect(() => {
    if (!sessionLoaded) return;
    saveSession({ started, searchGroups, boardEntries, activeTab });
  }, [started, searchGroups, boardEntries, activeTab]);

  const handleSettingsSave = useCallback((s: UserSettings) => {
    setSettings(s);
    saveSettings(s);
  }, []);

  const handleSearchResult = useCallback((group: SearchGroup) => {
    setSearchGroups((prev) => [...prev, group]);
  }, []);

  const handleBoardUpdate = useCallback((entries: BoardEntry[]) => {
    setBoardEntries(entries);
  }, []);

  const handleStepClick = useCallback((stepNumber: number) => {
    setActiveTab("searches");
    setHighlightBoardId(null);
    setHighlightStep(stepNumber);
    setSidebarOpen(true);
  }, []);

  const handleOpenSourceBoardEntry = useCallback((boardId: number) => {
    setActiveTab("board");
    setHighlightStep(null);
    setHighlightBoardId(boardId);
    setSidebarOpen(true);
  }, []);

  const handleRunStart = useCallback(() => {
    setSearchGroups([]);
    setBoardEntries([]);
    setHighlightStep(null);
    setHighlightBoardId(null);
    setActiveTab("board");
  }, []);

  const handleToggleSettings = useCallback(() => {
    setSettingsOpen((prev) => !prev);
  }, []);

  const handleForecastComplete = useCallback(async (title: string, submission: Record<string, number>) => {
    if (!user?.sub) return;
    const result = await saveToHistory(user.sub as string, title, submission);
    if (result) {
      const entry: ForecastHistoryEntry = {
        id: result.id,
        title,
        submission,
        timestamp: result.timestamp,
      };
      setForecastHistory((prev) => [entry, ...prev]);
    }
  }, [user]);

  const handleHistorySelect = useCallback((entry: ForecastHistoryEntry) => {
    setViewingEntry(entry);
  }, []);

  const handleHistoryDelete = useCallback(async (entryId: string) => {
    const ok = await deleteFromHistory(entryId);
    if (ok) {
      setForecastHistory((prev) => prev.filter((e) => e.id !== entryId));
      if (viewingEntry?.id === entryId) setViewingEntry(null);
    }
  }, [viewingEntry]);

  const handleTabChange = useCallback((tab: "board" | "searches") => {
    setActiveTab(tab);
    if (tab === "board") {
      setHighlightStep(null);
    } else {
      setHighlightBoardId(null);
    }
  }, []);

  const handleNewForecast = useCallback(() => {
    setStarted(false);
    setInitialQuery("");
    setHeroInput("");
    setSearchGroups([]);
    setBoardEntries([]);
    setHighlightStep(null);
    setHighlightBoardId(null);
    setActiveTab("board");
    setViewingEntry(null);
    try { sessionStorage.removeItem(SESSION_KEY); } catch {}
  }, []);

  const updateSidebarWidth = useCallback((clientX: number) => {
    const layout = layoutRef.current;
    if (!layout) return;
    const rect = layout.getBoundingClientRect();
    const maxAllowed = Math.min(MAX_SIDEBAR_WIDTH, rect.width - MIN_MAIN_WIDTH);
    const minAllowed = Math.min(MIN_SIDEBAR_WIDTH, maxAllowed);
    const nextWidth = rect.right - clientX;
    const clamped = Math.max(minAllowed, Math.min(maxAllowed, nextWidth));
    setSidebarWidth(clamped);
  }, []);

  const handleResizeStart = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    resizingRef.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, []);

  useEffect(() => {
    const onMouseMove = (event: MouseEvent) => {
      if (!resizingRef.current) return;
      updateSidebarWidth(event.clientX);
    };
    const onMouseUp = () => {
      if (!resizingRef.current) return;
      resizingRef.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [updateSidebarWidth]);

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const poolRef = useRef<string[]>([]);
  const poolIndexRef = useRef(4);

  useEffect(() => {
    const SKIP = /announcers?\s+say|what will .+ say|highest temp|will it rain|^\w+ at \w+$/i;
    async function fetchSuggestions() {
      try {
        const res = await fetch(getApiUrl("/events?resolved_type=unresolved&limit=200"));
        const json = await res.json();
        const now = new Date().toISOString();
        interface EventItem {
          title: string;
          close_time?: string;
          market_outcome?: Record<string, number> | null;
        }
        const events: EventItem[] = json.data ?? [];
        const good = events
          .filter((e) => {
            if (e.market_outcome && Object.keys(e.market_outcome).length > 0) return false;
            if (e.close_time && e.close_time < now) return false;
            return true;
          })
          .map((e) => e.title)
          .filter((t) => !SKIP.test(t) && t.length > 20 && t.endsWith("?"));
        for (let i = good.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [good[i], good[j]] = [good[j], good[i]];
        }
        poolRef.current = good;
        poolIndexRef.current = 4;
        setSuggestions(good.slice(0, 4));
      } catch {
        const fallback = [
          "Will the Fed cut rates this year?",
          "Will Bitcoin hit $200k by end of 2026?",
        ];
        poolRef.current = fallback;
        setSuggestions(fallback);
      }
    }
    fetchSuggestions();
  }, []);

  useEffect(() => {
    if (suggestions.length === 0) return;
    const interval = setInterval(() => {
      setSuggestions((prev) => {
        const pool = poolRef.current;
        if (pool.length <= 4) return prev;
        const next = [...prev];
        const replaceIdx = Math.floor(Math.random() * next.length);
        let attempts = 0;
        let candidate = pool[poolIndexRef.current % pool.length];
        while (next.includes(candidate) && attempts < pool.length) {
          poolIndexRef.current++;
          candidate = pool[poolIndexRef.current % pool.length];
          attempts++;
        }
        poolIndexRef.current++;
        next[replaceIdx] = candidate;
        return next;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [suggestions.length]);

  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = heroInput.trim();
    if (!text) return;
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    setInitialQuery(text);
    setStarted(true);
  };

  /* ── Viewing a past forecast ── */
  if (viewingEntry) {
    const entries = Object.entries(viewingEntry.submission).sort(([, a], [, b]) => b - a);
    const maxProb = entries.length > 0 ? entries[0][1] : 1;

    return (
      <div className="h-screen flex flex-col overflow-hidden">
        <Navbar onToggleHistory={user ? () => setHistoryOpen((v) => !v) : undefined} historyOpen={historyOpen} onLogoDoubleClick={handleNewForecast} />
        <div className="flex-1 flex overflow-hidden min-h-0">
          {historyOpen && user && (
            <ForecastHistory history={forecastHistory} onSelect={handleHistorySelect} onDelete={handleHistoryDelete} onClose={() => setHistoryOpen(false)} />
          )}
          <div className="flex-1 flex flex-col">
            {/* Toolbar */}
            <div className="flex-shrink-0 h-11 border-b border-edge bg-surface flex items-center px-3 gap-1">
              <button
                onClick={() => setViewingEntry(null)}
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
                  <h2 className="text-xl sm:text-2xl font-bold text-primary leading-snug mb-2">{viewingEntry.title}</h2>
                  <p className="text-xs text-muted">
                    {new Date(viewingEntry.timestamp).toLocaleDateString("en-US", {
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

  /* ── Hero / landing view ── */
  if (!started) {
    return (
      <div className="h-screen flex flex-col overflow-hidden">
        <Navbar onLogoDoubleClick={handleNewForecast} />
        <div className="flex-1 flex items-center justify-center relative overflow-hidden">
          {/* Animated background orbs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full bg-accent/[0.03] blur-[80px] sm:blur-[100px] animate-[drift_20s_ease-in-out_infinite]" />
            <div className="absolute bottom-1/4 right-1/4 w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] rounded-full bg-accent-primary/[0.04] blur-[80px] sm:blur-[100px] animate-[drift_25s_ease-in-out_infinite_reverse]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[600px] h-[350px] sm:h-[600px] rounded-full bg-accent/[0.02] blur-[100px] sm:blur-[120px] animate-[pulse_8s_ease-in-out_infinite]" />
          </div>

          <div className="w-full max-w-2xl px-4 sm:px-6 relative z-10">
            {/* Heading */}
            <div className="text-center mb-8 sm:mb-10">
              <p className="text-[10px] sm:text-[11px] font-medium tracking-[0.25em] uppercase text-accent mb-4 sm:mb-5 animate-[fadeIn_0.6s_ease-out]">
                AI-Powered Forecasting
              </p>
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-primary mb-4 sm:mb-5 animate-[fadeIn_0.8s_ease-out] leading-[1.1]">
                Forecast anything,
                <br />
                <span className="bg-gradient-to-r from-accent via-accent-primary to-accent bg-clip-text text-transparent">
                  for anyone
                </span>
              </h1>
              <p className="text-sm sm:text-base text-secondary max-w-md mx-auto animate-[fadeIn_1s_ease-out] leading-relaxed">
                Ask a question about the future. Our AI agents search, analyze, and produce calibrated probability forecasts.
              </p>
            </div>

            {/* Search input */}
            <form onSubmit={handleHeroSubmit} className="relative animate-[fadeSlideUp_0.8s_ease-out]">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-accent/20 via-accent-primary/20 to-accent/20 rounded-2xl blur-sm opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                <input
                  type="text"
                  value={heroInput}
                  onChange={(e) => setHeroInput(e.target.value)}
                  placeholder="What do you want to forecast?"
                  autoFocus
                  className="relative w-full px-4 sm:px-5 py-3.5 sm:py-4 bg-surface border border-edge rounded-2xl text-sm text-primary focus:ring-1 focus:ring-accent focus:border-accent outline-none placeholder:text-muted pr-14 transition-shadow duration-300"
                />
                <button
                  type="submit"
                  disabled={!heroInput.trim()}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-accent text-ground hover:bg-accent-dim transition-all duration-200 disabled:opacity-20 hover:scale-105 active:scale-95"
                  aria-label="Send"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </button>
              </div>
            </form>

            {/* Login prompt */}
            {showLoginPrompt && (
              <div className="mt-4 flex items-center justify-center gap-3 px-4 py-3 bg-surface border border-edge rounded-xl animate-[fadeSlideUp_0.3s_ease-out]">
                <svg className="w-4 h-4 text-accent flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="text-sm text-secondary">Sign in to start forecasting</span>
                <a
                  href="/auth/login"
                  className="px-3 py-1 text-xs font-medium rounded-lg bg-accent text-ground hover:bg-accent-dim transition-colors"
                >
                  Login
                </a>
              </div>
            )}

            {/* Suggestion chips */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-5 sm:mt-6 animate-[fadeSlideUp_1s_ease-out] min-h-[36px] px-1">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => { setHeroInput(s); }}
                  className="px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs text-muted hover:text-primary bg-surface hover:bg-surface-hover border border-edge hover:border-accent/30 rounded-full transition-all duration-200 hover:scale-[1.02] animate-[chipIn_0.4s_ease-out] text-left"
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Settings + info row */}
            <div className="flex items-center justify-center gap-4 sm:gap-6 mt-6 sm:mt-8 animate-[fadeIn_1.2s_ease-out] flex-wrap">
              {user && (
                <>
                  <button
                    onClick={() => { setHistoryOpen(true); setStarted(true); }}
                    className="flex items-center gap-1.5 text-xs text-muted hover:text-secondary transition-colors group"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>History</span>
                  </button>
                  <span className="w-px h-3 bg-edge" />
                </>
              )}
              <button
                onClick={() => setSettingsOpen(true)}
                className="flex items-center gap-1.5 text-xs text-muted hover:text-secondary transition-colors group"
              >
                <svg className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Settings</span>
              </button>
              <span className="w-px h-3 bg-edge" />
              <div className="flex items-center gap-1.5 text-xs text-muted">
                <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                <span>Powered by Prophet Arena</span>
              </div>
            </div>
          </div>
        </div>
        {settingsOpen && (
          <SettingsModal settings={settings} onSave={handleSettingsSave} onClose={() => setSettingsOpen(false)} />
        )}
      </div>
    );
  }

  /* ── Chat + sidebar view ── */
  return (
    <div className="h-dvh flex flex-col">
      <Navbar onToggleHistory={user ? () => setHistoryOpen((v) => !v) : undefined} historyOpen={historyOpen} onLogoDoubleClick={handleNewForecast} />
      <div ref={layoutRef} className="flex-1 flex overflow-hidden min-h-0">
        {historyOpen && user && (
          <ForecastHistory history={forecastHistory} onSelect={handleHistorySelect} onDelete={handleHistoryDelete} onClose={() => setHistoryOpen(false)} />
        )}
        <div className="flex-1 min-w-0 min-h-0 overflow-hidden">
          <ChatInterface
            initialQuery={initialQuery}
            settings={settings}
            onSearchResult={handleSearchResult}
            onBoardUpdate={handleBoardUpdate}
            onStepClick={handleStepClick}
            onOpenSourceBoardEntry={handleOpenSourceBoardEntry}
            onRunStart={handleRunStart}
            onOpenSettings={() => setSettingsOpen(true)}
            onToggleSettings={handleToggleSettings}
            settingsOpen={settingsOpen}
            onForecastComplete={handleForecastComplete}
            onToggleHistory={user ? () => setHistoryOpen((v) => !v) : undefined}
            onToggleSidebar={() => setSidebarOpen((v) => !v)}
            historyOpen={historyOpen}
            sidebarOpen={sidebarOpen}
            onNewForecast={handleNewForecast}
          />
        </div>
        {/* Desktop sidebar */}
        {sidebarOpen && (
          <>
            <div
              onMouseDown={handleResizeStart}
              className="hidden md:block w-[3px] cursor-col-resize bg-edge hover:bg-accent/40 transition-colors"
              role="separator"
              aria-orientation="vertical"
              aria-label="Resize sidebar"
            />
            <div className="hidden md:block flex-shrink-0 min-w-0" style={{ width: `${sidebarWidth}px` }}>
              <Sidebar
                searchGroups={searchGroups}
                boardEntries={boardEntries}
                activeTab={activeTab}
                onTabChange={handleTabChange}
                highlightStep={highlightStep}
                highlightBoardId={highlightBoardId}
              />
            </div>
          </>
        )}
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <>
            <div className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={() => setSidebarOpen(false)} />
            <div className="fixed inset-y-0 right-0 z-40 w-80 max-w-[85vw] md:hidden border-l border-edge">
              <div className="h-full flex flex-col bg-surface">
                <div className="flex items-center justify-between px-4 h-11 border-b border-edge flex-shrink-0">
                  <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">Research</span>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-1 rounded-md text-muted hover:text-primary hover:bg-surface-hover transition-colors"
                    aria-label="Close panel"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="flex-1 overflow-hidden">
                  <Sidebar
                    searchGroups={searchGroups}
                    boardEntries={boardEntries}
                    activeTab={activeTab}
                    onTabChange={handleTabChange}
                    highlightStep={highlightStep}
                    highlightBoardId={highlightBoardId}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      {settingsOpen && (
        <SettingsModal settings={settings} onSave={handleSettingsSave} onClose={() => setSettingsOpen(false)} />
      )}
    </div>
  );
}
