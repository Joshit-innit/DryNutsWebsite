"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { backendApi, unwrapData } from "@/lib/api/axios";
import { ACCESS_TOKEN_STORAGE_KEY } from "@/lib/auth-constants";
import { isAdminRole } from "@/lib/auth-session";

type SessionCheck = { authenticated: boolean; role?: string };

/**
 * Keeps non-admins out of the admin portal. The token lives in sessionStorage,
 * so this has to run on the client; the product API enforces the same rule
 * server-side for every write.
 */
export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useStore();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const toLogin = () => router.replace(`/login?next=${encodeURIComponent(pathname || "/admin")}`);

    async function verify() {
      if (!sessionStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)) {
        toLogin();
        return;
      }
      try {
        const session = unwrapData<SessionCheck>(await backendApi.get("/auth/check"));
        if (cancelled) return;
        if (session.authenticated && isAdminRole(session.role)) {
          setAllowed(true);
          return;
        }
      } catch {
        // Treat an unreachable auth service like an expired session.
      }
      if (!cancelled) {
        logout();
        toLogin();
      }
    }

    verify();
    return () => {
      cancelled = true;
    };
    // Re-verifying on every admin navigation is unnecessary; once per mount is enough.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-cream">
        <div className="flex items-center gap-2 text-xs font-semibold text-brand-muted">
          <Loader2 className="h-4 w-4 animate-spin text-brand-green" />
          Verifying admin access...
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
