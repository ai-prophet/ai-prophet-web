// Use a same-origin proxy to avoid CORS issues in production
export const BACKEND_URL =
  typeof window !== "undefined" ? "/api/proxy" : "https://api.prophetarena.co/api";

// Direct backend URL for SSE/EventSource (proxy doesn't support streaming)
export const DIRECT_API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.prophetarena.co";

export const getApiUrl = (endpoint: string) => {
  return `${BACKEND_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};

export const getDirectApiUrl = (endpoint: string) => {
  const base = DIRECT_API_URL.replace(/\/+$/, "");
  return `${base}/api${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};