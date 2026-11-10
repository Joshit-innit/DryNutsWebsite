"use client";

import { useEffect, useRef, useState } from "react";
import { AuthResponse, apiErrorMessage, submitCredentials } from "@/lib/auth-session";

/** Web OAuth client id from Google Cloud Console. Without it the button doesn't appear. */
const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";
const SCRIPT_SRC = "https://accounts.google.com/gsi/client";
// Google draws its button at a fixed pixel width, between 200 and 400.
const MAX_WIDTH = 400;

interface GoogleIdApi {
  initialize(config: {
    client_id: string;
    callback: (response: { credential?: string }) => void;
    ux_mode?: "popup" | "redirect";
    context?: "signin" | "signup" | "use";
    itp_support?: boolean;
  }): void;
  renderButton(
    parent: HTMLElement,
    options: {
      type: "standard";
      theme: "outline" | "filled_blue" | "filled_black";
      size: "large" | "medium" | "small";
      text: "signin_with" | "signup_with" | "continue_with";
      shape: "rectangular" | "pill";
      logo_alignment: "left" | "center";
      width: number;
    }
  ): void;
}

declare global {
  interface Window {
    google?: { accounts: { id: GoogleIdApi } };
  }
}

let scriptPromise: Promise<void> | null = null;

function loadGoogleScript(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve();
  scriptPromise ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error("Google sign-in could not load"));
    };
    document.head.appendChild(script);
  });
  return scriptPromise;
}

export const googleSignInEnabled = CLIENT_ID.length > 0;

/**
 * Google's own button (its branding rules require it), then the same session as an
 * email sign-in. Google signs a token in the browser; our server checks it with Google.
 */
export default function GoogleSignIn({
  mode,
  onAuthenticated,
}: {
  mode: "signin" | "signup";
  onAuthenticated: (auth: AuthResponse) => void;
}) {
  const slot = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"loading" | "ready" | "busy" | "waking" | "unavailable">("loading");
  const [error, setError] = useState<string | null>(null);
  // The latest handler, so Google's one-time callback never calls a stale one.
  const authenticated = useRef(onAuthenticated);
  authenticated.current = onAuthenticated;

  useEffect(() => {
    if (!googleSignInEnabled) return;
    let cancelled = false;

    const handleCredential = async ({ credential }: { credential?: string }) => {
      if (!credential) return;
      setError(null);
      setState("busy");
      try {
        authenticated.current(
          await submitCredentials("/auth/google", { credential }, () => setState("waking"))
        );
      } catch (failure) {
        setError(apiErrorMessage(failure, "We couldn't sign you in with Google. Please try again."));
      } finally {
        setState("ready");
      }
    };

    loadGoogleScript()
      .then(() => {
        const api = window.google?.accounts.id;
        if (cancelled || !api || !slot.current) return;
        api.initialize({ client_id: CLIENT_ID, callback: handleCredential, ux_mode: "popup", context: mode, itp_support: true });
        api.renderButton(slot.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: mode === "signup" ? "signup_with" : "continue_with",
          shape: "rectangular",
          logo_alignment: "center",
          width: Math.max(200, Math.min(MAX_WIDTH, Math.floor(slot.current.offsetWidth))),
        });
        setState("ready");
      })
      .catch(() => !cancelled && setState("unavailable"));

    return () => {
      cancelled = true;
    };
  }, [mode]);

  if (!googleSignInEnabled || state === "unavailable") return null;

  const busy = state === "busy" || state === "waking";
  return (
    <div className="mt-6">
      <div className="mb-6 flex items-center gap-3 text-[12px] text-brand-muted" aria-hidden>
        <span className="h-px flex-1 bg-brand-border" />
        or
        <span className="h-px flex-1 bg-brand-border" />
      </div>

      <div className="relative">
        {/* Holds the button's height while Google draws it, so the form below doesn't jump. */}
        <div
          ref={slot}
          aria-busy={busy}
          className={`flex min-h-[44px] w-full justify-center transition-opacity duration-200 ${busy ? "pointer-events-none opacity-50" : ""}`}
        />
        {state === "loading" && <div aria-hidden className="skeleton absolute inset-0 rounded-[4px]" />}
      </div>

      {state === "busy" && (
        <p role="status" className="mt-3 text-[13px] text-brand-muted">
          Signing you in with Google…
        </p>
      )}
      {state === "waking" && (
        <p role="status" className="mt-3 text-[13px] leading-relaxed text-brand-muted">
          Our sign-in service is waking up, which can take a couple of minutes. You don&apos;t need to do anything.
        </p>
      )}
      {error && (
        <p role="alert" className="mt-3 rounded-xl bg-red-50 px-3.5 py-3 text-[14px] leading-snug text-red-800">
          {error}
        </p>
      )}
    </div>
  );
}
