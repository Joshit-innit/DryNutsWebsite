"use client";

import React from "react";
import { Bell, Search, ExternalLink, ShieldCheck, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useStore } from "@/context/StoreContext";

export default function AdminHeader() {
  const router = useRouter();
  const { user, logout } = useStore();

  const handleLogout = () => {
    logout();
    toast.success("Signed out of Admin Portal");
    router.replace("/login");
  };

  return (
    <header className="sticky top-[33px] z-30 flex h-16 items-center justify-between border-b border-brand-border bg-brand-cream/85 px-6 backdrop-blur-md md:px-8">
      <div className="flex items-center gap-3">
        <div className="relative w-64 md:w-80">
          <Search className="w-4 h-4 text-brand-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search SKU, order number, customer..."
            className="h-10 w-full rounded-xl border border-transparent bg-brand-beige pl-9 pr-4 text-[13px] focus:border-brand-border-dark focus:bg-white focus:outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 rounded-lg border border-brand-border-dark bg-white px-2.5 py-1.5 text-[13px] font-medium text-brand-dark">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{user?.name || "Admin"}</span>
        </div>

        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-1 text-[13px] font-medium text-brand-dark underline decoration-brand-dark/25 decoration-2 underline-offset-4 transition-colors hover:decoration-brand-dark"
        >
          <span>Storefront</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>

        <button className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-brand-border-dark bg-white text-brand-dark transition-colors hover:bg-brand-beige">
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-brand-orange absolute top-1.5 right-1.5 ring-2 ring-white" />
        </button>

        <button
          onClick={handleLogout}
          className="flex h-10 items-center gap-1.5 rounded-xl bg-brand-dark px-3.5 text-[13px] font-medium text-white transition-colors hover:bg-black disabled:opacity-50"
          title="Sign out of Admin Portal"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
}
