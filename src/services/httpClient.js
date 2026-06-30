import axios from "axios";
import { oidcUserManager } from "./oidc.js";

const baseURL =
  import.meta.env.VITE_API_BASE_URL ||
  `${import.meta.env.VITE_GATEWAY_URL || "http://127.0.0.1:9080"}${
    import.meta.env.VITE_API_PREFIX || "/api/admin"
  }`;

export const http = axios.create({
  baseURL,
  timeout: 30000
});

http.interceptors.request.use(async (config) => {
  const user = await oidcUserManager.getUser();

  if (user?.access_token) {
    config.headers.Authorization = `Bearer ${user.access_token}`;
  }

  if (user?.profile?.sid) {
    config.headers["X-Session-Id"] = user.profile.sid;
  }

  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export function unwrap(response) {
  return response?.data;
}

export function getErrorMessage(error, fallback = "Request failed") {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.title ||
    error?.message ||
    fallback
  );
}
