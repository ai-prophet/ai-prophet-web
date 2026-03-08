'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts';
import Image from 'next/image';
import { niceName, isModelConfigured } from "@/config/models";
import { getTooltipConfig } from "@/config/tooltips";

// Types for the time-series data
interface TimeSeriesData {
  score: number;
  rank: number;
}

interface CategoryStream {
  [date: string]: TimeSeriesData;
}

// Updated types for the API response
interface ModelData {
  name: string;
  score: number;
  rank?: number;
  resolved_events?: number;
  details: {
    provider: string;
    release_year: string;
  };
  average_return_category_stream?: {
    [category: string]: CategoryStream;
  };
  providerConfig?: {
    logoPath: string;
    color: string;
    displayName: string;
  };
}
interface LeaderboardChartProps {
  data: ModelData[];
  loading: boolean;
  error: string | null;
  scoreLabel?: string;
  metric?: 'brier' | 'average-return';
  riskLevel?: string;
  skipModelFilter?: boolean; // Skip isModelConfigured filtering for agent models
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: ModelData;
  }>;
  label?: string;
}

interface BarLabelProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  value?: number;
}

interface XAxisTickProps {
  x?: number;
  y?: number;
  payload?: {
    value: string;
  };
}

const LeaderboardChart: React.FC<LeaderboardChartProps> = ({
  data,
  loading,
  error,
  scoreLabel = 'Brier Score',
  metric = 'brier',
  riskLevel: _riskLevel = '0',
  skipModelFilter = false,
}) => {
  // Add mobile detection state
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Filter and sort the data based on selected option
  const sortedData = [...data]
    .filter(model => skipModelFilter || isModelConfigured(model.name))
    .sort((a: ModelData, b: ModelData) => {
      const scoreA = a.score;
      const scoreB = b.score;

      // For both brier score and average_return, higher is better
      return scoreB - scoreA;
    });

  // Calculate dynamic Y-axis domain to better show variance
  const calculateYDomain = () => {
    if (sortedData.length === 0) return [0, 1];
    
    const scores = sortedData.map(model => model.score).filter(score => score !== undefined && score !== null);
    if (scores.length === 0) return [0, 1];
    
    const minScore = Math.min(...scores);
    const maxScore = Math.max(...scores);
    
    // Add padding to show variance better (10% padding on each side)
    const range = maxScore - minScore;
    const padding = Math.max(range * 0.1, 0.001); // Minimum padding to avoid identical min/max
    
    return [
      Math.max(0, minScore - padding), // Don't go below 0
      maxScore + padding
    ];
  };

  const yDomain = calculateYDomain();

  // Format Y-axis ticks to show percentages
  const formatYAxisTick = (value: number) => {
    if (metric === 'average-return') {
      return Math.round(value) + '%';
    }
    return Math.round(value * 100) + '%';
  };

  // Custom label component for bar values
  const CustomBarLabel = (props: BarLabelProps) => {
    const { x, y, width, value } = props;

    if (x === undefined || y === undefined || width === undefined) {
      return null;
    }

    const percentageValue = metric === 'average-return'
      ? (value || 0).toFixed(isMobile ? 0 : 2)
      : ((value || 0) * 100).toFixed(isMobile ? 0 : 2);

    return (
      <g>
        <text
          x={x + width / 2}
          y={y - 5}
          textAnchor="middle"
          fill="#141414"
          fontSize={isMobile ? "9" : "10"}
          opacity="0.6"
        >
          {percentageValue}%
        </text>
      </g>
    );
  };

  // Custom X-axis tick component with logo and text
  const CustomXAxisTick = (props: XAxisTickProps) => {
    const { x = 0, y = 0, payload } = props;

    if (!payload?.value) {
      return null;
    }

    const modelData = sortedData.find(model => model.name === payload.value);
    const isMarketBaseline = payload.value === 'llm-market-baseline' || payload.value === 'agent-market-baseline';

    const logoSize = isMobile ? 14 : 16;
    const logoX = x + (isMobile ? -7 : -8); 
    const logoY = y;
    const textX = x + 4;
    const textY = y + logoSize + (isMobile ? 7 : 8); // Move down 12px from 19 to 31
    const fontSize = isMobile ? 9 : 10;

    return (
      <g>
        {/* Provider logo using pure SVG */}
        {modelData?.providerConfig?.logoPath ? (
          <image
            href={modelData.providerConfig.logoPath}
            x={logoX}
            y={logoY}
            width={logoSize}
            height={logoSize}
            preserveAspectRatio="xMidYMid meet"
          />
        ) : (
          /* Fallback for models without logos using pure SVG */
          <g transform={`translate(${logoX},${logoY})`}>
            <rect 
              width={logoSize} 
              height={logoSize} 
              rx={logoSize/2} 
              fill="#9CA3AF" 
            />
            <text 
              x={logoSize/2} 
              y={logoSize/2 + 3} 
              textAnchor="middle" 
              fontSize={fontSize} 
              fill="#fff"
            >
              {isMarketBaseline ? '💭' : '?'}
            </text>
          </g>
        )}
        {/* Model name under logo */}
        <text
          x={textX}
          y={textY}
          textAnchor="end"
          fill="#141414"
          fontSize={fontSize}
          style={{ fontWeight: 400 }}
          transform={`rotate(-45 ${textX} ${textY})`}
        >
          {niceName(payload.value) || payload.value}
        </text>
      </g>
    );
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const currentScore = data.score;
      const isMarketBaseline = data.name === 'llm-market-baseline' || data.name === 'agent-market-baseline';

      return (
        <div className="bg-bg-primary border border-accent-secondary rounded-lg p-3 shadow-lg max-w-sm">
          <p className="font-semibold text-text-primary">{label}</p>
          <p className="text-sm text-gray-600">
            {data.providerConfig?.displayName || data.details.provider}
            {data.details.release_year && ` • ${data.details.release_year}`}
          </p>
          {currentScore !== undefined && (
            <p className="text-accent-primary">
              {scoreLabel}: {currentScore.toFixed(5)}
            </p>
          )}
          {data.resolved_events !== undefined && (
            <p className="text-sm text-gray-600">
              Resolved Events: {data.resolved_events.toLocaleString()}
            </p>
          )}
          {isMarketBaseline && (
            <p className="text-sm text-gray-600 mt-2 leading-snug">
              {getTooltipConfig('market-baseline-tooltip')?.description}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // Loading state
  if (loading) {
    return (
      <div className="w-full space-y-6">
        <div className="flex flex-col justify-center items-center h-96 space-y-4">
          <div className="relative w-12 h-12">
            <Image
              src="/assets/loading.gif"
              alt="Loading..."
              fill
              style={{ objectFit: 'contain' }}
              sizes="48px"
              unoptimized
            />
          </div>
          <div className="text-text-primary text-lg">
            Loading leaderboard data...
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full space-y-6">
        <div className="flex flex-col items-center justify-center h-96 space-y-4">
          <div className="text-red-600">
            Error loading leaderboard data: {error}
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (data.length === 0) {
    return (
      <div className="w-full space-y-6">
        <div className="flex justify-center items-center h-96">
          <div className="text-text-primary">No predictor data available</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Chart Container */}
      <div className="h-96 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={sortedData}
            margin={isMobile ? {
              top: 20,
              right: 15,
              left: 15,
              bottom: 80,
            } : {
              top: 20,
              right: 20,
              left: -10,
              bottom: 90,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E0E9F5" />
            <XAxis
              dataKey="name"
              height={80}
              interval={0}
              tick={<CustomXAxisTick />}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#141414' }}
              domain={yDomain}
              tickCount={6}
              tickFormatter={formatYAxisTick}
              hide={isMobile} // Hide Y-axis on mobile screens
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey={'score'} radius={[4, 4, 0, 0]} strokeWidth={1}>
              {sortedData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.providerConfig?.color || '#6397C7'}
                  stroke={entry.providerConfig?.color || '#B8A599'}
                />
              ))}
              <LabelList content={<CustomBarLabel />} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>


    </div>
  );
};

export default LeaderboardChart;
