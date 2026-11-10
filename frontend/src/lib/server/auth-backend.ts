/**
 * Talks to the Spring customer-service through the API gateway, and turns its
 * token into a cookie the browser cannot read.
 */

import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/server/session";

/**
 * Shorter than Netlify's function limit (10s), so a sleeping Render service gets a
 * clear 503 here instead of a platform timeout. The request still wakes it.
 */
const REQUEST_TIMEOUT_MS = 7000;

export interface SpringAuthResponse {
  accessToken: string;
  expiresIn: number;
  customerId: string;
  name: string;
  email: string;
  role: string;
}

async function callAuthService(path: string, init?: RequestInit): Promise<Response | null> {
  const baseUrl = process.env.BACKEND_URL?.replace(/\/+$/, "");
  if (!baseUrl) {
    console.error("[auth] BACKEND_URL is not set.");
    return null;
  }
  try {
    const response = await fetch(`${baseUrl}/api/v1/auth${path}`, {
      ...init,
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      cache: "no-store",
    });
    return [502, 503, 504].includes(response.status) ? null : response;
  } catch {
    return null; // Unreachable or timed out.
  }
}

/** The sign-in form shows a "waking up" state for this and retries. */
const unavailable = () =>
  NextResponse.json(
    { code: "AUTH_UNAVAILABLE", message: "Sign-in is starting up. Please wait a moment." },
    { status: 503, headers: { "Retry-After": "5" } }
  );

/**
 * Forwards a login or registration. The token goes into the cookie and never into the
 * response body. `messages` maps Spring's status codes to words a customer can act on.
 * `onSuccess` may return a response to refuse the session instead, e.g. a suspended account.
 */
export async function forwardCredentials(
  path: "/login" | "/register" | "/google",
  body: Record<string, string>,
  messages: Record<number, string>,
  onSuccess?: (account: SpringAuthResponse) => Promise<Response | void>
): Promise<Response> {
  const upstream = await callAuthService(path, { method: "POST", body: JSON.stringify(body) });
  if (!upstream) return unavailable();

  if (upstream.status === 429) {
    return NextResponse.json(
      { code: "RATE_LIMITED", message: "Too many sign-in attempts. Please wait 15 minutes and try again." },
      { status: 429, headers: { "Retry-After": upstream.headers.get("Retry-After") ?? "900" } }
    );
  }

  if (!upstream.ok) {
    const message = messages[upstream.status] ?? "Something went wrong. Please try again.";
    return NextResponse.json({ message }, { status: upstream.status < 500 ? upstream.status : 500 });
  }

  const { data } = (await upstream.json()) as { data: SpringAuthResponse };
  const refused = await onSuccess?.(data);
  if (refused) return refused;

  const { accessToken, expiresIn, customerId, name, email, role } = data;
  const response = NextResponse.json({ data: { customerId, name, email, role } }, { status: upstream.status });
  response.cookies.set(SESSION_COOKIE, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: expiresIn,
  });
  return response;
}

export async function isAuthServiceAvailable(): Promise<boolean> {
  return Boolean((await callAuthService("/ping"))?.ok);
}
