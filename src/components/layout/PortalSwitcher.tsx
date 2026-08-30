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

  useEffect(() => {
    const checkAdminSession = async () => {
      try {
        const res = await fetch("/api/v1/auth/check", { method: "GET" });
        setIsAdmin(res.ok);
      } catch {
        setIsAdmin(false);
      }
    };
    checkAdminSession();
  }, [pathname]);

  if (!isAdmin) return null;

  const isStorefront =
    !pathname.startsWith("/admin") &&
    !pathname.startsWith("/cmd") &&
    pathname !== "/api-docs";
  const isAdminPage = pathname.startsWith("/admin");
  const isCmdPage = pathname.startsWith("/cmd");
  const isApiDocs = pathname === "/api-docs";

  return (
    <div className="bg-brand-dark text-white text-xs py-1.5 px-4 sticky top-0 z-50 border-b border-white/10">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <span className="text-white/50 tracking-wide">Staff tools</span>
        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/"
            onClick={() => setActiveRole("customer")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all ${
              isStorefront ? "bg-brand-green text-white" : "text-white/60 hover:text-white hover:bg-white/10"
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Store
          </Link>
          <Link
            href="/admin"
            onClick={() => setActiveRole("admin")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${
              isAdminPage ? "bg-brand-saffron text-brand-dark" : "text-white/60 hover:text-white hover:bg-white/10"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Admin
          </Link>
          <Link
            href="/cmd"
            onClick={() => setActiveRole("developer")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono ${
              isCmdPage ? "bg-cmd-accent text-brand-dark" : "text-white/60 hover:text-white hover:bg-white/10"
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            CMD
          </Link>
          <Link
            href="/api-docs"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono ${
              isApiDocs ? "bg-emerald-700 text-white" : "text-white/60 hover:text-white hover:bg-white/10"
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            APIs
          </Link>
        </div>
      </div>
    </div>
  );
}
