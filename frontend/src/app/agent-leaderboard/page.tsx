'use client';

import React, { useState, useEffect } from 'react';
import LeaderboardView from "@/components/arena/LeaderboardView";
import { getApiUrl } from "@/config/api";
import {
  getProviderConfig,
  getProviderFromModelName,
  DEFAULT_PROVIDER_CONFIG,
} from "@/config/providers";
import type { CiData, TimeSeriesData, CategoryStream } from "@/types";
import { isModelConfigured, MODEL_CONFIG } from "@/config/models";
import { getTooltipConfig } from "@/config/tooltips";
import Link from 'next/link';
import ArenaLayout from "@/components/arena/ArenaLayout";

// Types for the API response - Agent LLMs
interface AgentModelData {
  name: string;
  brier?: number;
  brier_detail?: TimeSeriesData;
  average_return?: { [risk: string]: TimeSeriesData };
  rank?: number;
  is_agent: boolean;
  resolved_events?: number;
  num_events?: number; // Number of events the agent was scored on (from backend)
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

interface AgentApiResponse {
  message: string;
  data: {
    models: AgentModelData[];
    agent_models?: AgentModelData[];
  };
  status: string;
}

export default function AgentLeaderboard() {
  const [data, setData] = useState<AgentModelData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resolvedEventsCount, setResolvedEventsCount] = useState<number>(0);
  const [modelsCount, setModelsCount] = useState<number>(0);

  // Rankings state
  const [rankingRiskLevel, setRankingRiskLevel] = useState<string>('0');

  // Fetch resolved events count for agent predictions
  const fetchResolvedEventsCount = async () => {
    try {
      // Use agent-specific count endpoint that only counts events with agent predictions
      const response = await fetch(getApiUrl('/events/stats/agent-count?resolved_type=resolved'));
      if (response.ok) {
        const result = await response.json();
        // Use the total count of unique events with any agent prediction
        setResolvedEventsCount(result.data?.count || 0);
      }
    } catch (err) {
      console.warn('Failed to fetch resolved events count:', err);
    }
  };


  // Flag to control whether to use hardcoded CSV data or fetch from API
  // Set to false to use live data from the scoring service
  const USE_HARDCODED_CSV_DATA = false;

