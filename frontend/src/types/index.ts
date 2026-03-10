export type CiData = Record<string, string | number>;

// Types for time-series data used across leaderboard pages and charts
export interface TimeSeriesData {
  score: number;
  rank: number;
  ci?: CiData;
}

export interface CategoryStream {
  [date: string]: TimeSeriesData;
}

export interface SearchSource {
  id: string;
  title: string;
  url: string;
  snippet: string;
}

export interface BoardEntry {
  id: number;
  source: { url: string; title: string; snippet: string };
  note: string;
  reaction: Record<string, string>;
}

export interface ActionInfo {
  name: string;
  arguments: Record<string, unknown>;
}

// SSE event types from backend
export interface RunStartEvent {
  type: "run_start";
  title: string;
  outcomes: string;
  step_limit: number;
  cost_limit: number;
}

export interface StepStartEvent {
  type: "step_start";
  step: number;
  model_cost: number;
  search_cost: number;
  total_cost: number;
}

export interface ModelResponseEvent {
  type: "model_response";
  content: string;
  thinking: string;
  actions: ActionInfo[];
}

export interface ObservationEvent {
  type: "observation";
  tool: string;
  error: boolean;
  output_text: string;
  query?: string;
  search_results?: SearchSource[];
  source_id?: string;
  note?: string;
  board_id?: number;
  new_note?: string;
  probabilities?: Record<string, number>;
}

export interface RunEndEvent {
  type: "run_end";
  exit_status: string;
  submission: Record<string, number>;
  board: BoardEntry[];
  error?: string;
}

export type AgentEvent =
  | RunStartEvent
  | StepStartEvent
  | ModelResponseEvent
  | ObservationEvent
  | RunEndEvent;

// Chat message types for the UI
export type ChatMessageType =
  | "user"
  | "plan"
  | "divider"
  | "step"
  | "think"
  | "result"
  | "error";

export interface StepSearchData {
  query: string;
  results: SearchSource[];
  count: number;
}

export interface StepAddSourceData {
  sourceId: string;
  note: string;
  boardId?: number;
}

export interface StepEditNoteData {
  boardId: number;
  newNote: string;
}

export interface ChatMessage {
  id: string;
  type: ChatMessageType;
  content: string;
  timestamp: number;
  // step-specific data
  stepNumber?: number;
  toolName?: string;
  searchData?: StepSearchData;
  addSourceData?: StepAddSourceData;
  editNoteData?: StepEditNoteData;
  submission?: Record<string, number>;
  exitStatus?: string;
  board?: BoardEntry[];
  isError?: boolean;
  // plan data
  planTitle?: string;
  planOutcomes?: string[];
}

export interface ForecastHistoryEntry {
  id: string;
  title: string;
  submission: Record<string, number>;
  outcomes?: string[];
  timestamp: number;
}

export interface SearchGroup {
  stepNumber: number;
  query: string;
  results: SearchSource[];
}

export interface UserSettings {
  model_class: string;
  model_name: string;
  search_backend: string;
}

export const DEFAULT_SETTINGS: UserSettings = {
  model_class: "litellm",
  model_name: "anthropic/claude-opus-4-6",
  search_backend: "perplexity",
};

export const MODEL_OPTIONS = [
  { label: "Claude Opus 4.6", value: "anthropic/claude-opus-4-6", provider: "litellm" },
  { label: "Claude Sonnet 4.6", value: "anthropic/claude-sonnet-4-6", provider: "litellm" },
  { label: "GPT-5.4", value: "openai/gpt-5.4", provider: "litellm" },
  { label: "Gemini 2.5 Flash", value: "google/gemini-2.5-flash-preview-05-20", provider: "litellm" },
  { label: "Gemini 2.5 Pro", value: "google/gemini-2.5-pro-preview-05-06", provider: "litellm" },
] as const;

export const SEARCH_OPTIONS = [
  { label: "Perplexity", value: "perplexity" },
  { label: "Brave Search", value: "brave" },
  { label: "Exa", value: "exa" },
] as const;
