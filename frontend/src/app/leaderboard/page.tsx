'use client';

import React, { useState, useEffect } from 'react';
import LeaderboardView from "@/components/arena/LeaderboardView";
import CustomTimeSeriesChart from "@/components/arena/CustomTimeSeriesChart";
import DropdownSelector from "@/components/arena/DropdownSelector";
import ArenaLayout from "@/components/arena/ArenaLayout";
import { getApiUrl } from "@/config/api";
import {
  getProviderConfig,
  DEFAULT_PROVIDER_CONFIG,
} from "@/config/providers";
import { isModelConfigured } from "@/config/models";
import {
  AVAILABLE_CATEGORIES,
  CategoryType,
  CATEGORY_NAMES,
} from "@/config/categories";
import { getTooltipConfig } from "@/config/tooltips";
import Link from 'next/link';

// Category configuration with icons matching the markets page
const categories = [
  {
    name: 'overall',
    displayName: 'All',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  {
    name: 'Politics',
    displayName: 'Politics',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
        />
      </svg>
    ),
  },
  {
    name: 'Sports',
    displayName: 'Sports',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
        />
      </svg>
    ),
  },
];

// Helper function to extract provider from model name
const getProviderFromModelName = (modelName: string): string => {
  // Handle agent- prefixed models
  if (modelName.startsWith('agent-')) {
    const withoutAgentPrefix = modelName.substring(6); // Remove 'agent-' prefix
    if (withoutAgentPrefix.startsWith('google/')) return 'google';
    if (withoutAgentPrefix.startsWith('anthropic/')) return 'anthropic';
    if (withoutAgentPrefix.startsWith('x-ai/')) return 'xai';
    if (withoutAgentPrefix.startsWith('meta-llama/')) return 'meta';
    if (withoutAgentPrefix.startsWith('deepseek/')) return 'deepseek';
    if (withoutAgentPrefix.startsWith('qwen/')) return 'qwen';
    if (withoutAgentPrefix.startsWith('moonshotai/')) return 'moonshotai';
  }
  
  // Handle regular models
  if (modelName.startsWith('google/')) return 'google';
  if (modelName.startsWith('meta-llama/')) return 'meta';
  if (modelName.startsWith('deepseek/')) return 'deepseek';
  if (modelName.startsWith('qwen/')) return 'qwen';
  if (modelName.startsWith('x-ai/')) return 'xai';
  if (modelName.startsWith('moonshotai/')) return 'moonshotai';
  if (modelName.startsWith('anthropic/')) return 'anthropic';
  return '';
};

type CiData = Record<string, string | number>;

// Types for the time-series data
interface TimeSeriesData {
  score: number;
  rank: number;
  ci?: CiData;
}

interface CategoryStream {
  [date: string]: TimeSeriesData;
}

// Types for the API response
interface ModelData {
  name: string;
  brier?: number;
  brier_detail?: TimeSeriesData;
  average_return?: { [risk: string]: TimeSeriesData };
  rank?: number;
  resolved_events?: number;
  details: {
    provider: string;
    release_year: string;
  };
  brier_category_stream?: {
    [category: string]: CategoryStream;
  };
  average_return_category_stream?: {
    [risk: string]: {
      [category: string]: CategoryStream;
    };
  };
  brier_category?: {
    [category: string]: TimeSeriesData;
  };
  average_return_category?: {
    [risk: string]: {
      [category: string]: TimeSeriesData;
    };
  };
  providerConfig?: {
    logoPath: string;
    color: string;
    displayName: string;
  };
}

interface ApiResponse {
  message: string;
  data: {
    models: ModelData[];
  };
  status: string;
}

