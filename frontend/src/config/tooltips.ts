export interface TooltipConfig {
  title: string;
  description: string;
}

export const TOOLTIP_CONFIG: Record<string, TooltipConfig> = {
  'brier-score': {
    title: 'Brier Score',
    description: 'The Brier score measures the statistical accuracy of a probabilistic prediction by computing the mean squared difference between the prediction and empirical outcome distribution. Below we report <strong>1 − Brier</strong> score, so higher values indicate better accuracy and calibration.'
  },
  
  'average-return': {
    title: 'Average Return',
    description: 'Average Return measures the decision value of a probabilistic prediction by simulating the expected profit of an optimal betting strategy based on the prediction, under the market conditions at the time of prediction and a specified level of risk aversion.'
  },
  
  'risk-aversion': {
    title: 'Risk Aversion Level',
    description: 'Controls the betting strategy used to calculate average return. In short, higher risk aversion level means more safe bets with lower potential returns.'
  },
  
  'market-baseline-tooltip': {
    title: 'Market Baseline',
    description: 'Represents the consensus belief of human forecasters, derived from market-implied probabilities based on prediction market odds, serving as a baseline to evaluate the performance of collective human judgment against individual AI models.'
  }
};

export const getTooltipConfig = (key: string): TooltipConfig | null => {
  return TOOLTIP_CONFIG[key] || null;
}; 