"use client";

import { useState, useCallback } from "react";
import EventLoader from "@/components/arena/EventLoader";
import DropdownSelector from "@/components/arena/DropdownSelector";
import SearchBar from "@/components/arena/SearchBar";
import ArenaLayout from "@/components/arena/ArenaLayout";

export default function Markets() {
  const [selectedTopic, setSelectedTopic] = useState("All");
  const [sortBy, setSortBy] = useState("updated_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [eventType, setEventType] = useState<"live" | "historical">("live");
  const [searchQuery, setSearchQuery] = useState("");
  const [resetTrigger, setResetTrigger] = useState(0);

  const topics = [
    {
      name: "All",
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
      name: "Politics",
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
      name: "Economics",
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
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
    },
    {
      name: "Crypto",
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
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      name: "Sports",
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
    {
      name: "Entertainment",
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
            d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 001 1v14a1 1 0 001 1z"
          />
        </svg>
      ),
    },
  ];

  // Responsive handlers with immediate UI feedback
  const handleTopicSelect = useCallback((topicName: string) => {
    setSelectedTopic(topicName);
    // The EventLoader will handle immediate loading state via beginFetch()
  }, []);

  const handleSortByChange = useCallback((value: string) => {
    setSortBy(value);
    // The EventLoader will handle immediate loading state via beginFetch()
  }, []);

  const handleSortOrderChange = useCallback((value: string) => {
    setSortOrder(value);
    // The EventLoader will handle immediate loading state via beginFetch()
  }, []);

  const handleEventTypeToggle = useCallback(() => {
    setEventType(prev => prev === "live" ? "historical" : "live");
    // The EventLoader will handle immediate loading state via beginFetch()
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    // The EventLoader will handle immediate loading state via beginSearch()
  }, []);

  const handleClearFilters = useCallback(() => {
    setSelectedTopic("All");
    setSortBy("updated_at");
    setSortOrder("desc");
    setEventType("live");
    setSearchQuery("");
    setResetTrigger(prev => prev + 1);
    // The EventLoader will handle immediate loading state via beginFetch()
  }, []);

  return (
    <ArenaLayout>
    <div className="bg-bg-secondary">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-3">
        {/* Top Row: Search Bar Only */}
        <div className="mb-3 sm:mb-4">
          {/* Search Bar */}
          <SearchBar 
            onSearch={handleSearch}
            placeholder="Search events by title, topic, ticker, or markets..."
            resetTrigger={resetTrigger}
          />
        </div>

        {/* Bottom Row: Filter Controls */}
        <div className="flex flex-wrap items-stretch md:items-center md:flex-nowrap md:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap md:flex-nowrap flex-1">
            {/* Topic Filter */}
            <div className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto">
              <label className="text-sm font-medium text-text-primary hidden sm:block md:inline md:whitespace-nowrap">
                Topic:
              </label>
              <DropdownSelector
                options={topics.map(topic => ({
                  value: topic.name,
                  displayName: topic.name,
                  icon: <div className="h-4 w-4">{topic.icon}</div>
                }))}
                selectedValue={selectedTopic}
                onSelect={handleTopicSelect}
                label=""
                placeholder="Select a topic"
                className="w-full sm:w-48"
              />
            </div>

            {/* Sort By */}
            <div className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto">
              <label className="text-sm font-medium text-text-primary hidden sm:block md:inline md:whitespace-nowrap">
                Sort by:
              </label>
              <select
                value={sortBy}
                onChange={(e) => handleSortByChange(e.target.value)}
                className="px-3 py-2 rounded-lg bg-bg-primary text-text-primary border border-accent-quaternary focus:outline-none focus:ring-2 focus:ring-accent-primary w-full sm:min-w-[140px]"
              >
                <option value="volume">Volume</option>
                <option value="close_time">Close Time</option>
                <option value="liquidity">Liquidity</option>
                <option value="updated_at">Last Updated</option>
              </select>
            </div>

            {/* Sort Order */}
            <div className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto">
              <label className="text-sm font-medium text-text-primary hidden sm:block md:inline md:whitespace-nowrap">
                Order:
              </label>
              <select
                value={sortOrder}
                onChange={(e) => handleSortOrderChange(e.target.value)}
                className="px-3 py-2 rounded-lg bg-bg-primary text-text-primary border border-accent-quaternary focus:outline-none focus:ring-2 focus:ring-accent-primary w-full sm:min-w-[120px]"
              >
                <option value="desc">High to Low</option>
                <option value="asc">Low to High</option>
              </select>
            </div>
          </div>

          {/* Live/Historical Toggle - Desktop */}
          <div className="hidden md:flex items-center">
            <label className="flex items-center">
              <span
                className={`mr-2 text-sm font-medium ${
                  eventType === "live"
                    ? "text-accent-primary"
                    : "text-text-primary"
                }`}
              >
                Live
              </span>
              <input
                type="checkbox"
                checked={eventType === "historical"}
                onChange={handleEventTypeToggle}
                className="sr-only peer"
              />
              <div className="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-accent-primary"></div>
              <span
                className={`ms-3 text-sm font-medium ${
                  eventType === "historical"
                    ? "text-accent-primary"
                    : "text-text-primary"
                }`}
              >
                Historical
              </span>
            </label>
          </div>

          {/* Live/Historical Toggle - Mobile */}
          <div className="flex md:hidden w-full sm:w-auto rounded-lg overflow-hidden border border-accent-quaternary">
            {[
              { key: 'live', label: 'Live' },
              { key: 'historical', label: 'Past' }
            ].map(option => (
              <button
                key={option.key}
                onClick={() => setEventType(option.key as 'live' | 'historical')}
                className={`
                  flex-1 px-3 py-2 text-sm font-medium transition-colors
                  ${eventType === option.key 
                    ? 'bg-accent-primary text-white' 
                    : 'bg-bg-primary text-text-primary hover:bg-accent-quaternary'
                  }
                `}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Markets Grid */}
        <div className="bg-bg-primary rounded-lg sm:rounded-2xl">
          <div className="p-0 sm:p-6">
            <EventLoader
              initialTopic={selectedTopic}
              initialSortBy={sortBy}
              showFilters={false}
              showSearch={false}
              externalTopic={selectedTopic}
              externalSortBy={sortBy}
              externalSortOrder={sortOrder}
              externalEventType={eventType}
              respectToggleWhenSearching={true}
              externalSearchQuery={searchQuery}
              removeContainerPadding={true}
            />
          </div>
        </div>
      </div>
    </div>
    </ArenaLayout>
  );
}
