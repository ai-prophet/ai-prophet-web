// Use a same-origin proxy to avoid CORS issues in production
export const BACKEND_URL =
  typeof window !== "undefined" ? "/api/proxy" : "https://api.prophetarena.co/api";

export const getApiUrl = (endpoint: string) => {
  return `${BACKEND_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
}; 