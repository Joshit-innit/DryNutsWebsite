import { UserSession } from "@/types";
import {
  ACCESS_TOKEN_STORAGE_KEY,
  AUTH_ROLE_STORAGE_KEY,
  AUTH_USER_STORAGE_KEY,
} from "@/lib/auth-constants";

/** Shape returned by POST /auth/login and /auth/register on both backends. */
export interface AuthResponse {
  accessToken: string;
  customerId: string;
  role: string;
  name?: string;
  email?: string;
}

export function isAdminRole(role?: string | null): boolean {
  return role?.toUpperCase() === "ADMIN";
}

export function saveSession(auth: AuthResponse, fallback: { name?: string; email: string }): UserSession {
  const user: UserSession = {
    id: auth.customerId,
    name: auth.name || fallback.name || fallback.email.split("@")[0],
    email: auth.email || fallback.email,
    role: isAdminRole(auth.role) ? "admin" : "customer",
  };

  sessionStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, auth.accessToken);
  sessionStorage.setItem(AUTH_ROLE_STORAGE_KEY, auth.role.toUpperCase());
  sessionStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));
  return user;
}

export function loadSessionUser(): UserSession | null {
  try {
    if (!sessionStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)) return null;
    const raw = sessionStorage.getItem(AUTH_USER_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as UserSession) : null;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  sessionStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  sessionStorage.removeItem(AUTH_ROLE_STORAGE_KEY);
  sessionStorage.removeItem(AUTH_USER_STORAGE_KEY);
}

/** Pulls the server's error message out of an axios error, if there is one. */
export function apiErrorMessage(error: unknown, fallback: string): string {
  const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
  return message || fallback;
}
