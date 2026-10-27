"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Grid, Heart, ShoppingBag, User } from "lucide-react";
import { useStore } from "@/context/StoreContext";

export default function MobileNav() {
  const pathname = usePathname();
  const { cartCount, wishlist, setIsCartOpen, user } = useStore();

  if (pathname.startsWith("/admin") || pathname.startsWith("/cmd")) {
    return null;
  }

  const item = (active: boolean) =>
    `flex flex-col items-center gap-0.5 p-1 text-[10px] tracking-wide transition-colors ${
      active ? "text-brand-green" : "text-brand-muted"
    }`;

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-brand-border px-4 py-2.5">
      <div className="flex items-center justify-around">
        <Link href="/" className={item(pathname === "/")}>
          <Home className="w-5 h-5" />
          Home
        </Link>
        <Link href="/products" className={item(pathname === "/products")}>
          <Grid className="w-5 h-5" />
          Shop
        </Link>
        <Link href="/account/wishlist" className={`${item(pathname === "/account/wishlist")} relative`}>
          <span className="relative">
            <Heart className="w-5 h-5" />
            {wishlist.length > 0 && (
              <span className="absolute -top-1 -right-2 bg-brand-orange text-white text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center">
                {wishlist.length}
              </span>
            )}
          </span>
          Saved
        </Link>
        <button onClick={() => setIsCartOpen(true)} className={item(false)}>
          <span className="relative">
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-brand-saffron text-brand-dark text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </span>
          Bag
        </button>
        <Link
          href={user ? (user.role === "admin" ? "/admin" : "/account") : "/login"}
          className={item(
            (pathname.startsWith("/account") && pathname !== "/account/wishlist") || pathname === "/login" || pathname === "/register"
          )}
        >
          <User className="w-5 h-5" />
          {user ? "Account" : "Sign in"}
        </Link>
      </div>
    </nav>
  );
}
