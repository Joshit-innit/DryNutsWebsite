"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, ShieldCheck, Terminal, Code2 } from "lucide-react";
import { useStore } from "@/context/StoreContext";

export default function PortalSwitcher() {
  const pathname = usePathname();
  const { setActiveRole } = useStore();
  const [isAdmin, setIsAdmin] = useState(false);

  // Detect admin session from cookie presence (set by API) via a lightweight check
  useEffect(() => {
    const checkAdminSession = async () => {
      try {
        // Ping a lightweight endpoint that returns 401 when no admin cookie is present
        const res = await fetch("/api/v1/auth/check", { method: "GET" });
        setIsAdmin(res.ok);
      } catch {
        setIsAdmin(false);
      }
    };
    checkAdminSession();
  }, [pathname]);

  const isStorefront =
    !pathname.startsWith("/admin") &&
    !pathname.startsWith("/cmd") &&
    pathname !== "/api-docs";
  const isAdminPage = pathname.startsWith("/admin");
  const isCmdPage = pathname.startsWith("/cmd");
  const isApiDocs = pathname === "/api-docs";

  return (
    <div className="bg-brand-dark text-white text-xs py-1.5 px-4 sticky top-0 z-50 border-b border-brand-dark-light">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-brand-green animate-pulse" />
          <span className="font-medium tracking-wide text-white/90">
            NUTRINATION:
          </span>
          <span className="text-brand-saffron font-semibold">
            {isStorefront
              ? "Customer Storefront"
              : isAdminPage
              ? "Admin Portal"
              : isCmdPage
              ? "DevOps CMD Center"
              : "API Explorer"}
          </span>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          {/* Always visible: Storefront */}
          <Link
            href="/"
            onClick={() => setActiveRole("customer")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-all ${
              isStorefront
                ? "bg-brand-green text-white font-semibold shadow-sm"
                : "text-white/70 hover:text-white hover:bg-white/10"
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Storefront</span>
          </Link>

          {/* Admin — only visible when logged in as JoshitAdmin */}
          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setActiveRole("admin")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-all ${
                isAdminPage
                  ? "bg-brand-saffron text-brand-dark font-semibold shadow-sm"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin</span>
            </Link>
          )}

          {/* CMD — only visible when logged in as JoshitAdmin */}
          {isAdmin && (
            <Link
              href="/cmd"
              onClick={() => setActiveRole("developer")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-all font-mono ${
                isCmdPage
                  ? "bg-cmd-accent text-brand-dark font-semibold shadow-sm"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>CMD</span>
            </Link>
          )}

          {/* API Docs — only visible when logged in as JoshitAdmin */}
          {isAdmin && (
            <Link
              href="/api-docs"
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-all font-mono ${
                isApiDocs
                  ? "bg-emerald-600 text-white font-semibold shadow-sm"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>APIs</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
