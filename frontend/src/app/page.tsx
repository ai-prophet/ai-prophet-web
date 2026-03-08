"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ChatInterface from "@/components/ChatInterface";
import Sidebar from "@/components/Sidebar";
import SettingsModal from "@/components/SettingsModal";
import Navbar from "@/components/Navbar";
import DeveloperContent from "@/components/DeveloperContent";
import type { SearchGroup, BoardEntry, UserSettings } from "@/types";
import { DEFAULT_SETTINGS } from "@/types";

const SETTINGS_KEY = "prophet_settings";
const DEFAULT_SIDEBAR_WIDTH = 380;
const MIN_SIDEBAR_WIDTH = 320;
const MAX_SIDEBAR_WIDTH = 720;
const MIN_MAIN_WIDTH = 520;

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

export default function Home() {
  const [showDevDocs, setShowDevDocs] = useState(false);
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
  const layoutRef = useRef<HTMLDivElement>(null);
  const resizingRef = useRef(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSettings(loadSettings());
  }, []);

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
      <div className="h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 overflow-y-auto">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-full max-w-2xl px-6">
              <div className="text-center mb-10">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-6">
                  <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                </div>
                <h2 className="text-2xl sm:text-3xl font-semibold text-primary mb-3">
                  Forecast anything, for anyone
                </h2>
              </div>
              <form onSubmit={handleHeroSubmit} className="relative">
                <input
                  type="text"
                  value={heroInput}
                  onChange={(e) => setHeroInput(e.target.value)}
                  placeholder="Ask anything..."
                  autoFocus
                  className="w-full px-5 py-4 bg-surface border border-edge rounded-2xl text-sm text-primary focus:ring-1 focus:ring-accent focus:border-accent outline-none placeholder:text-muted pr-14"
                />
                <button
                  type="submit"
                  disabled={!heroInput.trim()}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-accent text-ground hover:bg-accent-dim transition-colors disabled:opacity-30"
                  aria-label="Send"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </button>
              </form>
              <div className="flex items-center justify-center mt-4 gap-4">
                <button
                  onClick={() => setSettingsOpen(true)}
                  className="flex items-center gap-1.5 text-xs text-muted hover:text-secondary transition-colors group"
                >
                  <svg className="w-3.5 h-3.5 group-hover:rotate-45 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Settings</span>
                </button>
                <button
                  onClick={() => setShowDevDocs((v) => !v)}
                  className="flex items-center gap-1.5 text-xs text-muted hover:text-secondary transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                  </svg>
                  <span>API Docs</span>
                </button>
              </div>
            </div>
          </div>
          {showDevDocs && <DeveloperContent />}
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