  // New data - Agent models only with latest rankings and event counts
  const hardcodedCsvData = [
    { predictor_name: 'agent-gemini-3', scoring_rule: 'brier_category_stream', risk_aversion: '', category: 'overall', timestamp: '2026-01-08', score: 0.843395, rank: 1, resolved_events: 281, ci: '±0.0182' },
    { predictor_name: 'agent-market-baseline', scoring_rule: 'brier_category_stream', risk_aversion: '', category: 'overall', timestamp: '2026-01-08', score: 0.829197, rank: 2, resolved_events: 334, ci: '±0.0160' },
    { predictor_name: 'agent-ag2-gpt5.2', scoring_rule: 'brier_category_stream', risk_aversion: '', category: 'overall', timestamp: '2026-01-08', score: 0.820846, rank: 3, resolved_events: 231, ci: '±0.0172' },
    { predictor_name: 'agent-gpt-5', scoring_rule: 'brier_category_stream', risk_aversion: '', category: 'overall', timestamp: '2026-01-08', score: 0.815882, rank: 4, resolved_events: 333, ci: '±0.0156' },
    { predictor_name: 'agent-o3', scoring_rule: 'brier_category_stream', risk_aversion: '', category: 'overall', timestamp: '2026-01-08', score: 0.813549, rank: 5, resolved_events: 332, ci: '±0.0142' },
    { predictor_name: 'agent-gpt-5.2', scoring_rule: 'brier_category_stream', risk_aversion: '', category: 'overall', timestamp: '2026-01-08', score: 0.810745, rank: 6, resolved_events: 85, ci: '±0.0354' },
    { predictor_name: 'agent-ag2-gpt4.1', scoring_rule: 'brier_category_stream', risk_aversion: '', category: 'overall', timestamp: '2026-01-08', score: 0.803567, rank: 7, resolved_events: 299, ci: '±0.0180' },
    { predictor_name: 'agent-foresight-v2', scoring_rule: 'brier_category_stream', risk_aversion: '', category: 'overall', timestamp: '2026-01-08', score: 0.802834, rank: 8, resolved_events: 82, ci: '±0.0259' },

    { predictor_name: 'agent-ag2-gpt4.1', scoring_rule: 'average_return_category_stream', risk_aversion: '0', category: 'overall', timestamp: '2026-01-08', score: 0.953524, rank: 1, resolved_events: 299, ci: '±0.4161' },
    { predictor_name: 'agent-gpt-5', scoring_rule: 'average_return_category_stream', risk_aversion: '0', category: 'overall', timestamp: '2026-01-08', score: 0.843133, rank: 2, resolved_events: 333, ci: '±0.2390' },
    { predictor_name: 'agent-gemini-3', scoring_rule: 'average_return_category_stream', risk_aversion: '0', category: 'overall', timestamp: '2026-01-08', score: 0.843103, rank: 3, resolved_events: 281, ci: '±0.2647' },
    { predictor_name: 'agent-ag2-gpt5.2', scoring_rule: 'average_return_category_stream', risk_aversion: '0', category: 'overall', timestamp: '2026-01-08', score: 0.816562, rank: 4, resolved_events: 231, ci: '±0.3528' },
    { predictor_name: 'agent-o3', scoring_rule: 'average_return_category_stream', risk_aversion: '0', category: 'overall', timestamp: '2026-01-08', score: 0.771619, rank: 5, resolved_events: 332, ci: '±0.2482' },
    { predictor_name: 'agent-foresight-v2', scoring_rule: 'average_return_category_stream', risk_aversion: '0', category: 'overall', timestamp: '2026-01-08', score: 0.748842, rank: 6, resolved_events: 82, ci: '±0.2118' },
    { predictor_name: 'agent-market-baseline', scoring_rule: 'average_return_category_stream', risk_aversion: '0', category: 'overall', timestamp: '2026-01-08', score: 0.651636, rank: 7, resolved_events: 334, ci: '±0.0853' },
    { predictor_name: 'agent-gpt-5.2', scoring_rule: 'average_return_category_stream', risk_aversion: '0', category: 'overall', timestamp: '2026-01-08', score: 0.635616, rank: 8, resolved_events: 85, ci: '±0.2014' },
  ];

  // Transform CSV data into the expected AgentModelData format
  const transformCsvToAgentData = (csvData: any[]): AgentModelData[] => {
    const agentMap = new Map<string, AgentModelData>();

    csvData.forEach(row => {
      const agentName = row.predictor_name;

      if (!agentMap.has(agentName)) {
        // Extract provider from agent name
        let provider = getProviderFromModelName(agentName);
        if (!provider) {
          // Fallback for agent models that don't match the pattern
          if (agentName === 'agent-market-baseline') provider = 'agent-market-baseline';
          else if (agentName.includes('ag2')) provider = 'ag2';
          else if (agentName.includes('gpt-5')) provider = 'openai';
          else if (agentName.includes('o3')) provider = 'openai';
          else if (agentName.includes('o3-deep-research')) provider = 'openai';
          else if (agentName.includes('foresight')) provider = 'lightningrodlabs';
          else provider = 'openai'; // default
        }

        const providerConfig = getProviderConfig(provider) || DEFAULT_PROVIDER_CONFIG;

        agentMap.set(agentName, {
          name: agentName,
          brier: undefined,
          average_return: {},
          rank: undefined,
          is_agent: true,
          resolved_events: row.resolved_events || 0,
          details: {
            provider: provider,
            release_year: '2024',
          },
          brier_category_stream: {},
          average_return_category_stream: {},
          brier_category: {},
          average_return_category: {},
          providerConfig: {
            logoPath: providerConfig.logoPath,
            color: providerConfig.color,
            displayName: providerConfig.displayName,
          },
        });
      }

      const agent = agentMap.get(agentName)!;

      if (row.scoring_rule === 'brier_category_stream') {
        // Handle Brier score data
        const ciData = row.ci ? { '90% ci': row.ci } : undefined;
        if (row.category === 'overall') {
          agent.brier = row.score;
          agent.rank = row.rank;
          agent.brier_detail = {
            score: row.score,
            rank: row.rank,
            ci: ciData,
          };
        }
        agent.brier_category![row.category] = {
          score: row.score,
          rank: row.rank,
          ci: ciData,
        };
        agent.brier_category_stream![row.category] = {
          [row.timestamp]: {
            score: row.score,
            rank: row.rank,
            ci: ciData,
          },
        };
      } else if (row.scoring_rule === 'average_return_category_stream') {
        // Handle Average Return data
        // Convert risk_aversion to match slider values exactly
        let riskLevel = row.risk_aversion || '0';
        // Convert to number first to handle floating point precision, then back to string
        const numValue = parseFloat(riskLevel);
        riskLevel = numValue.toString();

        if (!agent.average_return![riskLevel]) {
          agent.average_return![riskLevel] = { score: 0, rank: 0 };
        }

        const ciData = row.ci ? { '90% ci': row.ci } : undefined;
        if (row.category === 'overall') {
          agent.average_return![riskLevel] = {
            score: row.score,
            rank: row.rank,
            ci: ciData,
          };
        }

        if (!agent.average_return_category![riskLevel]) {
          agent.average_return_category![riskLevel] = {};
        }
        agent.average_return_category![riskLevel][row.category] = {
          score: row.score,
          rank: row.rank,
          ci: ciData,
        };

        if (!agent.average_return_category_stream![riskLevel]) {
          agent.average_return_category_stream![riskLevel] = {};
        }
        if (!agent.average_return_category_stream![riskLevel][row.category]) {
          agent.average_return_category_stream![riskLevel][row.category] = {};
        }
        agent.average_return_category_stream![riskLevel][row.category][row.timestamp] = {
          score: row.score,
          rank: row.rank,
          ci: ciData,
        };
      }
    });

    return Array.from(agentMap.values());
  };

