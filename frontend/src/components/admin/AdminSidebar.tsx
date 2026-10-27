"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/context/StoreContext";
import {
  LayoutDashboard,
  Package,
  Boxes,
  ShoppingBag,
  Users,
  Tag,
  BarChart3,
  Sliders,
  Star,
  FileText,
  Percent,
  LogOut,
  ChevronRight,
} from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user } = useStore();
  const initials = (user?.name || "Admin").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  const menuItems = [
    { label: "Overview", href: "/admin", icon: LayoutDashboard },
    { label: "Products Catalog", href: "/admin/products", icon: Package },
    { label: "Categories", href: "/admin/categories", icon: Boxes },
    { label: "Inventory Stock", href: "/admin/inventory", icon: Sliders },
    { label: "Customer Orders", href: "/admin/orders", icon: ShoppingBag },
    { label: "Customers", href: "/admin/customers", icon: Users },
    { label: "Coupons & Codes", href: "/admin/coupons", icon: Percent },
    { label: "Promo Offers", href: "/admin/offers", icon: Tag },
    { label: "Review Moderation", href: "/admin/reviews", icon: Star },
    { label: "Revenue Analytics", href: "/admin/analytics", icon: BarChart3 },
    { label: "Editorial Content", href: "/admin/content", icon: FileText },
    { label: "Store Settings", href: "/admin/settings", icon: Sliders },
  ];

  return (
    <aside className="sticky top-[33px] flex h-[calc(100vh-33px)] w-64 shrink-0 flex-col justify-between bg-brand-dark p-4 text-white">
      <div className="space-y-6">
        {/* Brand Header */}
        <Link href="/admin" className="flex items-baseline justify-between border-b border-white/10 px-2 pb-5 pt-2">
          <span className="flex items-baseline">
            <span className="text-[1.3rem] font-bold leading-none tracking-[-0.055em] text-white">NutriNation</span>
            <span className="ml-0.5 h-1.5 w-1.5 rounded-full bg-brand-green-light" />
          </span>
          <span className="rounded-md border border-white/20 px-1.5 py-px text-[10px] font-medium text-white/70">Admin</span>
        </Link>

        {/* Navigation items */}
        <nav className="max-h-[calc(100vh-200px)] space-y-1 overflow-y-auto pr-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between rounded-xl border px-3.5 py-2.5 text-[13px] font-medium transition-colors ${
                  isActive
                    ? "border-white/50 bg-white/[0.06] text-white"
                    : "border-transparent text-white/60 hover:border-white/15 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`h-4 w-4 ${isActive ? "text-brand-green-light" : "text-white/40"}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="h-3.5 w-3.5 text-white/60" />}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Admin User Footer */}
      <div className="flex items-center justify-between rounded-xl bg-white/[0.05] p-2.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-xs font-bold text-brand-dark">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold text-white">{user?.name || "Admin"}</p>
            <p className="truncate text-[11px] text-white/50">{user?.email || "Signed in"}</p>
          </div>
        </div>
        <Link href="/" className="rounded-lg p-1.5 text-white/50 hover:bg-white/10 hover:text-white" title="Exit to Storefront">
          <LogOut className="h-4 w-4" />
        </Link>
      </div>
    </aside>
  );
}
