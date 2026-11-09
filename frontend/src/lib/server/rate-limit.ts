/**
 * Shared rate limits, counted in Supabase because Netlify spreads requests across
 * many short-lived function instances that share no memory.
 */

import { getSupabase } from "@/lib/server/supabase";

/** The visitor's address as Netlify saw it. Netlify sets this header itself, so it can't be forged. */
export function clientIp(request: Request): string {
  return (
    request.headers.get("x-nf-client-connection-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

interface Limit {
  /** What is being counted, e.g. `login:ip:1.2.3.4`. */
  key: string;
  max: number;
  windowSeconds: number;
}

/**
 * Counts one attempt against every limit and says whether all of them still allow it.
 * If the counter can't be reached the request is allowed: a database hiccup must not
 * lock every customer out of the shop.
 */
export async function withinLimits(...limits: Limit[]): Promise<boolean> {
  const results = await Promise.all(
    limits.map(async ({ key, max, windowSeconds }) => {
      const { data, error } = await getSupabase().rpc("hit_rate_limit", {
        p_key: key.toLowerCase(),
        p_limit: max,
        p_window_seconds: windowSeconds,
      });
      if (error) {
        console.error("[rate-limit] check failed:", error.message);
        return true;
      }
      return data !== false;
    })
  );
  return results.every(Boolean);
}

export function tooManyRequests(message: string, retryAfterSeconds: number): Response {
  return Response.json(
    { code: "RATE_LIMITED", message },
    { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
  );
}

export const MINUTE = 60;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;
