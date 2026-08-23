"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
    <aside className="w-64 bg-white border-r border-brand-border flex flex-col justify-between h-[calc(100vh-33px)] sticky top-[33px] p-4">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 py-2 border-b border-brand-border/60 pb-4">
          <div className="w-9 h-9 rounded-xl bg-brand-green text-white flex items-center justify-center font-serif font-black text-lg">
            N
          </div>
          <div>
            <span className="font-serif font-black text-base tracking-wider text-brand-dark leading-none block">
              NUTRI<span className="text-brand-green">NATION</span>
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-brand-saffron block mt-0.5">
              ADMIN PORTAL
            </span>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="space-y-1 overflow-y-auto max-h-[calc(100vh-220px)] pr-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-brand-green text-white shadow-xs"
                    : "text-brand-dark hover:bg-brand-cream"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-brand-muted"}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-white" />}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Admin User Footer */}
      <div className="pt-4 border-t border-brand-border/80 flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-brand-saffron/20 text-brand-dark flex items-center justify-center font-bold text-xs">
            AD
          </div>
          <div>
            <p className="text-xs font-bold text-brand-dark">Admin Officer</p>
            <p className="text-[10px] text-brand-muted">admin@nutrination.in</p>
          </div>
        </div>
        <Link href="/" className="text-brand-muted hover:text-brand-dark p-1.5" title="Exit to Storefront">
          <LogOut className="w-4 h-4" />
        </Link>
      </div>
    </aside>
  );
}
