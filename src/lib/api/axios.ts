import axios from "axios";

export const backendApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export function unwrapData<T>(response: { data: { data?: T } | T }): T {
  const payload = response.data as { data?: T };
  return payload && "data" in payload ? (payload.data as T) : (response.data as T);
}
