// Production backend URL
export const BACKEND_URL = "https://api.prophetarena.co/api";
// Local backend URL
// export const BACKEND_URL = "http://0.0.0.0:8000/api";

export const getApiUrl = (endpoint: string) => {
  return `${BACKEND_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
}; 