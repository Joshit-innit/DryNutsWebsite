"use client";

import { useEffect } from "react";

/**
 * Sign-in goes through two Render services, the gateway and the customer service,
 * and on the free plan each one sleeps after 15 idle minutes and takes 1-2 minutes
 * to wake. Left alone they wake one after the other, only once someone presses
 * "Sign in". This pings both as soon as any page opens, so they wake in parallel
 * and are usually ready by the time a visitor reaches the form.
 *
 * Fire-and-forget: `no-cors` because only the request matters, never the reply.
 * Throttled per browser so normal browsing doesn't ping on every page.
 */
const WARM_URLS = (
  process.env.NEXT_PUBLIC_AUTH_WARM_URLS ??
  "https://nutrination-gateway.onrender.com,https://nutrination-customer.onrender.com"
)
  .split(",")
  .map((url) => url.trim().replace(/\/+$/, ""))
  .filter(Boolean);

const STORAGE_KEY = "nn-backend-warmed-at";
// Under Render's 15-minute idle window, so an active visitor keeps them awake.
const REWARM_AFTER_MS = 10 * 60 * 1000;

export default function BackendWarmup() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || WARM_URLS.length === 0) return;

    try {
      const last = Number(window.localStorage.getItem(STORAGE_KEY) || 0);
      if (Date.now() - last < REWARM_AFTER_MS) return;
      window.localStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch {
      // Storage blocked (private mode): warm anyway.
    }

    for (const url of WARM_URLS) {
      fetch(`${url}/actuator/health`, { mode: "no-cors", cache: "no-store", keepalive: true }).catch(() => {});
    }
  }, []);

  return null;
}
