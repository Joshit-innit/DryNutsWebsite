import axios from "axios";
import { ACCESS_TOKEN_STORAGE_KEY } from "@/lib/auth-constants";

export const backendApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  // Authentication uses an explicit bearer token, not ambient browser cookies.
  withCredentials: false,
});

backendApi.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = sessionStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

export function unwrapData<T>(response: { data: { data?: T } | T }): T {
  const payload = response.data as { data?: T };
  return payload && "data" in payload ? (payload.data as T) : (response.data as T);
}
