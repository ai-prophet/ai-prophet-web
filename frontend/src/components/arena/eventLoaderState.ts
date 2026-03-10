import type { Event } from "@/components/arena/EventCard";

export type Status =
  | 'initial'
  | 'refreshing'
  | 'searching'
  | 'loadingMore'
  | 'idle'
  | 'error'
  | 'backendDown';

export type ResolvedType = 'all' | 'open' | 'resolved';

export interface Query {
  topic: string;
  sortBy: string;
  order: 'asc' | 'desc';
  resolvedType: ResolvedType;
  search: string;
}

export interface Pagination {
  cursor: string | null;
  hasMore: boolean;
  total: number;
}

export interface NetError {
  code: 'BACKEND_DOWN' | 'NETWORK' | 'ABORTED' | 'UNKNOWN';
  message: string;
}

export interface State {
  status: Status;
  events: Event[];
  query: Query;
  pagination: Pagination;
  error: NetError | null;
}

export type FetchKind = 'initial' | 'refresh' | 'search' | 'loadMore';

export type Action =
  | { type: 'APPLY_QUERY'; query: Partial<Query>; cause: 'external' | 'user' }
  | { type: 'START_FETCH'; kind: FetchKind }
  | {
      type: 'SUCCESS';
      payload: {
        data: Event[];
        nextCursor: string | null;
        end: boolean;
        totalCount: number;
        reset: boolean;
      };
    }
  | { type: 'FAIL'; error: NetError }
  | { type: 'CLEAR' };

function dedupeAndAppend(prev: Event[], incoming: Event[], reset: boolean) {
  const base = reset ? [] : prev;
  const seen = new Set(base.map(e => e.event_ticker));
  const toAdd = incoming.filter(e => !seen.has(e.event_ticker));
  return [...base, ...toAdd];
}

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'APPLY_QUERY': {
      const nextQuery = { ...state.query, ...action.query };
      const nextStatus: Status =
        (action.query.search ?? state.query.search).trim()
          ? 'searching'
          : state.status === 'initial'
          ? 'initial'
          : 'refreshing';

      return {
        ...state,
        query: nextQuery,
        status: nextStatus,
        pagination: { ...state.pagination, cursor: null, hasMore: true, total: 0 },
        events: [],
        error: null,
      };
    }

    case 'START_FETCH': {
      const map: Record<FetchKind, Status> = {
        initial: 'initial',
        refresh: 'refreshing',
        search: 'searching',
        loadMore: 'loadingMore',
      };
      return { ...state, status: map[action.kind], error: null };
    }

    case 'SUCCESS': {
      const { data, nextCursor, end, totalCount, reset } = action.payload;
      return {
        ...state,
        status: 'idle',
        events: dedupeAndAppend(state.events, data, reset),
        pagination: {
          cursor: nextCursor,
          hasMore: !end,
          total: totalCount ?? state.pagination.total,
        },
        error: null,
      };
    }

    case 'FAIL': {
      const isDown = action.error.code === 'BACKEND_DOWN';
      return {
        ...state,
        status: isDown ? 'backendDown' : 'error',
        error: action.error,
        pagination: { ...state.pagination, hasMore: false },
      };
    }

    case 'CLEAR': {
      return {
        ...state,
        status: 'initial',
        query: { topic: 'All', sortBy: 'close_time', order: 'asc', resolvedType: 'all', search: '' },
        events: [],
        pagination: { cursor: null, hasMore: true, total: 0 },
        error: null,
      };
    }

    default:
      return state;
  }
}

export const topics = [
  'All',
  'Politics',
  'Sports',
  'Economics',
  'Technology',
  'Entertainment',
  'Science',
  'Other'
];

export const sortOptions = [
  { value: 'close_time', label: 'Close Time' },
  { value: 'volume', label: 'Volume' },
  { value: 'created_at', label: 'Created' }
];

export const resolvedOptions = [
  { value: 'all', label: 'All Events' },
  { value: 'open', label: 'Open Only' },
  { value: 'resolved', label: 'Resolved Only' }
];
