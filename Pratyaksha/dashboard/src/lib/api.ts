// Central helper for calling the backend API.
//
// API_BASE_URL is empty by default, which keeps every request same-origin —
// correct for the single-container deployment (Express serves the built
// frontend and the API together) and for local dev (Vite proxies /api to
// localhost:3001). When the frontend is hosted separately from the backend
// (e.g. the frontend on Firebase Hosting and the API on AWS), set
// VITE_API_BASE_URL at build time to the backend's absolute origin
// (e.g. https://pratyaksha.8xy5d1tats0s8.us-east-1.cs.amazonlightsail.com)
// and all /api/* calls will target it. The backend already sends permissive
// CORS headers, so cross-origin requests work without further changes.
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "")

/** Resolve an API path against the configured backend origin. */
export function apiUrl(path: string): string {
  return `${API_BASE_URL}${path}`
}

/** fetch() wrapper that prefixes API paths with the configured backend origin. */
export function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  return fetch(apiUrl(path), init)
}
