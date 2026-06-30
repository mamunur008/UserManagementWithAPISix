import { http, httpClient } from '../lib/httpClient.js';

// Compatibility wrapper for older service files that import from src/services/httpClient.js.
// The real Axios client lives in src/lib/httpClient.js and reads the Keycloak token
// from localStorage.access_token, which is what the current OIDC callback writes.
export { http, httpClient };

export function setAuthSnapshot() {
  // No-op kept so older AuthProvider code does not break if it is still imported.
}

export function unwrap(response) {
  return response?.data;
}

export function toFriendlyError(error, fallback = 'Unexpected API error') {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.title ||
    error?.response?.data?.error ||
    error?.friendlyMessage ||
    error?.message ||
    fallback
  );
}

export const getErrorMessage = toFriendlyError;

export function idempotencyHeaders() {
  return {
    headers: {
      'Idempotency-Key':
        globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`,
    },
  };
}

export default http;