export default function Leaderboard() {
  const [data, setData] = useState<ModelData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resolvedEventsCount, setResolvedEventsCount] = useState<number>(0);
  const [modelsCount, setModelsCount] = useState<number>(0);

  // Rankings tab state
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryType>('overall');
  const rankingRiskLevel = '0';
  const progressRiskLevel = '0';

  // Fetch resolved events count
  const fetchResolvedEventsCount = async () => {
    try {
      // Use optimized count endpoint - only count events with predictions
      const response = await fetch(getApiUrl('/events/stats/count?resolved_type=resolved&predicted_only=true'));
      if (response.ok) {
        const result = await response.json();
        setResolvedEventsCount(result.data?.count || 0);
      }
    } catch (err) {
      console.warn('Failed to fetch resolved events count:', err);
    }
  };

  // Fetch data from API
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch both leaderboard data and resolved events count in parallel
      const [leaderboardResponse] = await Promise.all([
        fetch(getApiUrl('/scoring/predictors')),
        fetchResolvedEventsCount()
      ]);

      const response = leaderboardResponse;

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse = await response.json();

      if (result.status === 'success') {
        // Filter out models that are not configured or suppressed
        const filteredModels = result.data.models.filter(model =>
          isModelConfigured(model.name)
        );

        // Process models to include provider configuration
        const processedModels = filteredModels.map(model => {
          // Handle llm-market-baseline as a special case
          let providerConfig;
          if (model.name === 'llm-market-baseline') {
            providerConfig = getProviderConfig('llm-market-baseline');
          } else {
            providerConfig = getProviderConfig(model.details.provider);
          }

          // Fallback to default if no config found
          if (!providerConfig) {
            providerConfig = DEFAULT_PROVIDER_CONFIG;
          }

          return {
            ...model,
            providerConfig: {
              logoPath: providerConfig.logoPath,
              color: providerConfig.color,
              displayName: providerConfig.displayName,
            },
          };
        });
        setData(processedModels);
        setModelsCount(processedModels.length);
      } else {
        throw new Error(result.message || 'Failed to fetch data');
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An unknown error occurred'
      );
      console.error('Error fetching leaderboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Get models that have category data and are configured for both Brier and Average Return
  const getModelsWithCategoryData = () => {
    return data.filter(model => {
      if (!isModelConfigured(model.name)) return false;
      // For category data, we need either brier_category or average_return_category
      return (
        (model.brier_category &&
          Object.keys(model.brier_category).length > 0) ||
        (model.average_return_category &&
          model.average_return_category[rankingRiskLevel] &&
          Object.keys(model.average_return_category[rankingRiskLevel]).length >
            0)
      );
    });
  };

  // Get available categories that have data for either metric
  const getAvailableCategories = (): CategoryType[] => {
    const modelsWithData = getModelsWithCategoryData();
    const categoriesWithData = new Set<string>();

    modelsWithData.forEach(model => {
      if (model.brier_category) {
        Object.keys(model.brier_category).forEach(category => {
          categoriesWithData.add(category);
        });
      }
      if (model.average_return_category) {
        Object.keys(
          model.average_return_category[rankingRiskLevel] || {}
        ).forEach(category => {
          categoriesWithData.add(category);
        });
      }
    });

    return AVAILABLE_CATEGORIES.filter(category =>
      categoriesWithData.has(category)
    );
  };

  // Process data for Brier Score ranking chart
  const processedBrierRankingData = () => {
    if (selectedCategory === 'overall') {
      // Overall Brier ranking data
      return data.map(model => {
        const ci = model.brier_detail?.ci;
        return {
          name: model.name,
          score: model.brier ?? 0,
          resolved_events: model.resolved_events,
          providerConfig: model.providerConfig,
          details: model.details,
          ci,
        };
      });
    } else {
      // Category-specific Brier data
      const modelsWithData = getModelsWithCategoryData();
      return modelsWithData
        .map(model => {
          let score = 0;
          let hasDataForCategory = false;
          let ci: CiData | undefined;

          if (model.brier_category?.[selectedCategory]) {
            const detail = model.brier_category[selectedCategory];
            score = detail.score;
            ci = detail.ci;
            hasDataForCategory = true;
          }

          return {
            name: model.name,
            score: score,
            resolved_events: model.resolved_events,
            providerConfig: model.providerConfig,
            details: model.details,
            hasDataForCategory,
            ci,
          };
        })
        .filter(model => model.hasDataForCategory && model.score !== undefined);
    }
  };

  // Process data for Average Return ranking chart
  const processedAverageReturnRankingData = () => {
    if (selectedCategory === 'overall') {
      // Overall Average Return ranking data
      return data.map(model => {
        const ci = model.average_return?.[rankingRiskLevel]?.ci;
        return {
          name: model.name,
          score: model.average_return?.[rankingRiskLevel]?.score ?? 0,
          resolved_events: model.resolved_events,
          providerConfig: model.providerConfig,
          details: model.details,
          ci,
        };
      });
    } else {
      // Category-specific Average Return data
      const modelsWithData = getModelsWithCategoryData();
      return modelsWithData
        .map(model => {
          let score = 0;
          let hasDataForCategory = false;
          let ci: CiData | undefined;

          if (
            model.average_return_category?.[rankingRiskLevel]?.[
              selectedCategory
            ]
          ) {
            const detail =
              model.average_return_category[rankingRiskLevel][selectedCategory];
            score = detail.score;
            ci = detail.ci;
            hasDataForCategory = true;
          }

          return {
            name: model.name,
            score: score,
            resolved_events: model.resolved_events,
            providerConfig: model.providerConfig,
            details: model.details,
            hasDataForCategory,
            ci,
          };
        })
        .filter(model => model.hasDataForCategory && model.score !== undefined);
    }
  };

  const processedBrierCategoryStream = data.map(model => {
    return {
      name: model.name,
      category_stream: model.brier_category_stream,
      providerConfig: model.providerConfig,
      details: model.details,
    };
  });

  const processedAverageReturnCategoryStream = () =>
    data.map(model => {
      const categoryStream =
        model.average_return_category_stream?.[progressRiskLevel];
      return {
        name: model.name,
        category_stream: categoryStream || {},
        providerConfig: model.providerConfig,
        details: model.details,
      };
    });

  const availableCategories = getAvailableCategories();

  // Reset selected category if it's not available when metric or risk level changes
  useEffect(() => {
    if (
      availableCategories.length > 0 &&
      !availableCategories.includes(selectedCategory)
    ) {
      setSelectedCategory(availableCategories[0]);
    }
  }, [selectedCategory, availableCategories]);

  // Rankings Tab Content
  const rankingsContent = (
    <div className="px-2 py-4 sm:p-6 space-y-6">
      {/* Header Section - Title and Stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
        {/* Title and Link - Left Side */}
        <div className="text-left">
          <h2 className="text-3xl sm:text-3xl font-bold text-text-primary">
            Model Leaderboard
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            The Model Leaderboard evaluates raw model inference under a fixed, centrally curated context. All models receive identical inputs and cannot perform independent web search or tool use, in contrast to the{' '}
            <Link
              href="/agent-leaderboard"
              className="text-accent-primary hover:text-accent-secondary underline transition-colors"
            >
              Agent Leaderboard
            </Link>
            , which measures end-to-end agent capability with unrestricted tool access.
          </p>
        </div>

        {/* Stats Display - Right Side */}
        <div className="flex flex-col gap-2 items-end justify-end">
          {loading ? (
            <div className="animate-pulse bg-accent-tertiary rounded h-6 w-48"></div>
          ) : (
            <div className="text-xs sm:text-sm text-gray-600">
              {modelsCount-1} models · {resolvedEventsCount.toLocaleString()} resolved events in total
            </div>
          )}
          
          {/* Category dropdown under stats */}
          <DropdownSelector
            options={categories
              .filter(category =>
                availableCategories.includes(category.name as CategoryType)
              )
              .map(category => ({
                value: category.name,
                displayName: category.displayName,
                icon: <div className="h-4 w-4">{category.icon}</div>,
              }))}
            selectedValue={selectedCategory}
            onSelect={value => {
              setSelectedCategory(value as CategoryType);
            }}
            placeholder="Select a category"
            className="w-64"
          />
        </div>
      </div>

      {/* Stacked cards for Brier Score and Average Return */}
      <div className="space-y-6">
        {/* Brier Score Card */}
        <div className="relative bg-bg-primary rounded-xl p-4 sm:p-6 shadow-sm border border-accent-quaternary">
          <div className="mb-4">
            <h2 className="text-base sm:text-lg font-semibold text-text-primary mb-2">
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
            />
          </div>
        </div>

        {/* Average Return Card */}
        <div className="relative bg-bg-primary rounded-xl p-4 sm:p-6 shadow-sm border border-accent-quaternary">
          <div className="mb-4">
            <h2 className="text-base sm:text-lg font-semibold text-text-primary mb-2">
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

      {/* Custom Time Series Analysis Section */}
      <div className="mt-12 px-2 sm:px-6">
        <div className="mb-8">
          <h2 className="text-2xl sm:text-2xl font-bold text-text-primary mb-2">
            Time Series Analysis
          </h2>
          <p className="text-xs sm:text-sm text-gray-600">
            Compare models over custom time ranges
          </p>
        </div>

        {/* Time Series Chart with Metric Selector */}
        <div className="bg-bg-primary rounded-xl p-4 sm:p-6 shadow-sm border border-accent-quaternary">
          <CustomTimeSeriesChart
            brierData={processedBrierCategoryStream}
            marketReturnData={processedAverageReturnCategoryStream()}
            loading={loading}
            error={error}
            category={selectedCategory}
          />
        </div>
      </div>

      {/* About Section - Always displayed */}
      <div className="mt-8 sm:mt-12">
        <div className="max-w-4xl mx-auto">
          <div className="p-4 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-text-primary mb-4 text-center">
              About Our Scoring System
            </h2>
            <p className="text-text-primary text-lg leading-relaxed text-center">
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

      {/* Add Your Model Button - Fixed at bottom left above bug button */}
      <Link
        href="/onboarding"
        className="group fixed bottom-16 left-4 z-50 text-white h-9 rounded-full shadow-sm transition-all duration-300 flex items-center justify-start overflow-hidden w-9 hover:w-36 hover:animate-none"
        title="Add Your Model"
        style={{
          backgroundColor: '#6397C7',
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
          Add Your Model
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