  // Note: We now get num_events directly from the scoring service API instead of hardcoding

  const toTimeSeriesData = (
    candidate: any,
    fallbackRank = 0
  ): TimeSeriesData | undefined => {
    if (!candidate || typeof candidate !== 'object') {
      return undefined;
    }
    if (!('score' in candidate)) {
      return undefined;
    }
    const maybeScore =
      typeof candidate.score === 'number'
        ? candidate.score
        : Number(candidate.score);
    if (!Number.isFinite(maybeScore)) {
      return undefined;
    }
    const rankSource = candidate.rank;
    const rankValue =
      typeof rankSource === 'number'
        ? rankSource
        : Number(rankSource ?? fallbackRank) || fallbackRank;
    const ciValue =
      candidate.ci && typeof candidate.ci === 'object'
        ? (candidate.ci as CiData)
        : undefined;
    return {
      score: maybeScore,
      rank: rankValue,
      ci: ciValue,
    };
  };

  // Transform backend API data into the expected AgentModelData format
  const transformApiDataToAgentData = (apiModels: any[]): AgentModelData[] => {
    return apiModels.map(model => {
      // Extract provider from agent name
      let provider = getProviderFromModelName(model.name);
      if (!provider) {
        // Fallback for agent models that don't match the pattern
        if (model.name === 'agent-market-baseline') provider = 'agent-market-baseline';
        else if (model.name.includes('ag2')) provider = 'ag2';
        else if (model.name.includes('gpt-5')) provider = 'openai';
        else if (model.name.includes('o3')) provider = 'openai';
        // else if (model.name.includes('o3-deep-research')) provider = 'openai';
        else if (model.name.includes('foresight')) provider = 'lightningrodlabs';
        else provider = 'openai'; // default
      }

      const providerConfig = getProviderConfig(provider) || DEFAULT_PROVIDER_CONFIG;

      // Extract score data - backend may have both flattened fields and nested score structure
      const score = model.score || {};

      // Extract brier score - backend already flattens brier and brier_detail at top level
      const brierDetail =
        toTimeSeriesData(model.brier_detail) ||
        toTimeSeriesData(score.brier_detail) ||
        (typeof score.brier === 'object' ? toTimeSeriesData(score.brier) : undefined);

      const brierScoreFromScore =
        typeof score.brier === 'number'
          ? score.brier
          : (typeof score.brier === 'object' && typeof score.brier.score === 'number'
            ? score.brier.score
            : undefined);

      const rawBrier =
        model.brier ??
        brierDetail?.score ??
        brierScoreFromScore ??
        (typeof score.brier_detail === 'object' && typeof score.brier_detail.score === 'number'
          ? score.brier_detail.score
          : undefined);

      const brier =
        typeof rawBrier === 'number' && Number.isFinite(rawBrier) ? rawBrier : 0;

      const brierRank =
        model.rank ??
        brierDetail?.rank ??
        (typeof score.brier === 'object' && typeof score.brier.rank === 'number'
          ? score.brier.rank
          : undefined) ??
        (typeof score.brier_detail === 'object' && typeof score.brier_detail.rank === 'number'
          ? score.brier_detail.rank
          : undefined);

      // Extract average return scores by risk level
      // Backend already flattens average_return at top level, organized by risk level
      const averageReturn: { [risk: string]: TimeSeriesData } = {};

      // Check top-level average_return (already flattened by backend)
      if (model.average_return && typeof model.average_return === 'object') {
        Object.keys(model.average_return).forEach(risk => {
          const riskData = model.average_return[risk];
          if (riskData && typeof riskData === 'object' && 'score' in riskData) {
            averageReturn[risk] = {
              score: riskData.score,
              rank: riskData.rank ?? 0,
              ci: riskData.ci
            };
          }
        });
      }

      // Also check nested score structure as fallback
      if (score.average_return) {
        if (typeof score.average_return === 'object') {
          Object.keys(score.average_return).forEach(risk => {
            const riskData = score.average_return[risk];
            if (riskData && typeof riskData === 'object') {
              if ('score' in riskData) {
                // Simple structure: { score: X, rank: Y }
                averageReturn[risk] = {
                  score: riskData.score,
                  rank: riskData.rank ?? 0,
                  ci: riskData.ci
                };
              } else {
                // Nested structure, extract latest or overall value
                const keys = Object.keys(riskData);
                if (keys.length > 0) {
                  const latestKey = keys[keys.length - 1];
                  const latestData = riskData[latestKey];
                  if (latestData && typeof latestData === 'object' && 'score' in latestData) {
                    averageReturn[risk] = {
                      score: latestData.score,
                      rank: latestData.rank ?? 0,
                      ci: latestData.ci
                    };
                  }
                }
              }
            }
          });
        }
      }

      // Extract category streams - backend already flattens these at top level
      const brierCategoryStream = model.brier_category_stream ?? score.brier_category_stream ?? {};
      const averageReturnCategoryStream = model.average_return_category_stream ?? score.average_return_category_stream ?? {};

      // Extract category data (latest values from streams or direct category data)
      const brierCategory: { [category: string]: TimeSeriesData } = {};
      if (model.brier_category && typeof model.brier_category === 'object') {
        Object.keys(model.brier_category).forEach(category => {
          const catData = model.brier_category[category];
          if (catData && typeof catData === 'object' && 'score' in catData) {
            brierCategory[category] = {
              score: catData.score,
              rank: catData.rank ?? 0,
              ci: catData.ci
            };
          }
        });
      } else if (score.brier_category) {
        Object.keys(score.brier_category).forEach(category => {
          const catData = score.brier_category[category];
          if (catData && typeof catData === 'object' && 'score' in catData) {
            brierCategory[category] = {
              score: catData.score,
              rank: catData.rank ?? 0,
              ci: catData.ci
            };
          }
        });
      } else if (brierCategoryStream && typeof brierCategoryStream === 'object') {
        // Extract latest values from stream
        Object.keys(brierCategoryStream).forEach(category => {
          const stream = brierCategoryStream[category];
          if (stream && typeof stream === 'object') {
            const timestamps = Object.keys(stream).sort();
            if (timestamps.length > 0) {
              const latest = stream[timestamps[timestamps.length - 1]];
              if (latest && typeof latest === 'object' && 'score' in latest) {
                brierCategory[category] = {
                  score: latest.score,
                  rank: latest.rank ?? 0
                };
              }
            }
          }
        });
      }

      const averageReturnCategory: { [risk: string]: { [category: string]: TimeSeriesData } } = {};
      if (model.average_return_category && typeof model.average_return_category === 'object') {
        Object.keys(model.average_return_category).forEach(risk => {
          averageReturnCategory[risk] = {};
          const riskData = model.average_return_category[risk];
          if (riskData && typeof riskData === 'object') {
            Object.keys(riskData).forEach(category => {
              const catData = riskData[category];
              if (catData && typeof catData === 'object' && 'score' in catData) {
                averageReturnCategory[risk][category] = {
                  score: catData.score,
                  rank: catData.rank ?? 0,
                  ci: catData.ci
                };
              }
            });
          }
        });
      } else if (score.average_return_category) {
        Object.keys(score.average_return_category).forEach(risk => {
          averageReturnCategory[risk] = {};
          const riskData = score.average_return_category[risk];
          if (riskData && typeof riskData === 'object') {
            Object.keys(riskData).forEach(category => {
              const catData = riskData[category];
              if (catData && typeof catData === 'object' && 'score' in catData) {
                averageReturnCategory[risk][category] = {
                  score: catData.score,
                  rank: catData.rank ?? 0,
                  ci: catData.ci
                };
              }
            });
          }
        });
      } else if (averageReturnCategoryStream && typeof averageReturnCategoryStream === 'object') {
        // Extract latest values from stream
        Object.keys(averageReturnCategoryStream).forEach(risk => {
          averageReturnCategory[risk] = {};
          const riskStream = averageReturnCategoryStream[risk];
          if (riskStream && typeof riskStream === 'object') {
            Object.keys(riskStream).forEach(category => {
              const stream = riskStream[category];
              if (stream && typeof stream === 'object') {
                const timestamps = Object.keys(stream).sort();
                if (timestamps.length > 0) {
                  const latest = stream[timestamps[timestamps.length - 1]];
                  if (latest && typeof latest === 'object' && 'score' in latest) {
                    averageReturnCategory[risk][category] = {
                      score: latest.score,
                      rank: latest.rank ?? 0
                    };
                  }
                }
              }
            });
          }
        });
      }

      // Extract num_events from score object (computed by backend scoring service)
      const numEvents = score.num_events ?? model.num_events ?? model.resolved_events ?? 0;

      // Use display name from config if available, otherwise fallback to model name
      const displayName = MODEL_CONFIG[model.name]?.displayName || model.name;

      return {
        name: displayName,
        brier: brier,
        brier_detail: brierDetail,
        average_return: Object.keys(averageReturn).length > 0 ? averageReturn : undefined,
        rank: brierRank,
        is_agent: true,
        resolved_events: numEvents, // Use num_events from backend (number of events scored on)
        num_events: numEvents,
        details: {
          provider: provider,
          release_year: model.details?.release_year || '2024',
        },
        brier_category_stream: Object.keys(brierCategoryStream).length > 0 ? brierCategoryStream : undefined,
        average_return_category_stream: Object.keys(averageReturnCategoryStream).length > 0 ? averageReturnCategoryStream : undefined,
        brier_category: Object.keys(brierCategory).length > 0 ? brierCategory : undefined,
        average_return_category: Object.keys(averageReturnCategory).length > 0 ? averageReturnCategory : undefined,
        providerConfig: {
          logoPath: providerConfig.logoPath,
          color: providerConfig.color,
          displayName: providerConfig.displayName,
        },
      };
    });
  };

