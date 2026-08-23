"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Grid, Heart, ShoppingBag, User } from "lucide-react";
import { useStore } from "@/context/StoreContext";

export default function MobileNav() {
  const pathname = usePathname();
  const { cartCount, wishlist, setIsCartOpen } = useStore();

  // Hide mobile nav on admin or cmd portals
  if (pathname.startsWith("/admin") || pathname.startsWith("/cmd")) {
    return null;
  }

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-brand-border px-4 py-2 shadow-lg">
      <div className="flex items-center justify-around">
        <Link
          href="/"
          className={`flex flex-col items-center gap-1 p-1 text-[11px] font-medium transition-colors ${
            pathname === "/" ? "text-brand-green font-bold" : "text-brand-muted hover:text-brand-dark"
          }`}
        >
          <Home className="w-5 h-5" />
          <span>Home</span>
        </Link>

        <Link
          href="/products"
          className={`flex flex-col items-center gap-1 p-1 text-[11px] font-medium transition-colors ${
            pathname === "/products" ? "text-brand-green font-bold" : "text-brand-muted hover:text-brand-dark"
          }`}
        >
          <Grid className="w-5 h-5" />
          <span>Shop</span>
        </Link>

        <Link
          href="/account/wishlist"
          className={`flex flex-col items-center gap-1 p-1 text-[11px] font-medium transition-colors relative ${
            pathname === "/account/wishlist" ? "text-brand-green font-bold" : "text-brand-muted hover:text-brand-dark"
          }`}
        >
          <div className="relative">
            <Heart className="w-5 h-5" />
            {wishlist.length > 0 && (
              <span className="absolute -top-1 -right-2 bg-brand-orange text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                {wishlist.length}
              </span>
            )}
          </div>
          <span>Wishlist</span>
        </Link>

        <button
          onClick={() => setIsCartOpen(true)}
          className="flex flex-col items-center gap-1 p-1 text-[11px] font-medium text-brand-muted hover:text-brand-green transition-colors relative"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-brand-saffron text-brand-dark text-[9px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </div>
          <span>Cart</span>
        </button>

        <Link
          href="/account"
          className={`flex flex-col items-center gap-1 p-1 text-[11px] font-medium transition-colors ${
            pathname.startsWith("/account") && pathname !== "/account/wishlist"
              ? "text-brand-green font-bold"
              : "text-brand-muted hover:text-brand-dark"
          }`}
        >
          <User className="w-5 h-5" />
          <span>Account</span>
        </Link>
      </div>
    </nav>
  );
}
