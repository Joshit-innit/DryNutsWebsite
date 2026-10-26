"use client";

import React, { useState } from "react";
import { Bell, Search, ExternalLink, ShieldCheck, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { backendApi } from "@/lib/api/axios";
import { ACCESS_TOKEN_STORAGE_KEY, AUTH_ROLE_STORAGE_KEY } from "@/lib/auth-constants";

export default function AdminHeader() {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await backendApi.post("/auth/admin-logout");
      sessionStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
      sessionStorage.removeItem(AUTH_ROLE_STORAGE_KEY);
      toast.success("Signed out of Admin Portal");
      router.push("/admin/login");
      router.refresh();
    } catch {
      toast.error("Logout failed — please try again.");
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-brand-border px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <div className="relative w-64 md:w-80">
          <Search className="w-4 h-4 text-brand-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search SKU, order number, customer..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-brand-cream/40 border border-brand-border rounded-xl focus:outline-none focus:border-brand-green"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-xs bg-brand-green/10 text-brand-green px-2.5 py-1 rounded-full font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>JoshitAdmin</span>
        </div>

        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-1 text-xs text-brand-muted hover:text-brand-dark font-medium transition-colors"
        >
          <span>Storefront</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>

        <button className="w-8 h-8 rounded-full bg-brand-cream border border-brand-border flex items-center justify-center text-brand-dark hover:bg-brand-beige transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-brand-orange absolute top-1.5 right-1.5 ring-2 ring-white" />
        </button>

        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 font-semibold transition-colors disabled:opacity-50"
          title="Sign out of Admin Portal"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">{loggingOut ? "Signing out..." : "Sign Out"}</span>
        </button>
      </div>
    </header>
  );
}
