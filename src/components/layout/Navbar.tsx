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
    <header className={`sticky top-0 z-40 border-b transition-colors ${isScrolled ? "border-brand-border bg-white" : "border-transparent bg-brand-cream"}`}>
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

          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group">
            <div className="w-9 h-9 rounded-md bg-brand-green flex items-center justify-center">
              <span className="font-casanova text-xl text-white leading-none pt-0.5">N</span>
            </div>
            <div className="flex flex-col">
              <span className="font-casanova text-[1.35rem] sm:text-[1.5rem] tracking-[0.035em] leading-none text-brand-dark group-hover:text-brand-green transition-colors font-normal">
                NutriNation
              </span>
              <span className="text-[8.5px] sm:text-[9px] tracking-[0.22em] uppercase text-brand-green mt-1 font-sans font-medium">
                Nourish naturally
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
                <div id="harvest-menu" className="absolute top-full -left-16 w-[620px] bg-white border border-brand-border p-5 grid grid-cols-3 gap-3 shadow-card">
                  <div className="col-span-2 grid grid-cols-2 gap-1">
                    {coreCategories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/category/${cat.slug}`}
                        onClick={() => setIsMegaMenuOpen(false)}
                        className="flex items-center gap-2.5 p-2 hover:bg-brand-cream transition-colors"
                      >
                        <div className="w-9 h-9 rounded-lg overflow-hidden bg-brand-beige shrink-0">
                          <img src={cat.image} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-brand-dark">{cat.name}</p>
                          <p className="text-[11px] text-brand-muted">Shop category</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <div className="bg-brand-green p-4 flex flex-col justify-between text-white">
                    <div>
                      <h4 className="font-serif text-lg">Gift caskets</h4>
                      <p className="text-[11px] text-white/65 mt-1 leading-relaxed">
                        Gift boxes and combinations for sharing.
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
              className="ml-1 flex items-center gap-2 bg-brand-green text-white pl-3 pr-4 py-2 rounded-md text-sm font-medium hover:bg-brand-green-dark transition-colors"
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
        <div className="lg:hidden border-t border-brand-border bg-white p-6 space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-brand-border/70">
            <div className="w-8 h-8 rounded-md bg-brand-green flex items-center justify-center">
              <span className="font-casanova text-base text-white leading-none pt-0.5">N</span>
            </div>
            <span className="font-casanova text-xl tracking-[0.035em] text-brand-dark">
              NutriNation
            </span>
          </div>
          <Link href="/products" onClick={() => setIsMobileMenuOpen(false)} className="block font-marcellus text-2xl text-brand-dark">
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
