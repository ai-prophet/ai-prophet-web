"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useUser } from "@auth0/nextjs-auth0";
import ChatInterface from "@/components/ChatInterface";
import Navbar from "@/components/Navbar";
import type { SearchGroup, BoardEntry, UserSettings, ForecastHistoryEntry } from "@/types";
import { DEFAULT_SETTINGS } from "@/types";
import { getApiUrl } from "@/config/api";
import { fetchHistory, saveToHistory, deleteFromHistory } from "@/components/ForecastHistory";
import {
  DEFAULT_SIDEBAR_WIDTH,
  MIN_SIDEBAR_WIDTH,
  MAX_SIDEBAR_WIDTH,
  MIN_MAIN_WIDTH,
} from "@/lib/constants";
import HeroLanding from "./components/HeroLanding";
import ForecastViewer from "./components/ForecastViewer";

const Sidebar = dynamic(() => import("@/components/Sidebar"), { ssr: false });
const SettingsModal = dynamic(() => import("@/components/SettingsModal"), { ssr: false });
const ForecastHistory = dynamic(() => import("@/components/ForecastHistory"), { ssr: false });

const SETTINGS_KEY = "prophet_settings";
const SESSION_KEY = "prophet_session";

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
    return (
      <ForecastViewer
        entry={viewingEntry}
        user={user}
        historyOpen={historyOpen}
        setHistoryOpen={setHistoryOpen}
        forecastHistory={forecastHistory}
        onHistorySelect={handleHistorySelect}
        onHistoryDelete={handleHistoryDelete}
        onBack={() => setViewingEntry(null)}
        onLogoDoubleClick={handleNewForecast}
      />
    );
  }

  /* ── Hero / landing view ── */
  if (!started) {
    return (
      <HeroLanding
        user={user}
        heroInput={heroInput}
        setHeroInput={setHeroInput}
        onSubmit={handleHeroSubmit}
        showLoginPrompt={showLoginPrompt}
        suggestions={suggestions}
        settingsOpen={settingsOpen}
        setSettingsOpen={setSettingsOpen}
        settings={settings}
        onSettingsSave={handleSettingsSave}
        setHistoryOpen={setHistoryOpen}
        setStarted={setStarted}
        onLogoDoubleClick={handleNewForecast}
      />
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
