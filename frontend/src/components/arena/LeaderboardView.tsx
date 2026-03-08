'use client';

import React, { useState } from 'react';
import LeaderboardTable from "@/components/arena/LeaderboardTable";
import LeaderboardChart from "@/components/arena/LeaderboardChart";

interface ModelEntry {
  name: string;
  score: number;
  resolved_events?: number;
  ci?: Record<string, string | number>;
  providerConfig?: {
    logoPath: string;
    color: string;
    displayName: string;
  };
  details: {
    provider: string;
    release_year: string;
  };
}

interface LeaderboardViewProps {
  data: ModelEntry[];
  loading?: boolean;
  error?: string | null;
  scoreLabel: string;
  metric: 'brier' | 'average-return';
  showRank?: boolean;
  skipModelFilter?: boolean;
  ciLabel?: string;
}

export default function LeaderboardView({
  data,
  loading = false,
  error = null,
  scoreLabel,
  metric,
  showRank = true,
  skipModelFilter = false,
  ciLabel = 'Confidence Interval (95% CI)',
}: LeaderboardViewProps) {
  const [viewMode, setViewMode] = useState<'table' | 'chart'>('table');

  return (
    <>
      {/* View Toggle Button */}
      <button
        onClick={() => setViewMode(viewMode === 'table' ? 'chart' : 'table')}
        className="absolute top-4 right-4 p-2 rounded-lg hover:bg-accent-tertiary transition-colors z-10 cursor-pointer"
        title={viewMode === 'table' ? 'Switch to chart view' : 'Switch to table view'}
      >
        {viewMode === 'table' ? (
          // Chart icon
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        ) : (
          // Table icon
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        )}
      </button>

      {/* Content */}
      {viewMode === 'table' ? (
        <LeaderboardTable
          data={data}
          loading={loading}
          error={error}
          scoreLabel={scoreLabel}
          metric={metric}
          showRank={showRank}
          confidenceLabel={ciLabel}
        />
      ) : (
        <LeaderboardChart
          data={data}
          loading={loading}
          error={error}
          scoreLabel={scoreLabel}
          metric={metric}
          skipModelFilter={skipModelFilter}
        />
      )}
    </>
  );
}
