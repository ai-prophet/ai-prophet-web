'use client';

import { useState, useEffect } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
  value?: string; // Add controlled value prop
  resetTrigger?: number; // Keep for backwards compatibility
}

export default function SearchBar({ 
  onSearch, 
  placeholder = "Search events...",
  className = "",
  value,
  resetTrigger = 0
}: SearchBarProps) {
  const [internalQuery, setInternalQuery] = useState('');
  
  // Use controlled value if provided, otherwise use internal state
  const query = value !== undefined ? value : internalQuery;
  const setQuery = value !== undefined ? onSearch : setInternalQuery;

  // Reset query when resetTrigger changes (backwards compatibility)
  useEffect(() => {
    if (resetTrigger > 0 && value === undefined) {
      setInternalQuery('');
    }
  }, [resetTrigger, value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (value !== undefined) {
      // Controlled mode: call onSearch immediately for real-time updates
      onSearch(newValue);
    } else {
      // Uncontrolled mode: update internal state
      setInternalQuery(newValue);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value === undefined) {
      // Only call onSearch on submit in uncontrolled mode
      onSearch(query.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (value === undefined) {
        // Only call onSearch on enter in uncontrolled mode
        onSearch(query.trim());
      }
    }
  };

  const handleClear = () => {
    if (value !== undefined) {
      // Controlled mode: call onSearch with empty string
      onSearch('');
    } else {
      // Uncontrolled mode: clear internal state and call onSearch
      setInternalQuery('');
      onSearch('');
    }
  };

  const handleSearchClick = () => {
    if (value === undefined) {
      // Only call onSearch on click in uncontrolled mode
      onSearch(query.trim());
    }
  };

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg 
            className="h-5 w-5 text-text-secondary"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
            />
          </svg>
        </div>
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-10 pr-20 py-3 border border-accent-quaternary rounded-lg bg-bg-primary text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent transition-colors"
        />
        <div className="absolute inset-y-0 right-0 flex items-center">
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="pr-2 text-text-primary hover:text-accent-primary transition-colors"
            >
              <svg 
                className="h-4 w-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M6 18L18 6M6 6l12 12" 
                />
              </svg>
            </button>
          )}
          <button
            type="submit"
            onClick={handleSearchClick}
            className="pr-3 text-text-primary hover:text-accent-primary transition-colors"
          >
            <svg 
              className="h-5 w-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
              />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}