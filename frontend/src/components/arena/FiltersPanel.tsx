'use client';

import { topics, sortOptions, resolvedOptions, type Query } from './eventLoaderState';

interface FiltersPanelProps {
  query: Query;
  updateFilter: (key: keyof Query, value: string) => void;
  toggleSortOrder: () => void;
  idSuffix?: string;
}

export default function FiltersPanel({
  query,
  updateFilter,
  toggleSortOrder,
  idSuffix = ''
}: FiltersPanelProps) {
  return (
    <div className="bg-surface rounded-2xl border border-edge p-6">
      <h3 className="text-lg font-semibold text-primary mb-2">Filters</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Topic Filter */}
        <div>
          <label htmlFor={`topic-filter${idSuffix}`} className="block text-sm font-medium text-primary mb-2">Topic</label>
          <select
            id={`topic-filter${idSuffix}`}
            value={query.topic}
            onChange={(e) => updateFilter('topic', e.target.value)}
            className="w-full px-3 py-2 border border-edge rounded-lg bg-surface text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent"
          >
            {topics.map((topic) => (
              <option key={topic} value={topic}>{topic}</option>
            ))}
          </select>
        </div>

        {/* Sort By */}
        <div>
          <label htmlFor={`sort-by-filter${idSuffix}`} className="block text-sm font-medium text-primary mb-2">Sort By</label>
          <select
            id={`sort-by-filter${idSuffix}`}
            value={query.sortBy}
            onChange={(e) => updateFilter('sortBy', e.target.value)}
            className="w-full px-3 py-2 border border-edge rounded-lg bg-surface text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        {/* Sort Order */}
        <div>
          <label htmlFor={`sort-order-filter${idSuffix}`} className="block text-sm font-medium text-primary mb-2">Order</label>
          <button
            id={`sort-order-filter${idSuffix}`}
            onClick={toggleSortOrder}
            className="w-full px-3 py-2 border border-edge rounded-lg bg-surface text-primary hover:bg-overlay transition-colors focus:outline-none focus:ring-2 focus:ring-accent-primary"
          >
            {query.order === 'asc' ? 'Ascending' : 'Descending'}
          </button>
        </div>

        {/* Resolved Type */}
        <div>
          <label htmlFor={`status-filter${idSuffix}`} className="block text-sm font-medium text-primary mb-2">Status</label>
          <select
            id={`status-filter${idSuffix}`}
            value={query.resolvedType}
            onChange={(e) => updateFilter('resolvedType', e.target.value)}
            className="w-full px-3 py-2 border border-edge rounded-lg bg-surface text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent"
          >
            {resolvedOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
