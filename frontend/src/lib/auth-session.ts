import { UserSession } from "@/types";
import { backendApi, unwrapData } from "@/lib/api/axios";

/** What the sign-in endpoints return. The token itself stays in an HttpOnly cookie. */
export interface AuthResponse {
  customerId: string;
  role: string;
  name: string;
  email: string;
}

const WAKE_POLL_MS = 4000;
const WAKE_LIMIT_MS = 100_000;

export function isAdminRole(role?: string | null): boolean {
  return role?.toUpperCase() === "ADMIN";
}

export function toSessionUser(auth: AuthResponse): UserSession {
  return {
    id: auth.customerId,
    name: auth.name,
    email: auth.email,
    role: isAdminRole(auth.role) ? "admin" : "customer",
  };
}

/** Asks the server who the cookie belongs to; the browser cannot tell by itself. */
export async function fetchSessionUser(): Promise<UserSession | null> {
  try {
    const session = unwrapData<Partial<AuthResponse> & { authenticated: boolean }>(
      await backendApi.get("/auth/check")
    );
    return session.authenticated ? toSessionUser(session as AuthResponse) : null;
  } catch {
    return null;
  }
}

export async function endSession(): Promise<void> {
  await backendApi.post("/auth/logout");
}

const isUnavailable = (error: unknown) =>
  (error as { response?: { data?: { code?: string } } })?.response?.data?.code === "AUTH_UNAVAILABLE";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Signs in or registers. Render's free plan sleeps, so the first attempt can find the
 * backend asleep: wait for it to answer, then send the same request once more.
 */
export async function submitCredentials(
  path: "/auth/login" | "/auth/register",
  body: Record<string, string>,
  onWaking: () => void
): Promise<AuthResponse> {
  try {
    return unwrapData<AuthResponse>(await backendApi.post(path, body));
  } catch (error) {
    if (!isUnavailable(error)) throw error;
  }

  onWaking();
  const deadline = Date.now() + WAKE_LIMIT_MS;
  while (Date.now() < deadline) {
    await wait(WAKE_POLL_MS);
    const status = await backendApi.get("/auth/status").catch(() => null);
    if (status && unwrapData<{ available: boolean }>(status).available) {
      return unwrapData<AuthResponse>(await backendApi.post(path, body));
    }
  }
  throw { response: { data: { message: "Sign-in is taking longer than usual. Please try again in a minute." } } };
}

/** Pulls the server's error message out of an axios error, if there is one. */
export function apiErrorMessage(error: unknown, fallback: string): string {
  const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
  return message || fallback;
}
