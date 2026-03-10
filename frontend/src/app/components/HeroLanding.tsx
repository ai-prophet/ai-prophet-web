'use client';

import React from 'react';
import type { UserSettings } from "@/types";
import Navbar from "@/components/Navbar";
import SettingsModal from "@/components/SettingsModal";

interface HeroLandingProps {
  user: any;
  heroInput: string;
  setHeroInput: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  showLoginPrompt: boolean;
  suggestions: string[];
  settingsOpen: boolean;
  setSettingsOpen: (v: boolean) => void;
  settings: UserSettings;
  onSettingsSave: (s: UserSettings) => void;
  setHistoryOpen: (v: boolean) => void;
  setStarted: (v: boolean) => void;
  onLogoDoubleClick: () => void;
}

export default function HeroLanding({
  user,
  heroInput,
  setHeroInput,
  onSubmit,
  showLoginPrompt,
  suggestions,
  settingsOpen,
  setSettingsOpen,
  settings,
  onSettingsSave,
  setHistoryOpen,
  setStarted,
  onLogoDoubleClick,
}: HeroLandingProps) {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Navbar onLogoDoubleClick={onLogoDoubleClick} />
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
              Harnessing AI to illuminate our path ahead
            </p>
          </div>

          {/* Search input */}
          <form onSubmit={onSubmit} className="relative animate-[fadeSlideUp_0.8s_ease-out]">
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
        <SettingsModal settings={settings} onSave={onSettingsSave} onClose={() => setSettingsOpen(false)} />
      )}
    </div>
  );
}
