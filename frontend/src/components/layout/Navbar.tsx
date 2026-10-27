"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  Heart,
  ShoppingBag,
  Menu,
  X,
  ChevronDown,
  Gift,
} from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { CATEGORIES } from "@/data/mockData";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const { cartCount, wishlist, setIsCartOpen, user } = useStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 12);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const coreCategories = CATEGORIES.filter(
    (c) => c.slug !== "combos" && c.slug !== "gift-boxes"
  );

  const navLink = (active: boolean) =>
    `text-[15px] font-medium tracking-[-0.01em] transition-colors ${
      active ? "text-brand-dark" : "text-brand-dark/75 hover:text-brand-dark"
    }`;

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const q = searchTerm.trim();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
  };

  return (
    <header className={`sticky top-0 z-40 border-b backdrop-blur-md transition-colors ${isScrolled ? "border-brand-border bg-brand-cream/90" : "border-transparent bg-brand-cream"}`}>
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-12">
        <div className="flex h-[4.25rem] items-center justify-between gap-6">
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-brand-dark"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          <Link href="/" className="group flex items-baseline" aria-label="NutriNation home">
            <span className="text-[1.45rem] font-bold leading-none tracking-[-0.055em] text-brand-dark">
              NutriNation
            </span>
            <span className="ml-0.5 h-[7px] w-[7px] rounded-full bg-brand-green transition-transform group-hover:scale-125" />
          </Link>

          <nav className="hidden lg:flex items-center gap-7 xl:mr-auto xl:ml-6">
            <Link href="/products" className={navLink(pathname === "/products")}>
              Shop
            </Link>

            <div
              className="relative"
              onMouseEnter={() => setIsMegaMenuOpen(true)}
              onMouseLeave={() => setIsMegaMenuOpen(false)}
            >
              <button
                type="button"
                onClick={() => setIsMegaMenuOpen(!isMegaMenuOpen)}
                aria-expanded={isMegaMenuOpen}
                aria-controls="harvest-menu"
                className={`${navLink(pathname.startsWith("/category"))} flex items-center gap-1 py-2`}
              >
                Harvests
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${isMegaMenuOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isMegaMenuOpen && (
                <div id="harvest-menu" className="absolute top-full -left-16 mt-1 grid w-[640px] grid-cols-3 gap-3 rounded-2xl border border-brand-border bg-white p-4 shadow-hover">
                  <div className="col-span-2 grid grid-cols-2 gap-1">
                    {coreCategories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/category/${cat.slug}`}
                        onClick={() => setIsMegaMenuOpen(false)}
                        className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-brand-cream"
                      >
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-brand-beige">
                          <img src={cat.image} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-brand-dark">{cat.name}</p>
                          <p className="text-[11px] text-brand-muted">Shop category</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <div className="flex flex-col justify-between rounded-xl bg-brand-dark p-4 text-white">
                    <div>
                      <h4 className="text-lg text-white">Gift caskets</h4>
                      <p className="text-[11px] text-white/65 mt-1 leading-relaxed">
                        Gift boxes and combinations for sharing.
                      </p>
                    </div>
                    <Link
                      href="/category/gift-boxes"
                      onClick={() => setIsMegaMenuOpen(false)}
                      className="mt-4 text-sm font-medium text-white underline decoration-white/30 decoration-2 underline-offset-4 hover:decoration-white"
                    >
                      Explore gifts →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link href="/products?filter=bestseller" className={navLink(false)}>
              Best sellers
            </Link>
            <Link href="/category/combos" className={navLink(pathname.includes("combos"))}>
              Combos
            </Link>
            <Link href="/contact" className={navLink(pathname === "/contact")}>
              Story
            </Link>
          </nav>

          <form onSubmit={submitSearch} role="search" className="relative hidden w-[300px] xl:block">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search almonds, dates, gifts…"
              aria-label="Search products"
              className="h-10 w-full rounded-xl border border-transparent bg-brand-beige pl-10 pr-4 text-sm text-brand-dark placeholder:text-brand-muted focus:border-brand-border-dark focus:bg-white focus:outline-none"
            />
          </form>

          <div className="flex items-center gap-1 sm:gap-2">
            <Link href="/search" className="rounded-full p-2.5 text-brand-dark/80 hover:text-brand-dark xl:hidden" aria-label="Search">
              <Search className="h-5 w-5" />
            </Link>
            <Link
              href={user ? (user.role === "admin" ? "/admin" : "/account") : "/login"}
              className="hidden px-2 text-[15px] font-medium tracking-[-0.01em] text-brand-dark hover:text-brand-green sm:block"
              title={user ? user.name : "Sign in"}
            >
              {user ? (user.role === "admin" ? "Admin" : user.name.split(" ")[0]) : "Log in"}
            </Link>
            <Link
              href="/account/wishlist"
              className="relative hidden rounded-full p-2.5 text-brand-dark/80 hover:text-brand-dark sm:flex"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5" />
              {wishlist.length > 0 && (
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-green text-[9px] font-semibold text-white">
                  {wishlist.length}
                </span>
              )}
            </Link>
            <button
              onClick={() => setIsCartOpen(true)}
              className="ml-1 flex h-10 items-center gap-2 rounded-xl bg-brand-dark px-4 text-sm font-medium text-white transition-colors hover:bg-black"
              aria-label="Open cart"
            >
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden md:inline">Bag</span>
              {cartCount > 0 && (
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-white px-1 text-[11px] font-semibold text-brand-dark">
                  {cartCount}
                </span>
              )}
            </button>
            <Link
              href="/category/gift-boxes"
              className="ml-1 hidden h-10 items-center rounded-xl border border-brand-dark/80 px-4 text-sm font-medium text-brand-dark transition-colors hover:bg-brand-dark hover:text-white 2xl:flex"
            >
              Gift boxes
            </Link>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-brand-border bg-white p-6 space-y-5">
          <div className="flex items-baseline border-b border-brand-border/70 pb-4">
            <span className="text-xl font-bold tracking-[-0.055em] text-brand-dark">NutriNation</span>
            <span className="ml-0.5 h-1.5 w-1.5 rounded-full bg-brand-green" />
          </div>
          <Link href="/products" onClick={() => setIsMobileMenuOpen(false)} className="block text-3xl font-semibold tracking-[-0.04em] text-brand-dark">
            Shop all
          </Link>
          <div className="grid grid-cols-2 gap-2 pt-2">
            {coreCategories.map((c) => (
              <Link
                key={c.id}
                href={`/category/${c.slug}`}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-sm text-brand-muted hover:text-brand-green py-1"
              >
                {c.name}
              </Link>
            ))}
          </div>
          <Link href="/category/gift-boxes" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 pt-2 text-sm">
            <Gift className="w-4 h-4 text-brand-saffron" /> Gift boxes
          </Link>
          <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)} className="block text-sm">
            Our story
          </Link>
        </div>
      )}
    </header>
  );
}
