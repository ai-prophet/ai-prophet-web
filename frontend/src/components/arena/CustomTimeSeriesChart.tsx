'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import Image from 'next/image';
import {
  getProviderConfig,
  DEFAULT_PROVIDER_CONFIG,
} from "@/config/providers";
import { niceName, isModelConfigured } from "@/config/models";

// Types for the time-series data
interface TimeSeriesData {
  score: number;
  rank: number;
}

interface CategoryStream {
  [date: string]: TimeSeriesData;
}

interface ModelProgressData {
  name: string;
  details: {
    provider: string;
    release_year: string;
  };
  category_stream?: {
    [category: string]: CategoryStream;
  };
  providerConfig?: {
    logoPath: string;
    color: string;
    displayName: string;
  };
}

interface CustomTimeSeriesChartProps {
  brierData: ModelProgressData[];
  marketReturnData: ModelProgressData[];
  loading: boolean;
  error: string | null;
  category: string;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    dataKey: string;
    payload: Record<string, unknown>;
    color: string;
  }>;
  label?: string;
}

const CustomTimeSeriesChart: React.FC<CustomTimeSeriesChartProps> = ({
  brierData,
  marketReturnData,
  loading,
  error,
  category,
}) => {
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<'4w' | '8w' | '12w' | 'all'>('12w');
  const [metric, setMetric] = useState<'brier' | 'average-return'>('brier');
  const [isMobile, setIsMobile] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isDropdownOpen && !target.closest('.model-selector-dropdown')) {
        setIsDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  // Get current data based on selected metric
  const data = useMemo(() => {
    return metric === 'brier' ? brierData : marketReturnData;
  }, [metric, brierData, marketReturnData]);

  // Get models with data for the selected category
  const modelsWithData = useMemo(() => {
    return data.filter(
      model =>
        isModelConfigured(model.name) &&
        model.category_stream?.[category] &&
        Object.keys(model.category_stream[category]).length > 0
    );
  }, [data, category]);

  // Sort models by their average score (best first)
  const sortedModels = useMemo(() => {
    return [...modelsWithData].sort((a, b) => {
      const aStream = a.category_stream?.[category];
      const bStream = b.category_stream?.[category];
      
      if (!aStream || !bStream) return 0;
      
      const aScores = Object.values(aStream).map(d => d.score);
      const bScores = Object.values(bStream).map(d => d.score);
      
      const aAvg = aScores.reduce((sum, s) => sum + s, 0) / aScores.length;
      const bAvg = bScores.reduce((sum, s) => sum + s, 0) / bScores.length;
      
      // For both brier (displayed as 1-brier) and average-return, higher is better
      return bAvg - aAvg;
    });
  }, [modelsWithData, category, metric]);

  // Auto-select top 3 models on initial load or when metric changes
  useEffect(() => {
    if (sortedModels.length > 0) {
      const topModels = sortedModels.slice(0, Math.min(3, sortedModels.length));
      setSelectedModels(topModels.map(m => m.name));
    }
  }, [sortedModels, metric]);

  // Get all available dates from selected models
  const allDates = useMemo(() => {
    const dates = new Set<string>();
    selectedModels.forEach(modelName => {
      const model = modelsWithData.find(m => m.name === modelName);
      const categoryData = model?.category_stream?.[category];
      if (categoryData) {
        Object.keys(categoryData).forEach(date => dates.add(date));
      }
    });
    return Array.from(dates).sort();
  }, [selectedModels, modelsWithData, category]);

  // Filter dates based on selected range (using weeks since data is weekly)
  const filteredDates = useMemo(() => {
    if (allDates.length === 0) return [];
    
    if (dateRange === 'all') return allDates;
    
    const now = new Date();
    let startDate: Date;
    const endDate = now;

    switch (dateRange) {
      case '4w':
        startDate = new Date(now.getTime() - 4 * 7 * 24 * 60 * 60 * 1000); // 4 weeks
        break;
      case '8w':
        startDate = new Date(now.getTime() - 8 * 7 * 24 * 60 * 60 * 1000); // 8 weeks
        break;
      case '12w':
        startDate = new Date(now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000); // 12 weeks
        break;
      default:
        return allDates;
    }

    return allDates.filter(date => {
      const d = new Date(date);
      return d >= startDate && d <= endDate;
    });
  }, [allDates, dateRange]);

  // Transform data for the chart
  const chartData = useMemo(() => {
    return filteredDates.map(date => {
      const dataPoint: Record<string, unknown> = { date };
      
      selectedModels.forEach(modelName => {
        const model = modelsWithData.find(m => m.name === modelName);
        const categoryData = model?.category_stream?.[category];
        if (categoryData && categoryData[date]) {
          dataPoint[modelName] = categoryData[date].score;
        }
      });
      
      return dataPoint;
    });
  }, [filteredDates, selectedModels, modelsWithData, category]);

  // Handle model selection toggle
  const toggleModel = (modelName: string) => {
    setSelectedModels(prev => {
      if (prev.includes(modelName)) {
        return prev.filter(m => m !== modelName);
      } else {
        return [...prev, modelName];
      }
    });
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-bg-primary border border-accent-secondary rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-text-primary mb-2">{label}</p>
          {payload
            .sort((a, b) => b.value - a.value) // Higher is better for both metrics
            .map((entry, index) => {
              const model = modelsWithData.find(m => m.name === entry.dataKey);
              return (
                <div key={index} className="flex items-center gap-2 mb-1">
                  {model?.providerConfig?.logoPath && (
                    <div className="w-3 h-3 relative flex-shrink-0">
                      <Image
                        src={model.providerConfig.logoPath}
                        alt={model.providerConfig.displayName}
                        fill
                        style={{ objectFit: 'contain' }}
                        sizes="12px"
                      />
                    </div>
                  )}
                  <span className="text-sm" style={{ color: entry.color }}>
                    {niceName(entry.dataKey) || entry.dataKey}: {
                      metric === 'average-return'
                        ? `${(entry.value * 100 + 100).toFixed(2)}%`
                        : entry.value.toFixed(4)
                    }
                  </span>
                </div>
              );
            })}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-red-500">Error loading data: {error}</div>
      </div>
    );
  }

  if (modelsWithData.length === 0) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-gray-500">No data available for this category</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">
        {/* Metric Selector */}
        <div className="w-full lg:w-48">
          <label className="block text-sm font-medium text-text-primary mb-2">
            Metric
          </label>
          <select
            value={metric}
            onChange={(e) => setMetric(e.target.value as 'brier' | 'average-return')}
            className="w-full px-4 py-2 bg-bg-primary border border-accent-quaternary rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary hover:border-accent-secondary transition-colors"
          >
            <option value="brier">Brier Score</option>
            <option value="average-return">Market Return</option>
          </select>
        </div>

        {/* Time Range Selector */}
        <div className="w-full lg:w-48">
          <label className="block text-sm font-medium text-text-primary mb-2">
            Time Range
          </label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as '4w' | '8w' | '12w' | 'all')}
            className="w-full px-4 py-2 bg-bg-primary border border-accent-quaternary rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary hover:border-accent-secondary transition-colors"
          >
            <option value="4w">Last 4 weeks</option>
            <option value="8w">Last 8 weeks</option>
            <option value="12w">Last 12 weeks</option>
            <option value="all">All time</option>
          </select>
        </div>

        {/* Model Selector */}
        <div className="flex-1 w-full lg:w-auto">
          <label className="block text-sm font-medium text-text-primary mb-2">
            Select Models
          </label>
          <div className="relative model-selector-dropdown">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full px-4 py-2 bg-bg-primary border border-accent-quaternary rounded-lg text-left flex items-center justify-between hover:border-accent-secondary transition-colors"
            >
              <span className="text-sm text-text-primary">
                {selectedModels.length === 0 
                  ? 'Select models...'
                  : `${selectedModels.length} model${selectedModels.length > 1 ? 's' : ''} selected`
                }
              </span>
              <svg
                className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {isDropdownOpen && (
              <div className="absolute z-50 w-full mt-1 bg-bg-primary border border-accent-quaternary rounded-lg shadow-lg max-h-80 overflow-y-auto">
                {sortedModels.map(model => {
                  const isSelected = selectedModels.includes(model.name);
                  
                  return (
                    <button
                      key={model.name}
                      onClick={() => toggleModel(model.name)}
                      className={`
                        w-full px-4 py-3 flex items-center gap-3 hover:bg-accent-tertiary transition-colors text-left cursor-pointer
                        ${isSelected ? 'bg-accent-tertiary' : ''}
                      `}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="w-4 h-4 rounded accent-accent-primary"
                      />
                      {model.providerConfig?.logoPath && (
                        <div className="w-5 h-5 relative flex-shrink-0">
                          <Image
                            src={model.providerConfig.logoPath}
                            alt={model.providerConfig.displayName}
                            fill
                            style={{ objectFit: 'contain' }}
                            sizes="20px"
                          />
                        </div>
                      )}
                      <span className="text-sm font-medium text-text-primary flex-1">
                        {niceName(model.name) || model.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chart */}
      {selectedModels.length === 0 ? (
        <div className="flex justify-center items-center h-96 bg-accent-tertiary rounded-lg">
          <p className="text-text-primary">Please select at least one model to display</p>
        </div>
      ) : chartData.length === 0 ? (
        <div className="flex justify-center items-center h-96 bg-accent-tertiary rounded-lg">
          <p className="text-text-primary">No data available for the selected date range</p>
        </div>
      ) : (
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={isMobile ? {
                top: 10,
                right: 5,
                left: 5,
                bottom: 80,
              } : {
                top: 20,
                right: 30,
                left: 20,
                bottom: 100,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E9F5" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: isMobile ? 8 : 10, fill: '#141414' }}
                angle={-45}
                textAnchor="end"
                height={isMobile ? 50 : 60}
                interval={Math.max(0, Math.floor(chartData.length / (isMobile ? 6 : 8)))}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#141414' }}
                domain={['auto', 'auto']}
                hide={isMobile}
              />
              <Tooltip
                content={<CustomTooltip />}
                wrapperStyle={{ zIndex: 1000 }}
              />
              <Legend
                verticalAlign="bottom"
                height={isMobile ? 30 : 50}
                iconType="line"
                wrapperStyle={{ 
                  paddingTop: isMobile ? '10px' : '20px',
                  fontSize: isMobile ? '10px' : '12px'
                }}
              />

              {selectedModels.map(modelName => {
                const model = modelsWithData.find(m => m.name === modelName);
                if (!model) return null;
                
                const providerConfig =
                  getProviderConfig(model.details.provider) ||
                  DEFAULT_PROVIDER_CONFIG;
                
                return (
                  <Line
                    key={modelName}
                    type="monotone"
                    dataKey={modelName}
                    name={niceName(modelName) || modelName}
                    stroke={providerConfig.color}
                    strokeWidth={2}
                    dot={{ fill: providerConfig.color, strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: providerConfig.color }}
                    connectNulls={false}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default CustomTimeSeriesChart;

