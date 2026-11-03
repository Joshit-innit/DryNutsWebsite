"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { DashboardSkeleton, Skeleton } from "@/components/ui/Skeleton";
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
    // Skeleton of the admin shell (sidebar, header, dashboard) while the session is checked.
    return (
      <div className="flex min-h-screen bg-brand-cream">
        <aside className="hidden w-64 shrink-0 space-y-3 border-r border-brand-border bg-white p-5 md:block">
          <Skeleton className="mb-8 h-8 w-36" />
          {Array.from({ length: 10 }, (_, i) => (
            <Skeleton key={i} className="h-9 w-full rounded-xl" />
          ))}
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex h-16 items-center justify-between border-b border-brand-border bg-white px-6">
            <Skeleton className="h-9 w-64 max-w-[50%] rounded-xl" />
            <Skeleton className="h-9 w-9 rounded-full" />
          </div>
          <div className="p-6 md:p-10">
            <DashboardSkeleton label="Verifying admin access" />
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
