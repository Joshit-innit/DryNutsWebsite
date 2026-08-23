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
  Flame,
  Layers,
} from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { CATEGORIES } from "@/data/mockData";

export default function Navbar() {
  const pathname = usePathname();
  const { cartCount, wishlist, setIsCartOpen, user } = useStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const coreCategories = CATEGORIES.filter(
    (c) => c.slug !== "combos" && c.slug !== "gift-boxes"
  );

  return (
    <header
      className={`sticky top-[33px] z-40 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-brand-border/60"
          : "bg-brand-cream border-b border-brand-border"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Mobile Menu Button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-brand-dark hover:text-brand-green transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-brand-green flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <span className="font-serif font-black text-xl tracking-tighter text-brand-saffron">N</span>
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-black text-xl sm:text-2xl tracking-wider text-brand-dark leading-none">
                NUTRI<span className="text-brand-green">NATION</span>
              </span>
              <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-[0.25em] text-brand-saffron mt-0.5">
                NOURISH NATURALLY
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-brand-dark">
            <Link
              href="/products"
              className={`hover:text-brand-green transition-colors ${
                pathname === "/products" ? "text-brand-green font-semibold" : ""
              }`}
            >
              Shop All
            </Link>

            {/* Categories Dropdown Trigger */}
            <div
              className="relative"
              onMouseEnter={() => setIsMegaMenuOpen(true)}
              onMouseLeave={() => setIsMegaMenuOpen(false)}
            >
              <button
                className={`flex items-center gap-1 hover:text-brand-green transition-colors py-2 ${
                  pathname.startsWith("/category") ? "text-brand-green font-semibold" : ""
                }`}
              >
                <span>Categories</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isMegaMenuOpen ? "rotate-180 text-brand-green" : ""}`} />
              </button>

              {/* Mega Menu Dropdown */}
              {isMegaMenuOpen && (
                <div className="absolute top-full -left-20 w-[640px] bg-white rounded-2xl shadow-2xl border border-brand-border p-6 grid grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="col-span-2 grid grid-cols-2 gap-2">
                    <div className="col-span-2 pb-2 mb-1 border-b border-brand-border/60 flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-brand-muted">
                        9 Core Harvest Categories
                      </span>
                      <Link
                        href="/products"
                        className="text-xs text-brand-green hover:underline font-medium"
                      >
                        View All (25+)
                      </Link>
                    </div>

                    {coreCategories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/category/${cat.slug}`}
                        onClick={() => setIsMegaMenuOpen(false)}
                        className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-brand-cream transition-colors group/item"
                      >
                        <div className="w-8 h-8 rounded-lg overflow-hidden relative flex-shrink-0 bg-brand-beige">
                          <img
                            src={cat.image}
                            alt={cat.name}
                            className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-300"
                          />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-brand-dark group-hover/item:text-brand-green">
                            {cat.name}
                          </p>
                          <p className="text-[10px] text-brand-muted line-clamp-1">
                            {cat.originHighlight.split(",")[0]}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {/* Curated highlights */}
                  <div className="bg-brand-cream/70 rounded-xl p-4 flex flex-col justify-between border border-brand-border/50">
                    <div>
                      <span className="inline-flex items-center gap-1 bg-brand-saffron/20 text-brand-dark px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mb-2">
                        <Sparkles className="w-3 h-3 text-brand-orange" /> Handcrafted
                      </span>
                      <h4 className="text-xs font-serif font-bold text-brand-dark mb-1">
                        Luxury Gift Caskets
                      </h4>
                      <p className="text-[11px] text-brand-muted mb-3">
                        Brass-accented heirloom boxes with top 1% harvest dry fruits.
                      </p>
                    </div>
                    <Link
                      href="/category/gift-boxes"
                      onClick={() => setIsMegaMenuOpen(false)}
                      className="inline-flex items-center justify-center text-xs font-semibold text-white bg-brand-green hover:bg-brand-green-dark px-3 py-2 rounded-lg transition-colors text-center"
                    >
                      Explore Gift Boxes
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/products?filter=bestseller"
              className="flex items-center gap-1 hover:text-brand-green transition-colors"
            >
              <Flame className="w-4 h-4 text-brand-orange" />
              <span>Best Sellers</span>
            </Link>

            <Link
              href="/category/combos"
              className="flex items-center gap-1 hover:text-brand-green transition-colors"
            >
              <Layers className="w-4 h-4 text-brand-green" />
              <span>Combos</span>
            </Link>

            <Link
              href="/category/gift-boxes"
              className="flex items-center gap-1 hover:text-brand-green transition-colors"
            >
              <Gift className="w-4 h-4 text-brand-saffron" />
              <span>Gift Boxes</span>
            </Link>

            <Link
              href="/contact"
              className={`hover:text-brand-green transition-colors ${
                pathname === "/contact" ? "text-brand-green font-semibold" : ""
              }`}
            >
              Our Story
            </Link>
          </nav>

          {/* Right Action Icons (Search, Wishlist, Account, Cart) */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Search Button */}
            <Link
              href="/search"
              className="p-2 text-brand-dark hover:text-brand-green hover:bg-brand-cream rounded-full transition-colors relative"
              aria-label="Search catalog"
            >
              <Search className="w-5 h-5" />
            </Link>

            {/* Wishlist Button */}
            <Link
              href="/account/wishlist"
              className="p-2 text-brand-dark hover:text-brand-green hover:bg-brand-cream rounded-full transition-colors relative hidden sm:flex"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-brand-orange text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Account Icon */}
            <Link
              href="/account"
              className="p-2 text-brand-dark hover:text-brand-green hover:bg-brand-cream rounded-full transition-colors hidden sm:flex"
              aria-label="Account"
            >
              <User className="w-5 h-5" />
            </Link>

            {/* Cart Drawer Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2 bg-brand-green hover:bg-brand-green-dark text-white px-3.5 sm:px-4 py-2 rounded-xl text-sm font-semibold shadow-sm hover:shadow-md transition-all group"
              aria-label="Open cart drawer"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:scale-110" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-brand-saffron text-brand-dark text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-sm animate-pulse">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="hidden md:inline">Cart</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[113px] bg-white z-50 overflow-y-auto p-6 animate-in slide-in-from-left duration-200">
          <div className="flex flex-col space-y-4">
            <Link
              href="/products"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-base font-semibold text-brand-dark py-2 border-b border-brand-border"
            >
              Shop All Dry Fruits
            </Link>

            <div className="py-2 border-b border-brand-border">
              <span className="text-xs uppercase font-bold text-brand-muted tracking-wider block mb-3">
                9 Core Harvest Categories
              </span>
              <div className="grid grid-cols-2 gap-2">
                {coreCategories.map((c) => (
                  <Link
                    key={c.id}
                    href={`/category/${c.slug}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-sm font-medium text-brand-dark hover:text-brand-green p-2 rounded-lg bg-brand-cream/50"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>

            <Link
              href="/category/combos"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-base font-medium text-brand-dark py-2 border-b border-brand-border flex items-center justify-between"
            >
              <span>Curated Combos</span>
              <Sparkles className="w-4 h-4 text-brand-orange" />
            </Link>

            <Link
              href="/category/gift-boxes"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-base font-medium text-brand-dark py-2 border-b border-brand-border flex items-center justify-between"
            >
              <span>Festive Gift Boxes</span>
              <Gift className="w-4 h-4 text-brand-saffron" />
            </Link>

            <Link
              href="/account"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-base font-medium text-brand-dark py-2 border-b border-brand-border"
            >
              My Account & Orders
            </Link>

            <Link
              href="/contact"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-base font-medium text-brand-dark py-2"
            >
              Contact & Sourcing Story
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
