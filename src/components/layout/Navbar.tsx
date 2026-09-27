"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  Heart,
  ShoppingBag,
  User,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  Gift,
} from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { CATEGORIES } from "@/data/mockData";

export default function Navbar() {
  const pathname = usePathname();
  const { cartCount, wishlist, setIsCartOpen } = useStore();
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
    `text-[13px] tracking-wide transition-colors ${
      active ? "text-brand-green" : "text-brand-dark/80 hover:text-brand-green"
    }`;

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        isScrolled
          ? "bg-[#FBF7F1]/90 backdrop-blur-xl shadow-subtle border-b border-brand-border/70"
          : "bg-brand-cream/80 backdrop-blur-md border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[4.5rem]">
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-brand-dark"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-full bg-brand-dark flex items-center justify-center transition-transform duration-300 group-hover:scale-105 shadow-sm border border-brand-border">
              <span className="font-display text-sm font-bold text-brand-saffron tracking-tighter leading-none">N</span>
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="font-display text-base font-bold tracking-[0.1em] uppercase leading-none text-brand-dark group-hover:text-brand-saffron transition-colors">
                NutHub
              </span>
              <span className="text-[8.5px] font-bold tracking-[0.24em] uppercase text-brand-saffron mt-1">
                Artisan Dry Fruits
              </span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            <Link href="/products" className={navLink(pathname === "/products")}>
              Shop
            </Link>

            <div
              className="relative"
              onMouseEnter={() => setIsMegaMenuOpen(true)}
              onMouseLeave={() => setIsMegaMenuOpen(false)}
            >
              <button className={`${navLink(pathname.startsWith("/category"))} flex items-center gap-1 py-2`}>
                Harvests
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${isMegaMenuOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isMegaMenuOpen && (
                <div className="absolute top-full -left-16 w-[620px] bg-[#FBF7F1] rounded-2xl shadow-card border border-brand-border p-5 grid grid-cols-3 gap-3">
                  <div className="col-span-2 grid grid-cols-2 gap-1">
                    {coreCategories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/category/${cat.slug}`}
                        onClick={() => setIsMegaMenuOpen(false)}
                        className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-brand-beige/70 transition-colors"
                      >
                        <div className="w-9 h-9 rounded-lg overflow-hidden bg-brand-beige shrink-0">
                          <img src={cat.image} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-brand-dark">{cat.name}</p>
                          <p className="text-[11px] text-brand-muted line-clamp-1">
                            {cat.originHighlight.split(",")[0]}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <div className="rounded-xl bg-brand-green p-4 flex flex-col justify-between text-[#F7F1E8]">
                    <div>
                      <Sparkles className="w-4 h-4 text-brand-saffron mb-2" />
                      <h4 className="font-serif text-lg">Gift caskets</h4>
                      <p className="text-[11px] text-white/65 mt-1 leading-relaxed">
                        Heirloom boxes filled with top-grade lots.
                      </p>
                    </div>
                    <Link
                      href="/category/gift-boxes"
                      onClick={() => setIsMegaMenuOpen(false)}
                      className="mt-4 text-xs tracking-wider uppercase text-brand-saffron"
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

          <div className="flex items-center gap-1 sm:gap-2">
            <Link href="/search" className="p-2.5 text-brand-dark/80 hover:text-brand-green rounded-full" aria-label="Search">
              <Search className="w-5 h-5" />
            </Link>
            <Link
              href="/account/wishlist"
              className="p-2.5 text-brand-dark/80 hover:text-brand-green rounded-full relative hidden sm:flex"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-brand-orange text-white text-[9px] font-semibold rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </Link>
            <Link href="/account" className="p-2.5 text-brand-dark/80 hover:text-brand-green rounded-full hidden sm:flex" aria-label="Account">
              <User className="w-5 h-5" />
            </Link>
            <button
              onClick={() => setIsCartOpen(true)}
              className="ml-1 flex items-center gap-2 bg-brand-green text-[#F7F1E8] pl-3 pr-4 py-2 rounded-full text-sm font-medium hover:bg-brand-green-dark transition-colors"
              aria-label="Open cart"
            >
              <span className="relative">
                <ShoppingBag className="w-4 h-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-brand-saffron text-brand-dark text-[9px] font-semibold w-4 h-4 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </span>
              <span className="hidden md:inline text-[13px]">Bag</span>
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-brand-border bg-[#FBF7F1] p-6 space-y-4">
          <Link href="/products" onClick={() => setIsMobileMenuOpen(false)} className="block font-serif text-2xl">
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