  // Fetch agent LLM data from backend API
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch both leaderboard data and resolved events count in parallel
      const [leaderboardResponse] = await Promise.all([
        fetch(getApiUrl('/scoring/predictors?include_agents=true&per_page=500')),
        fetchResolvedEventsCount()
      ]);

      if (!leaderboardResponse.ok) {
        throw new Error(`HTTP error! status: ${leaderboardResponse.status}`);
      }

      const result: AgentApiResponse = await leaderboardResponse.json();

      if (result.status === 'success') {
        // Use agent_models from the response, or fall back to filtering models by is_agent
        let agentModels = result.data.agent_models || [];

        // If agent_models is not available, filter models by is_agent flag or agent- prefix
        if (agentModels.length === 0 && result.data.models) {
          agentModels = result.data.models.filter((model: any) =>
            model.is_agent === true ||
            (model.name && (model.name.startsWith('agent-') || model.name === 'agent-market-baseline'))
          );
        }

        // agent-market-baseline may end up in models instead of agent_models.
        // Pull it from models if not already present.
        if (result.data.models && !agentModels.some((m: any) => m.name === 'agent-market-baseline')) {
          const marketBaselineFromApi = result.data.models.find((m: any) => m.name === 'agent-market-baseline');
          if (marketBaselineFromApi) {
            agentModels.push(marketBaselineFromApi);
          }
        }

        // Only show specific agents that are currently featured on the leaderboard
        const allowedAgentModels = [
          'agent-gemini-3',
          'agent-ag2-gpt5.2',
          'agent-gpt-5',
          'agent-o3',
          'agent-gpt-5.2',
          'agent-ag2-gpt4.1',
          'agent-foresight-v2',
          'agent-glm-4.6',
          'agent-glm-4.7',
          'agent-market-baseline'
        ];

        // Filter to only include allowed agents
        agentModels = agentModels.filter((model: any) => {
          if (!model.name) return false;
          return allowedAgentModels.includes(model.name);
        });

        console.log(`Found ${agentModels.length} agent models from API:`, agentModels.map((m: any) => m.name));

        // Transform API data to frontend format
        const processedModels = transformApiDataToAgentData(agentModels);

        // Only add agent-market-baseline if it wasn't already included from the API
        const hasMarketBaseline = processedModels.some(m => m.name === 'Market Baseline' || m.name === 'agent-market-baseline');
        if (!hasMarketBaseline) {
          // Add agent-market-baseline with hardcoded scores as fallback
          const marketBaselineProviderConfig = getProviderConfig('agent-market-baseline') || DEFAULT_PROVIDER_CONFIG;
          const marketBaselineModel: AgentModelData = {
            name: 'Market Baseline',
            brier: 0.804085,
            brier_detail: {
              score: 0.804085,
              rank: 0,
              ci: { '95.0% ci': '±0.0160' },
            },
            average_return: {
              '0': {
                score: 100.0,
                rank: 0,
              }
            },
            rank: 0,
            is_agent: false,
            resolved_events: undefined,
            num_events: undefined,
            details: {
              provider: 'agent-market-baseline',
              release_year: '2024',
            },
            brier_category_stream: undefined,
            average_return_category_stream: undefined,
            brier_category: undefined,
            average_return_category: undefined,
            providerConfig: {
              logoPath: marketBaselineProviderConfig.logoPath,
              color: marketBaselineProviderConfig.color,
              displayName: marketBaselineProviderConfig.displayName,
            },
          };
          processedModels.push(marketBaselineModel);
        }

        // Debug: Log all agent models and their scores
        console.log('Agent leaderboard models:', processedModels.map(m => ({
          name: m.name,
          hasBrier: m.brier !== undefined && m.brier !== null,
          brierValue: m.brier,
          hasAvgReturn: m.average_return !== undefined,
          avgReturnValue: m.average_return?.['0']?.score,
          numEvents: m.num_events || m.resolved_events
        })));

        setData(processedModels);
        setModelsCount(processedModels.length);
      } else {
        throw new Error(result.message || 'Failed to fetch data');
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An unknown error occurred'
      );
      console.error('Error fetching agent leaderboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (USE_HARDCODED_CSV_DATA) {
      // Use hardcoded CSV data
      setLoading(true);
      try {
        const processedModels = transformCsvToAgentData(hardcodedCsvData);
        setData(processedModels);
        setModelsCount(processedModels.length);
        // Fetch resolved events count separately
        fetchResolvedEventsCount();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'An unknown error occurred'
        );
        console.error('Error processing hardcoded CSV data:', err);
      } finally {
        setLoading(false);
      }
    } else {
      // Fetch from API
      fetchData();
    }
  }, []);

  // Process data for Brier Score ranking chart
  const processedBrierRankingData = () => {
    // Overall Brier ranking data
    const result = data
      .filter(model => model.brier !== undefined && model.brier !== null) // Filter out models with no Brier score
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

  // Process data for Average Return ranking chart
  const processedAverageReturnRankingData = () => {
    // Overall Average Return ranking data
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


  // Rankings Tab Content
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


  // Calculate minimum resolved events across all models
  const validEvents = data.filter(model => model.resolved_events && model.resolved_events > 0).map(model => model.resolved_events || Infinity);
  const minResolvedEvents = validEvents.length > 0 ? Math.min(...validEvents) : 0;

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
