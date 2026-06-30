import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:9080/api/admin';

export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

function readLegacyAuth() {
  try {
    return JSON.parse(localStorage.getItem('um.auth') || 'null');
  } catch {
    return null;
  }
}

httpClient.interceptors.request.use(
  (config) => {
    const legacyAuth = readLegacyAuth();
    const token = localStorage.getItem('access_token') || legacyAuth?.accessToken;
    const sessionId = localStorage.getItem('session_id') || legacyAuth?.sessionId;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (sessionId) {
      config.headers['X-Session-Id'] = sessionId;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('id_token');
      localStorage.removeItem('session_id');
    }

    return Promise.reject(error);
  }
);

export const http = httpClient;
export default httpClient;
