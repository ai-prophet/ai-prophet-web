import { getApiUrl } from './api';
import { isModelConfigured } from './models';

interface LeaderboardModelData {
  name: string;
  average_return?: { [risk: string]: { score: number; rank: number } };
}

interface LeaderboardApiResponse {
  message: string;
  data: {
    models: LeaderboardModelData[];
  };
  status: string;
}

/**
 * Fetches the leaderboard data and returns model names sorted by Average Return at risk level 0
 * This ensures consistent ordering across all components that display models
 */
export async function getLeaderboardOrder(): Promise<string[]> {
  try {
    const response = await fetch(getApiUrl('/scoring/predictors'));
    
    if (!response.ok) {
      console.warn('Failed to fetch leaderboard data, falling back to alphabetical order');
      return [];
    }

    const result: LeaderboardApiResponse = await response.json();
    
    if (result.status !== 'success') {
      console.warn('Leaderboard API returned error, falling back to alphabetical order');
      return [];
    }

    // Filter and sort models based on Average Return score at risk level 0
    const sortedModels = result.data.models
      .filter(model => isModelConfigured(model.name))
      .sort((a, b) => {
        const scoreA = a.average_return?.['0']?.score ?? 0;
        const scoreB = b.average_return?.['0']?.score ?? 0;
        // Higher scores are better (descending order)
        return scoreB - scoreA;
      })
      .map(model => model.name);

    return sortedModels;
  } catch (error) {
    console.warn('Error fetching leaderboard order:', error);
    return [];
  }
}

/**
 * Sorts an array of model names according to the leaderboard order
 * Falls back to alphabetical sorting if leaderboard order is not available
 */
export function sortModelsByLeaderboard(modelNames: string[], leaderboardOrder: string[]): string[] {
  if (leaderboardOrder.length === 0) {
    // Fallback to alphabetical order
    return [...modelNames].sort();
  }

  // Create a map for quick lookup of leaderboard positions
  const orderMap = new Map(leaderboardOrder.map((name, index) => [name, index]));
  
  return [...modelNames].sort((a, b) => {
    const posA = orderMap.get(a) ?? Number.MAX_SAFE_INTEGER;
    const posB = orderMap.get(b) ?? Number.MAX_SAFE_INTEGER;
    
    if (posA !== posB) {
      return posA - posB;
    }
    
    // If both models are not in leaderboard or have same position, sort alphabetically
    return a.localeCompare(b);
  });
}