'use client';

import React from 'react';
import Image from 'next/image';
import LoadingSpinner from "@/components/arena/LoadingSpinner";
import { niceName } from "@/config/models";

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

interface LeaderboardTableProps {
  data: ModelEntry[];
  loading?: boolean;
  error?: string | null;
  scoreLabel: string;
  metric: 'brier' | 'average-return';
  showRank?: boolean;
  confidenceLabel?: string;
}

export default function LeaderboardTable({
  data,
  loading = false,
  error = null,
  scoreLabel,
  metric,
  showRank = true,
  confidenceLabel = 'Confidence Interval (95% CI)',
}: LeaderboardTableProps) {
  const formatNumber = (value: string | number, fractionDigits = 4) => {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value.toFixed(fractionDigits);
    }
    return String(value);
  };

  const formatCiDisplay = (ci?: Record<string, string | number>, scaleBy100 = false) => {
    if (!ci || Object.keys(ci).length === 0) {
      return '—';
    }

    const lower = ci.lower ?? ci.lower_bound;
    const upper = ci.upper ?? ci.upper_bound;

    if (lower !== undefined && upper !== undefined) {
      const lowerNum = typeof lower === 'number' ? lower : parseFloat(String(lower));
      const upperNum = typeof upper === 'number' ? upper : parseFloat(String(upper));
      if (scaleBy100 && !isNaN(lowerNum) && !isNaN(upperNum)) {
        return `${formatNumber(lowerNum * 100)} – ${formatNumber(upperNum * 100)}`;
      }
      return `${formatNumber(lower)} – ${formatNumber(upper)}`;
    }

    const prioritizedEntry =
      Object.entries(ci).find(([key]) => key.toLowerCase().includes('ci')) ||
      Object.entries(ci).find(([key]) => key.toLowerCase().includes('se')) ||
      Object.entries(ci)[0];

    if (!prioritizedEntry) {
      return '—';
    }

    const [, value] = prioritizedEntry;
    if (value === undefined || value === null || value === '') {
      return '—';
    }

    if (typeof value === 'number') {
      return formatNumber(scaleBy100 ? value * 100 : value);
    }

    // Handle string CI values like "±0.0853" — scale the numeric part
    if (scaleBy100 && typeof value === 'string') {
      const match = value.match(/^([±]?)(\d+\.?\d*)$/);
      if (match) {
        const scaled = (parseFloat(match[2]) * 100).toFixed(2);
        return `${match[1]}${scaled}`;
      }
    }

    return String(value);
  };

  // Sort data by score (higher is better)
  const sortedData = React.useMemo(() => {
    return [...data].sort((a, b) => {
      // For both Brier score (displayed as 1-brier) and Average Return, higher is better
      return b.score - a.score;
    });
  }, [data]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-500 text-center">
          <p className="text-lg font-semibold">Error loading data</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="sticky top-0 bg-surface z-10">
          <tr className="border-b-2 border-edge">
            {showRank && (
              <th className="px-4 py-3 text-left text-sm font-semibold text-primary">
                Rank
              </th>
            )}
            <th className="px-4 py-3 text-left text-sm font-semibold text-primary">
              Model
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-primary">
              Provider
            </th>
            <th className="px-4 py-3 text-right text-sm font-semibold text-primary">
              Events
            </th>
            <th className="px-4 py-3 text-right text-sm font-semibold text-primary">
              {scoreLabel}
            </th>
            <th className="px-4 py-3 text-right text-sm font-semibold text-primary">
              {confidenceLabel}
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((model, index) => {
            const rank = index + 1;
            
            return (
              <tr
                key={model.name}
                className="border-b border-edge hover:bg-accent-tertiary transition-colors"
              >
                {showRank && (
                  <td className="px-4 py-3">
                    <span className="text-primary text-sm font-semibold">
                      {rank}
                    </span>
                  </td>
                )}
                <td className="px-4 py-3">
                  <div className="flex flex-row items-center gap-2">
                    {model.providerConfig && (
                      <div className="w-5 h-5 flex-shrink-0 relative">
                        <Image
                          src={model.providerConfig.logoPath}
                          alt={model.providerConfig.displayName}
                          width={20}
                          height={20}
                          className="object-contain"
                        />
                      </div>
                    )}
                    <span className="text-primary text-sm text-left">
                      {niceName(model.name) || model.name}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-gray-600 text-sm">
                    {model.providerConfig?.displayName || model.details.provider}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-gray-600 text-sm">
                    {model.resolved_events && model.resolved_events > 0 
                      ? model.resolved_events.toLocaleString() 
                      : '—'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-primary text-sm font-semibold">
                    {metric === 'average-return'
                      ? `${model.score.toFixed(2)}%`
                      : model.score.toFixed(4)}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-gray-600 text-sm">
                    {metric === 'average-return' ? '—' : formatCiDisplay(model.ci)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
