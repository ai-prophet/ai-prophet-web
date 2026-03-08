"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ChatInterface from "@/components/ChatInterface";
import Sidebar from "@/components/Sidebar";
import SettingsModal from "@/components/SettingsModal";
import Navbar from "@/components/Navbar";
import type { SearchGroup, BoardEntry, UserSettings } from "@/types";
import { DEFAULT_SETTINGS } from "@/types";
import { getApiUrl } from "@/config/api";

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
  const [started, setStarted] = useState(false);
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
  const layoutRef = useRef<HTMLDivElement>(null);
  const resizingRef = useRef(false);

  // Restore session and settings from storage (client-only to avoid hydration mismatch)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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

  // Persist session state
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
  }, []);

  const handleOpenSourceBoardEntry = useCallback((boardId: number) => {
    setActiveTab("board");
    setHighlightStep(null);
    setHighlightBoardId(boardId);
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

  const handleTabChange = useCallback((tab: "board" | "searches") => {
    setActiveTab(tab);
    if (tab === "board") {
      setHighlightStep(null);
    } else {
      setHighlightBoardId(null);
    }
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
        const events: { title: string }[] = json.data ?? [];
        const good = events
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

  // Rotate one suggestion every 4 seconds
  useEffect(() => {
    if (suggestions.length === 0) return;
    const interval = setInterval(() => {
      setSuggestions((prev) => {
        const pool = poolRef.current;
        if (pool.length <= 4) return prev;
        const next = [...prev];
        const replaceIdx = Math.floor(Math.random() * next.length);
        // Pick next from pool that isn't currently shown
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
    setInitialQuery(text);
    setStarted(true);
  };

  /* ── Hero / landing view ── */
  if (!started) {
    return (
      <div className="h-screen flex flex-col overflow-hidden">
        <Navbar />
        <div className="flex-1 flex items-center justify-center relative">
          {/* Animated background orbs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-accent/[0.03] blur-[100px] animate-[drift_20s_ease-in-out_infinite]" />
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-accent-primary/[0.04] blur-[100px] animate-[drift_25s_ease-in-out_infinite_reverse]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-accent/[0.02] blur-[120px] animate-[pulse_8s_ease-in-out_infinite]" />
          </div>

          <div className="w-full max-w-2xl px-6 relative z-10">
            {/* Heading */}
            <div className="text-center mb-10">
              <p className="text-xs font-medium tracking-[0.2em] uppercase text-accent mb-4 animate-[fadeIn_0.6s_ease-out]">
                AI-Powered Forecasting
              </p>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-primary mb-4 animate-[fadeIn_0.8s_ease-out]">
                Forecast anything,
                <br />
                <span className="bg-gradient-to-r from-accent via-accent-primary to-accent bg-clip-text text-transparent">
                  for anyone
                </span>
              </h1>
              <p className="text-sm sm:text-base text-secondary max-w-md mx-auto animate-[fadeIn_1s_ease-out]">
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
                  className="relative w-full px-5 py-4 bg-surface border border-edge rounded-2xl text-sm text-primary focus:ring-1 focus:ring-accent focus:border-accent outline-none placeholder:text-muted pr-14 transition-shadow duration-300"
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

            {/* Suggestion chips */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-6 animate-[fadeSlideUp_1s_ease-out] min-h-[36px]">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => { setHeroInput(s); }}
                  className="px-3 py-1.5 text-xs text-muted hover:text-primary bg-surface hover:bg-surface-hover border border-edge hover:border-accent/30 rounded-full transition-all duration-200 hover:scale-[1.02] animate-[chipIn_0.4s_ease-out]"
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Settings + info row */}
            <div className="flex items-center justify-center gap-6 mt-8 animate-[fadeIn_1.2s_ease-out]">
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
    <div className="h-screen flex flex-col">
      <Navbar />
      <div ref={layoutRef} className="flex-1 flex overflow-hidden min-h-0">
        <div className="flex-1 min-w-0">
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
          />
        </div>
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
      </div>
      {settingsOpen && (
        <SettingsModal settings={settings} onSave={handleSettingsSave} onClose={() => setSettingsOpen(false)} />
      )}
    </div>
  );
}
