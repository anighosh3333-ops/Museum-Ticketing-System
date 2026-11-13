// Keep API requests on the same origin so LAN devices can use the Vite proxy.
// Set VITE_API_BASE_URL when the frontend is served separately in production.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
