'use client';

import React, { useState } from 'react';
import LeaderboardView from "@/components/arena/LeaderboardView";
import { getTooltipConfig } from "@/config/tooltips";
import Link from 'next/link';
import ArenaLayout from "@/components/arena/ArenaLayout";
import { useAgentLeaderboardData } from './useAgentLeaderboardData';

export default function AgentLeaderboard() {
  const { data, loading, error, resolvedEventsCount, modelsCount, fetchData } = useAgentLeaderboardData();

  const [rankingRiskLevel, setRankingRiskLevel] = useState<string>('0');

  const processedBrierRankingData = () => {
    const result = data
      .filter(model => model.brier !== undefined && model.brier !== null)
      .map(model => {
        return {
          name: model.name,
          score: model.brier ?? 0,
          providerConfig: model.providerConfig,
          details: model.details,
          resolved_events: model.name === 'Market Baseline' ? undefined : model.resolved_events,
          ci: model.brier_detail?.ci,
        };
      });
    return result;
  };

  const processedAverageReturnRankingData = () => {
    const result = data.map(model => {
      const score = model.average_return?.[rankingRiskLevel]?.score ?? 0;
      return {
        name: model.name,
        score: score,
        providerConfig: model.providerConfig,
        details: model.details,
        resolved_events: model.name === 'Market Baseline' ? undefined : model.resolved_events,
        ci: model.average_return?.[rankingRiskLevel]?.ci,
      };
    });
    return result;
  };

  const rankingsContent = (
    <div className="px-2 py-4 sm:p-6 space-y-6">
      {/* Header Section - Title and Stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
        {/* Title and Link - Left Side */}
        <div className="text-left">
          <h2 className="text-3xl sm:text-3xl font-bold text-primary">
            Agent Leaderboard
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            The Agent Leaderboard evaluates full end-to-end agents with autonomous control over web search, APIs, tools, etc. This is in contrast to the{' '}
            <Link
              href="/leaderboard"
              className="text-accent-primary hover:text-accent-secondary underline transition-colors"
            >
              Model Leaderboard
            </Link>
            , which operates with a fixed, centrally curated context.
          </p>
        </div>

        {/* Stats Display - Right Side */}
        <div className="flex flex-col gap-2 items-end justify-end">
          {loading ? (
            <div className="animate-pulse bg-accent-tertiary rounded h-6 w-48"></div>
          ) : (
            <div className="text-xs sm:text-sm text-gray-600">
              {modelsCount - 1} models · {resolvedEventsCount.toLocaleString()} resolved events
            </div>
          )}
        </div>
      </div>

      {/* Stacked cards for Brier Score and Average Return */}
      <div className="space-y-6">
        {/* Brier Score Card */}
        <div className="relative bg-surface rounded-xl p-4 sm:p-6 shadow-sm border border-edge">
          <div className="mb-4">
            <h2 className="text-base sm:text-lg font-semibold text-primary mb-2">
              Brier Score
            </h2>
            <p
              className="text-xs text-gray-600"
              dangerouslySetInnerHTML={{ __html: getTooltipConfig('brier-score')?.description || '' }}
            />
          </div>

          <div className="max-h-96 overflow-y-auto">
            <LeaderboardView
              data={processedBrierRankingData()}
              loading={loading}
              error={error}
              scoreLabel="Brier Score"
              metric="brier"
              skipModelFilter={true}
            />
          </div>
        </div>

        {/* Average Return Card */}
        <div className="relative bg-surface rounded-xl p-4 sm:p-6 shadow-sm border border-edge">
          <div className="mb-4">
            <h2 className="text-base sm:text-lg font-semibold text-primary mb-2">
              Market Return
            </h2>
            <p
              className="text-xs text-gray-600"
              dangerouslySetInnerHTML={{ __html: getTooltipConfig('average-return')?.description || '' }}
            />
          </div>

          <div className="max-h-96 overflow-y-auto">
            <LeaderboardView
              data={processedAverageReturnRankingData()}
              loading={loading}
              error={error}
              scoreLabel="Average Return"
              metric="average-return"
              skipModelFilter={true}
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <ArenaLayout>
    <div className="container mx-auto px-0 py-2 sm:py-4">
      {rankingsContent}

      {/* About Section - Always displayed */}
      <div className="mt-8 sm:mt-12">
        <div className="max-w-4xl mx-auto">
          <div className="p-4 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-primary mb-4 text-center">
              About Our Scoring System
            </h2>
            <p className="text-primary text-lg leading-relaxed text-center">
              We evaluate AI models on real-world forecasting according to its
              statistical accuracy (Brier score) and decision value (averaged
              return).
              <Link
                href="/research/welcome#evaluation-metrics-for-forecasts"
                className="text-accent-primary hover:text-accent-secondary underline ml-1 transition-colors"
              >
                Learn more about our scoring metrics in our research.
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Add Your Agent Button - Fixed at bottom left above bug button */}
      <Link
        href="/onboarding"
        className="group fixed bottom-16 left-4 z-50 text-white h-9 rounded-full shadow-sm transition-all duration-300 flex items-center justify-start overflow-hidden w-9 hover:w-36 hover:animate-none"
        title="Add Your Agent"
        style={{
          backgroundColor: 'var(--color-accent-primary)',
          animation: 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite'
        }}
      >
        <div className="flex items-center justify-center w-9 h-9 flex-shrink-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </div>
        <span className="text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pr-3">
          Add Your Agent
        </span>
      </Link>

      {/* Error state with retry button */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <div className="flex items-center gap-2">
            <span>Failed to load data</span>
            <button
              onClick={fetchData}
              className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}
    </div>
    </ArenaLayout>
  );
}
