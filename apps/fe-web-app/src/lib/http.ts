import { envConfig } from "@/schema/config.schema";
import axios from "axios";

const parseParams = (params: Record<string, unknown>) =>
  Object.entries(params)
    .filter(([_, value]) => value !== null && value !== undefined && value !== "")
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return value.map((v) => `${key}=${encodeURIComponent(v)}`).join("&");
      }
      if (typeof value === "object" && value !== null) {
        return "";
      }
      return `${key}=${encodeURIComponent(value)}`;
    })
    .filter(Boolean)
    .join("&");

export const apiRequest = axios.create({
  baseURL: envConfig.VITE_API_URL,
  paramsSerializer: parseParams,
  withCredentials: false,
});

const getStoredToken = () => {
  try {
    const raw = localStorage.getItem("evrental.auth");
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as { token?: string };
    return parsed.token ?? null;
  } catch (error) {
    console.warn("Failed to parse stored auth token", error);
    return null;
  }
};

apiRequest.interceptors.request.use((options) => {
  const { method, data } = options;

  if (method === "put" || method === "post" || method === "patch") {
    if (data instanceof FormData) {
      options.headers!["Content-Type"] = "multipart/form-data";
    } else {
      options.headers!["Content-Type"] = "application/json;charset=UTF-8";
    }
  }

  // Auto attach token if available
  const token = getStoredToken();
  if (token) {
    options.headers!["Authorization"] = `Bearer ${token}`;
  }

  return options;
});

apiRequest.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error),
);
