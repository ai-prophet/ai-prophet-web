import { useState, useEffect } from 'react';
import { getApiUrl } from "@/config/api";
import {
  getProviderConfig,
  getProviderFromModelName,
  DEFAULT_PROVIDER_CONFIG,
} from "@/config/providers";
import type { CiData, TimeSeriesData, CategoryStream } from "@/types";
import { MODEL_CONFIG } from "@/config/models";

export interface AgentModelData {
  name: string;
  brier?: number;
  brier_detail?: TimeSeriesData;
  average_return?: { [risk: string]: TimeSeriesData };
  rank?: number;
  is_agent: boolean;
  resolved_events?: number;
  num_events?: number;
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

function resolveProvider(name: string): string {
  let provider = getProviderFromModelName(name);
  if (!provider) {
    if (name === 'agent-market-baseline') provider = 'agent-market-baseline';
    else if (name.includes('ag2')) provider = 'ag2';
    else if (name.includes('gpt-5')) provider = 'openai';
    else if (name.includes('o3')) provider = 'openai';
    else if (name.includes('foresight')) provider = 'lightningrodlabs';
    else provider = 'openai';
  }
  return provider;
}

function transformCsvToAgentData(csvData: typeof hardcodedCsvData): AgentModelData[] {
  const agentMap = new Map<string, AgentModelData>();

  csvData.forEach(row => {
    const agentName = row.predictor_name;

    if (!agentMap.has(agentName)) {
      const provider = resolveProvider(agentName);
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
      let riskLevel = row.risk_aversion || '0';
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
}

function toTimeSeriesData(
  candidate: any,
  fallbackRank = 0
): TimeSeriesData | undefined {
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
}

function transformApiDataToAgentData(apiModels: any[]): AgentModelData[] {
  return apiModels.map(model => {
    const provider = resolveProvider(model.name);
    const providerConfig = getProviderConfig(provider) || DEFAULT_PROVIDER_CONFIG;

    const score = model.score || {};

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

    const averageReturn: { [risk: string]: TimeSeriesData } = {};

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

    if (score.average_return) {
      if (typeof score.average_return === 'object') {
        Object.keys(score.average_return).forEach(risk => {
          const riskData = score.average_return[risk];
          if (riskData && typeof riskData === 'object') {
            if ('score' in riskData) {
              averageReturn[risk] = {
                score: riskData.score,
                rank: riskData.rank ?? 0,
                ci: riskData.ci
              };
            } else {
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

    const brierCategoryStream = model.brier_category_stream ?? score.brier_category_stream ?? {};
    const averageReturnCategoryStream = model.average_return_category_stream ?? score.average_return_category_stream ?? {};

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

    const numEvents = score.num_events ?? model.num_events ?? model.resolved_events ?? 0;

    const displayName = MODEL_CONFIG[model.name]?.displayName || model.name;

    return {
      name: displayName,
      brier: brier,
      brier_detail: brierDetail,
      average_return: Object.keys(averageReturn).length > 0 ? averageReturn : undefined,
      rank: brierRank,
      is_agent: true,
      resolved_events: numEvents,
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
}

const USE_HARDCODED_CSV_DATA = false;

const ALLOWED_AGENT_MODELS = [
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

export function useAgentLeaderboardData() {
  const [data, setData] = useState<AgentModelData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resolvedEventsCount, setResolvedEventsCount] = useState<number>(0);
  const [modelsCount, setModelsCount] = useState<number>(0);

  const fetchResolvedEventsCount = async () => {
    try {
      const response = await fetch(getApiUrl('/events/stats/agent-count?resolved_type=resolved'));
      if (response.ok) {
        const result = await response.json();
        setResolvedEventsCount(result.data?.count || 0);
      }
    } catch (err) {
      console.warn('Failed to fetch resolved events count:', err);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [leaderboardResponse] = await Promise.all([
        fetch(getApiUrl('/scoring/predictors?include_agents=true&per_page=500')),
        fetchResolvedEventsCount()
      ]);

      if (!leaderboardResponse.ok) {
        throw new Error(`HTTP error! status: ${leaderboardResponse.status}`);
      }

      const result: AgentApiResponse = await leaderboardResponse.json();

      if (result.status === 'success') {
        let agentModels = result.data.agent_models || [];

        if (agentModels.length === 0 && result.data.models) {
          agentModels = result.data.models.filter((model: any) =>
            model.is_agent === true ||
            (model.name && (model.name.startsWith('agent-') || model.name === 'agent-market-baseline'))
          );
        }

        if (result.data.models && !agentModels.some((m: any) => m.name === 'agent-market-baseline')) {
          const marketBaselineFromApi = result.data.models.find((m: any) => m.name === 'agent-market-baseline');
          if (marketBaselineFromApi) {
            agentModels.push(marketBaselineFromApi);
          }
        }

        agentModels = agentModels.filter((model: any) => {
          if (!model.name) return false;
          return ALLOWED_AGENT_MODELS.includes(model.name);
        });


        const processedModels = transformApiDataToAgentData(agentModels);

        const hasMarketBaseline = processedModels.some(m => m.name === 'Market Baseline' || m.name === 'agent-market-baseline');
        if (!hasMarketBaseline) {
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
      setLoading(true);
      try {
        const processedModels = transformCsvToAgentData(hardcodedCsvData);
        setData(processedModels);
        setModelsCount(processedModels.length);
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
      fetchData();
    }
  }, []);

  return { data, loading, error, resolvedEventsCount, modelsCount, fetchData };
}
