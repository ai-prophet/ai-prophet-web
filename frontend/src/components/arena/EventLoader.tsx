'use client';

import { useState, useEffect, useCallback, useRef, useMemo, useReducer } from 'react';
import EventCard, { Event } from "@/components/arena/EventCard";
import LoadingSpinner from "@/components/arena/LoadingSpinner";
import SearchBar from "@/components/arena/SearchBar";
import FiltersPanel from "@/components/arena/FiltersPanel";
import { getApiUrl } from '@/config/api';
import {
  reducer,
  type Query,
  type ResolvedType,
  type FetchKind,
} from './eventLoaderState';

interface EventLoaderProps {
  initialTopic?: string;
  initialSortBy?: string;
  showFilters?: boolean;
  showSearch?: boolean;
  externalTopic?: string;
  externalSortBy?: string;
  externalSortOrder?: string;
  externalEventType?: 'live' | 'historical';
  respectToggleWhenSearching?: boolean;
  externalSearchQuery?: string;
  removeContainerPadding?: boolean;
}

export default function EventLoader({
  initialTopic = 'All',
  initialSortBy = 'close_time',
  showFilters = true,
  showSearch = false,
  externalTopic,
  externalSortBy,
  externalSortOrder,
  externalEventType,
  respectToggleWhenSearching = false,
  externalSearchQuery,
  removeContainerPadding = false
}: EventLoaderProps) {
  const [state, dispatch] = useReducer(reducer, {
    status: 'initial',
    events: [],
    query: {
      topic: externalTopic ?? initialTopic,
      sortBy: externalSortBy ?? initialSortBy,
      order: externalSortOrder === 'desc' ? 'desc' : 'asc',
      resolvedType: externalEventType === 'historical' ? 'resolved' : 'open',
      search: externalSearchQuery ?? '',
    },
    pagination: { cursor: null, hasMore: true, total: 0 },
    error: null,
  });

  const abortRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);

  // Derived selectors
  const selectors = useMemo(() => ({
    isInitial: state.status === 'initial',
    isSearching: state.status === 'searching',
    isLoading: ['initial', 'refreshing', 'searching', 'loadingMore'].includes(state.status),
    isLoadingMore: state.status === 'loadingMore',
    isIdle: state.status === 'idle',
    isBackendDown: state.status === 'backendDown',
    hasError: state.status === 'error',
    effectiveResolvedType: (() => {
      const hasSearch = state.query.search.trim().length > 0;
      return hasSearch && !respectToggleWhenSearching ? 'all' : state.query.resolvedType;
    })() as ResolvedType
  }), [state.status, state.query.search, respectToggleWhenSearching, state.query.resolvedType]);

  const getEvents = useCallback(
    async (kind: FetchKind) => {
      // Prevent auto-spam if backend is down; allow explicit retry
      if (state.status === 'backendDown' && !['loadMore', 'refresh', 'search'].includes(kind)) return;

      // Abort any in-flight request
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const reset = ['initial', 'refresh', 'search'].includes(kind);
      const cursor = reset ? null : state.pagination.cursor;

      dispatch({ type: 'START_FETCH', kind });
      const thisReq = ++requestIdRef.current;

      try {
        const params = new URLSearchParams({
          cursor: cursor ?? 'null',
          sort_by: state.query.sortBy,
          topic: state.query.topic === 'All' ? 'All' : state.query.topic,
          order: state.query.order.toUpperCase(),
          resolved_type: selectors.effectiveResolvedType,
          limit: '30',
          include_predictions: 'true',
        });

        if (state.query.search.trim()) {
          params.set('search', state.query.search.trim());
        }


        const response = await fetch(`${getApiUrl('/events/paginated')}?${params.toString()}`, {
          signal: controller.signal
        });

        if (!response.ok) {
          dispatch({
            type: 'FAIL',
            error: { code: 'BACKEND_DOWN', message: 'Service temporarily unavailable' }
          });
          return;
        }

        const responseJson = await response.json();

        // Ignore stale responses
        if (thisReq !== requestIdRef.current) return;

        // Transform backend API response to match expected Event format
        const data: Event[] = (responseJson?.data ?? []).map((event: any) => ({
          event_ticker: event.event_ticker,
          series_ticker: event.event_ticker,
          title: event.title,
          topic: event.category || "Uncategorized",
          close_time: event.close_time,
          event_result: event.market_outcome,
          markets: event.markets,
          volume: event.volume,
          liquidity: event.liquidity,
          updated_at: event.updated_at,
          top_markets: event.top_markets || [],
        }));



        dispatch({
          type: 'SUCCESS',
          payload: {
            data,
            nextCursor: responseJson.next_last_seen || null,
            end: !!responseJson.end,
            totalCount: responseJson.total_count || 0,
            reset,
          },
        });
      } catch (error: any) {
        if (error?.name === 'AbortError') return;

        console.error('Error fetching events:', error);
        dispatch({
          type: 'FAIL',
          error: { code: 'NETWORK', message: 'Failed to fetch events' },
        });
      }
    },
    [state.status, state.pagination.cursor, state.query, selectors.effectiveResolvedType]
  );

  // External prop changes → translate into query changes
  useEffect(() => {
    const next: Partial<Query> = {};
    let changed = false;

    if (externalTopic !== undefined && externalTopic !== state.query.topic) {
      next.topic = externalTopic;
      changed = true;
    }
    if (externalSortBy !== undefined && externalSortBy !== state.query.sortBy) {
      next.sortBy = externalSortBy;
      changed = true;
    }
    if (externalSortOrder !== undefined) {
      const order = externalSortOrder === 'desc' ? 'desc' : 'asc';
      if (order !== state.query.order) {
        next.order = order;
        changed = true;
      }
    }
    if (externalEventType !== undefined) {
      const resolvedType: ResolvedType = externalEventType === 'historical' ? 'resolved' : 'open';
      if (resolvedType !== state.query.resolvedType) {
        next.resolvedType = resolvedType;
        changed = true;
      }
    }
    if (externalSearchQuery !== undefined && externalSearchQuery !== state.query.search) {
      next.search = externalSearchQuery;
      changed = true;
    }

    if (changed) {
      dispatch({ type: 'APPLY_QUERY', query: next, cause: 'external' });
    }
  }, [
    externalTopic,
    externalSortBy,
    externalSortOrder,
    externalEventType,
    externalSearchQuery,
    state.query
  ]);

  // Debounced search: only debounce the network call, not the state change
  useEffect(() => {
    if (state.status !== 'searching') return;
    const timeout = setTimeout(() => getEvents('search'), 300);
    return () => clearTimeout(timeout);
  }, [state.status, state.query.search, getEvents]);

  // Refresh on non-search query changes and on initial mount
  useEffect(() => {
    if (state.status === 'initial' || state.status === 'refreshing') {
      getEvents(state.status === 'initial' ? 'initial' : 'refresh');
    }
  }, [state.status, getEvents]);

  // Handlers
  const updateFilter = useCallback((key: keyof Query, value: string) => {
    dispatch({ type: 'APPLY_QUERY', query: { [key]: value } as Partial<Query>, cause: 'user' });
  }, []);

  const toggleSortOrder = useCallback(() => {
    dispatch({
      type: 'APPLY_QUERY',
      query: { order: state.query.order === 'asc' ? 'desc' : 'asc' },
      cause: 'user'
    });
  }, [state.query.order]);

  const clearFilters = useCallback(() => {
    dispatch({ type: 'CLEAR' });
  }, []);

  const handleSearch = useCallback((search: string) => {
    dispatch({ type: 'APPLY_QUERY', query: { search }, cause: 'user' });
  }, []);

  const handleLoadMore = useCallback(() => {
    if (state.pagination.hasMore && state.status === 'idle') {
      getEvents('loadMore');
    }
  }, [state.pagination.hasMore, state.status, getEvents]);

  const handleRetry = useCallback(() => {
    getEvents('refresh');
  }, [getEvents]);

  // Backend is down - show empty state with filters
  if (selectors.isBackendDown && state.events.length === 0) {
    return (
      <div className="space-y-6">
        {showFilters && (
          <FiltersPanel
            query={state.query}
            updateFilter={updateFilter}
            toggleSortOrder={toggleSortOrder}
            idSuffix="-down"
          />
        )}

        <div className="text-center py-12">
          <div className="w-16 h-16 bg-overlay rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.469.901-6.062 2.375M6 15v1.5" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-primary mb-2">Service Temporarily Unavailable</h3>
          <p className="text-secondary mb-4">
            We&apos;re having trouble connecting to our servers. Please try again later.
          </p>
          <button
            onClick={handleRetry}
            className="px-6 py-2 bg-accent-primary text-bg-primary rounded-lg hover:bg-accent-secondary transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (selectors.isInitial) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" showText={true} text="Loading events..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      {showSearch && (
        <SearchBar
          value={state.query.search}
          onSearch={handleSearch}
          placeholder="Search events by title, topic, ticker, or markets..."
          className="mb-16"
        />
      )}

      {/* Single Loading State - prioritize search over other loading states */}
      {selectors.isSearching && (
        <div className="flex justify-center items-center py-8 mb-4">
          <LoadingSpinner size="lg" showText={true} text="Searching events..." />
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <FiltersPanel
          query={state.query}
          updateFilter={updateFilter}
          toggleSortOrder={toggleSortOrder}
        />
      )}

      {/* Error State */}
      {selectors.hasError && state.error && (
        <div className="bg-heat-red/10 border border-heat-red/20 rounded-2xl p-4">
          <p className="text-heat-red font-medium">Error: {state.error.message}</p>
          <button
            onClick={handleRetry}
            className="mt-2 px-4 py-2 bg-accent-primary text-bg-primary rounded-lg hover:bg-accent-secondary transition-colors text-sm"
          >
            Retry
          </button>
        </div>
      )}

      {/* Events Grid */}
      {state.events.length > 0 ? (
        <>
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 relative ${
            removeContainerPadding ? 'px-2 sm:px-3 -mx-6 sm:-mx-9' : ''
          } ${
            selectors.isLoading && !selectors.isInitial && !selectors.isSearching ? 'opacity-60 pointer-events-none' : ''
          }`}>
            {state.events.map((event, index) => (
              <EventCard key={event.event_ticker} event={event} index={index} />
            ))}

            {/* Loading overlay for existing content - only show if not searching */}
            {selectors.isLoading && !selectors.isInitial && !selectors.isSearching && (
              <div className="absolute inset-0 bg-ground/20 backdrop-blur-sm flex items-center justify-center z-10">
                <div className="bg-surface/90 rounded-lg p-4 shadow-lg border border-edge">
                  <LoadingSpinner size="sm" showText={true} text="Updating..." />
                </div>
              </div>
            )}
          </div>

          {/* Loading more events indicator - only show if not searching */}
          {selectors.isLoadingMore && (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" showText={true} text="Loading more events..." />
            </div>
          )}
        </>
      ) : selectors.isLoading && !selectors.isInitial && !selectors.isSearching && state.events.length === 0 ? (
        // Loading gif for when refreshing with no existing events (but not searching)
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="lg" showText={true} text="Loading events..." />
        </div>
      ) : !selectors.isInitial && !selectors.hasError && !selectors.isBackendDown && !selectors.isSearching && !selectors.isLoading ? (
        <div className="text-center py-12">
          <p className="text-primary text-lg">
            {state.query.search ?
              <>No events found matching &quot;{state.query.search}&quot;</> :
              "No events found matching your filters."
            }
          </p>
          <button
            onClick={clearFilters}
            className="mt-4 px-6 py-2 bg-accent-primary text-bg-primary rounded-lg hover:bg-accent-secondary transition-colors"
          >
            {state.query.search ? "Clear Search & Filters" : "Clear Filters"}
          </button>
        </div>
      ) : null}

      {/* Load More Button */}
      {state.pagination.hasMore && !selectors.isSearching && state.events.length > 0 && (
        <div className="flex justify-center">
          <button
            onClick={handleLoadMore}
            disabled={selectors.isLoading}
            className="px-6 py-3 bg-accent-primary text-bg-primary rounded-lg hover:bg-accent-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px] flex items-center justify-center"
          >
            {selectors.isLoadingMore ? (
              <LoadingSpinner size="sm" />
            ) : (
              'Load More'
            )}
          </button>
        </div>
      )}

      {/* Events Count */}
      {state.events.length > 0 && !selectors.isSearching && (
        <div className="text-center text-sm text-secondary">
          {state.query.search ? (
            <>
              Showing {state.events.length} event{state.events.length !== 1 ? 's' : ''} matching &quot;{state.query.search}&quot;
              {state.pagination.total > 0 && state.pagination.total !== state.events.length && ` of ${state.pagination.total} total`}
            </>
          ) : (
            <>
              Showing {state.events.length} event{state.events.length !== 1 ? 's' : ''}
              {state.pagination.total > 0 && state.pagination.total !== state.events.length && ` of ${state.pagination.total} total`}
              {!state.pagination.hasMore && ' (all results loaded)'}
            </>
          )}
        </div>
      )}
    </div>
  );
}
