// Shared category configuration for all leaderboard components
export const AVAILABLE_CATEGORIES = [
  'overall',
  'Politics',
  // 'Economics',
  // 'Crypto',
  'Sports',
  // "Entertainment",
] as const;

export type CategoryType = typeof AVAILABLE_CATEGORIES[number];

// Category display names
export const CATEGORY_NAMES = {
  overall: 'Overall',
  Politics: 'Politics',
  Sports: 'Sports',
} as const;