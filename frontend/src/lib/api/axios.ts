import axios from "axios";

/**
 * Always same-origin: the session is an HttpOnly cookie on this site, so the browser
 * sends it automatically and scripts never handle a token.
 */
export const backendApi = axios.create({
  baseURL: "/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

export function unwrapData<T>(response: { data: { data?: T } | T }): T {
  const payload = response.data as { data?: T };
  return payload && "data" in payload ? (payload.data as T) : (response.data as T);
}
