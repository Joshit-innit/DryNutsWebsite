"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  Award,
  ShieldCheck,
  Truck,
  Leaf,
  CheckCircle2,
  ChevronRight,
  Star,
  Flame,
  Heart,
  Layers,
  Gift,
  RefreshCw,
} from "lucide-react";
import { CATEGORIES, PRODUCTS, REVIEWS } from "@/data/mockData";
import ProductCard from "@/components/products/ProductCard";
import { formatPrice } from "@/lib/utils";

export default function HomePage() {
  const [activeCategoryTab, setActiveCategoryTab] = useState<string>("all");

  const coreCategories = CATEGORIES.filter(
    (c) => c.slug !== "combos" && c.slug !== "gift-boxes"
  );
  const bestSellers = PRODUCTS.filter((p) => p.isBestSeller).slice(0, 4);
  const combos = PRODUCTS.filter((p) => p.category === "combos" || p.category === "gift-boxes");
  const newArrivals = PRODUCTS.filter((p) => p.isNew || p.isFeatured).slice(0, 4);

  return (
    <div className="space-y-20 sm:space-y-28 overflow-hidden">
      {/* =========================================================================
          1. HERO SECTION (85-90vh on Desktop)
          ========================================================================= */}
      <section className="relative min-h-[85vh] lg:min-h-[90vh] bg-gradient-to-b from-brand-cream via-brand-beige/30 to-brand-cream flex items-center justify-center pt-8 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Subtle Ambient Glows */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-brand-green/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-brand-saffron/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* Left Hero Copy */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-white/90 border border-brand-border px-3.5 py-1.5 rounded-full shadow-xs">
              <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-brand-dark">
                2026 Fresh Harvest Now In Stock
              </span>
            </div>

            <h1 className="font-serif font-black text-4xl sm:text-6xl lg:text-7xl text-brand-dark tracking-tight leading-[1.05]">
              NOURISH <br />
              <span className="text-brand-green italic font-serif">NATURALLY.</span>
            </h1>

            <p className="text-base sm:text-lg text-brand-muted max-w-xl mx-auto lg:mx-0 leading-relaxed font-sans">
              Hand-cracked Kashmiri Mamra almonds, King W-180 Mangalore cashews, and mountain-cured dry fruits selected for pure everyday wellness.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                href="/products"
                className="w-full sm:w-auto bg-brand-green hover:bg-brand-green-dark text-white font-semibold px-8 py-4 rounded-2xl text-sm shadow-md hover:shadow-hover transition-all flex items-center justify-center gap-2 group"
              >
                <span>SHOP DRY FRUITS</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/products?filter=bestseller"
                className="w-full sm:w-auto bg-white hover:bg-brand-cream text-brand-dark border border-brand-border font-semibold px-8 py-4 rounded-2xl text-sm transition-colors flex items-center justify-center gap-2"
              >
                <Flame className="w-4 h-4 text-brand-orange" />
                <span>EXPLORE BEST SELLERS</span>
              </Link>
            </div>

            {/* Quick Metrics Bar */}
            <div className="pt-6 grid grid-cols-3 gap-4 border-t border-brand-border/80 max-w-lg mx-auto lg:mx-0 text-left">
              <div>
                <span className="block font-serif font-bold text-xl text-brand-dark">100%</span>
                <span className="text-[11px] text-brand-muted">Natural & Raw</span>
              </div>
              <div>
                <span className="block font-serif font-bold text-xl text-brand-green">Top 1%</span>
                <span className="text-[11px] text-brand-muted">Grade Selection</span>
              </div>
              <div>
                <span className="block font-serif font-bold text-xl text-brand-saffron">Zero</span>
                <span className="text-[11px] text-brand-muted">Added Preservatives</span>
              </div>
            </div>
          </div>

          {/* Right Hero Visual Composition */}
          <div className="lg:col-span-6 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Central Hero Master Image */}
              <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-brand-beige relative group">
                <img
                  src="https://images.unsplash.com/photo-1599785209707-a456fc1337bb?auto=format&fit=crop&w=1200&q=80"
                  alt="NutriNation Luxury Dry Fruit Assortment"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="text-[11px] uppercase font-bold tracking-widest text-brand-saffron">
                    Gourmet Reserve
                  </span>
                  <p className="font-serif font-bold text-base sm:text-lg">
                    The 9 Core Harvest Superfruits
                  </p>
                </div>
              </div>

              {/* Floating Badge 1: Top Right */}
              <div className="absolute -top-6 -right-4 sm:-right-6 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-brand-border/60 flex items-center gap-3 animate-float-slow">
                <div className="w-10 h-10 rounded-xl bg-brand-green/20 text-brand-green flex items-center justify-center flex-shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-brand-dark">Authentic Kashmiri</p>
                  <p className="text-[10px] text-brand-muted">Mamra Giri Almonds</p>
                </div>
              </div>

              {/* Floating Badge 2: Bottom Left */}
              <div className="absolute -bottom-6 -left-4 sm:-left-6 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-brand-border/60 flex items-center gap-3 animate-float-slow">
                <div className="w-10 h-10 rounded-xl bg-brand-saffron/20 text-brand-saffron flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-brand-dark">Grade W-180</p>
                  <p className="text-[10px] text-brand-muted">King Size Cashews</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. CORE HARVEST CATEGORIES SECTION ("EXPLORE OUR HARVEST")
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-brand-green block mb-1">
              FARM TO CONNOISSEUR
            </span>
            <h2 className="font-serif font-black text-3xl sm:text-4xl text-brand-dark">
              EXPLORE OUR HARVEST
            </h2>
          </div>
          <p className="text-sm text-brand-muted max-w-md">
            The nine essential pillar dry fruits cultivated across certified organic mountain groves and coastal estates.
          </p>
        </div>

        {/* Categories Grid (Organic layout on desktop, scrollable on mobile) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-6">
          {coreCategories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="group relative rounded-2xl sm:rounded-3xl overflow-hidden bg-white border border-brand-border/80 shadow-subtle hover:shadow-hover hover:border-brand-green/40 transition-all duration-300 flex flex-col h-64 sm:h-72"
            >
              <div className="relative w-full h-full overflow-hidden bg-brand-cream">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/85 via-brand-dark/30 to-transparent" />
              </div>

              <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5 text-white flex flex-col justify-end">
                <span className="text-[10px] uppercase font-bold tracking-wider text-brand-saffron mb-0.5">
                  {cat.originHighlight.split(",")[0]}
                </span>
                <h3 className="font-serif font-bold text-lg sm:text-xl text-white mb-1 group-hover:text-brand-saffron transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-white/80 line-clamp-1 mb-2 font-sans">
                  {cat.tagline}
                </p>
                <div className="flex items-center gap-1 text-[11px] font-semibold text-brand-green-light">
                  <span>Explore Harvest</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* =========================================================================
          3. BEST SELLERS ("THE NUTRINATION FAVORITES")
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-brand-orange block mb-1">
              MOST LOVED HARVEST
            </span>
            <h2 className="font-serif font-black text-3xl sm:text-4xl text-brand-dark">
              THE NUTRINATION FAVORITES
            </h2>
          </div>
          <Link
            href="/products?filter=bestseller"
            className="text-xs font-bold uppercase tracking-wider text-brand-green hover:text-brand-green-dark flex items-center gap-1 group"
          >
            <span>View All Bestsellers</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestSellers.map((product, idx) => (
            <ProductCard key={product.id} product={product} priority={idx < 2} />
          ))}
        </div>
      </section>

      {/* =========================================================================
          4. PROMOTIONAL EDITORIAL BANNER ("GOODNESS IN EVERY BITE")
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-brand-dark text-white min-h-[420px] flex items-center shadow-2xl">
          {/* Background image with cinematic gradient */}
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&w=1600&q=80"
              alt="Editorial Almonds & Figs"
              className="w-full h-full object-cover opacity-35 filter scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-brand-dark via-brand-dark/90 to-transparent" />
          </div>

          <div className="relative z-10 p-8 sm:p-14 max-w-2xl space-y-6">
            <span className="inline-flex items-center gap-1.5 bg-brand-saffron/20 border border-brand-saffron/40 text-brand-saffron px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> PURE BOTANICAL HARVEST
            </span>

            <h2 className="font-serif font-black text-3xl sm:text-5xl text-white tracking-tight leading-tight">
              GOODNESS <br />
              IN EVERY BITE.
            </h2>

            <p className="text-sm sm:text-base text-white/80 leading-relaxed font-sans">
              Discover premium dry fruits selected for quality, aroma and pristine freshness. Cold-cracked in nitrogen-sealed packages to guarantee maximum natural nutrient retention.
            </p>

            <div className="pt-2">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-brand-saffron hover:bg-brand-orange text-brand-dark font-bold text-sm px-8 py-4 rounded-2xl transition-all shadow-md group"
              >
                <span>SHOP COLLECTION</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. WHY NUTRINATION (6 Minimal Line Pillars)
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-green block mb-1">
            THE NUTRINATION STANDARD
          </span>
          <h2 className="font-serif font-black text-3xl text-brand-dark">
            WHY CONNOISSEURS CHOOSE US
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          <div className="bg-white rounded-2xl p-5 border border-brand-border text-center flex flex-col items-center justify-center space-y-2 hover:border-brand-green/40 transition-colors shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-brand-green/10 text-brand-green flex items-center justify-center mb-1">
              <Leaf className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-xs sm:text-sm text-brand-dark">100% Natural</h4>
            <p className="text-[11px] text-brand-muted">No additives or colors</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-brand-border text-center flex flex-col items-center justify-center space-y-2 hover:border-brand-green/40 transition-colors shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-brand-saffron/10 text-brand-saffron flex items-center justify-center mb-1">
              <Award className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-xs sm:text-sm text-brand-dark">Premium Quality</h4>
            <p className="text-[11px] text-brand-muted">Top 1% grade kernels</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-brand-border text-center flex flex-col items-center justify-center space-y-2 hover:border-brand-green/40 transition-colors shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-brand-orange/10 text-brand-orange flex items-center justify-center mb-1">
              <Sparkles className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-xs sm:text-sm text-brand-dark">Freshly Packed</h4>
            <p className="text-[11px] text-brand-muted">Nitrogen fresh sealed</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-brand-border text-center flex flex-col items-center justify-center space-y-2 hover:border-brand-green/40 transition-colors shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-brand-green/10 text-brand-green flex items-center justify-center mb-1">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-xs sm:text-sm text-brand-dark">Quality Checked</h4>
            <p className="text-[11px] text-brand-muted">Triple sorted by hand</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-brand-border text-center flex flex-col items-center justify-center space-y-2 hover:border-brand-green/40 transition-colors shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-brand-dark/10 text-brand-dark flex items-center justify-center mb-1">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-xs sm:text-sm text-brand-dark">Secure Payments</h4>
            <p className="text-[11px] text-brand-muted">256-bit encrypted checkout</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-brand-border text-center flex flex-col items-center justify-center space-y-2 hover:border-brand-green/40 transition-colors shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-brand-green/10 text-brand-green flex items-center justify-center mb-1">
              <Truck className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-xs sm:text-sm text-brand-dark">Fast Delivery</h4>
            <p className="text-[11px] text-brand-muted">Air express across India</p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. CURATED COMBINATIONS & FESTIVE BOXES
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-brand-saffron block mb-1">
              HANDCRAFTED CURATIONS
            </span>
            <h2 className="font-serif font-black text-3xl sm:text-4xl text-brand-dark">
              CURATED COMBINATIONS
            </h2>
          </div>
          <Link
            href="/category/combos"
            className="text-xs font-bold uppercase tracking-wider text-brand-green hover:text-brand-green-dark flex items-center gap-1 group"
          >
            <span>Explore All Combos</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {combos.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* =========================================================================
          7. PINNED EDITORIAL STORY SECTION ("FROM NATURE TO YOUR TABLE")
          ========================================================================= */}
      <section className="bg-brand-dark text-white py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Editorial Copy */}
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs uppercase font-bold tracking-widest text-brand-saffron">
              OUR HARVEST PHILOSOPHY
            </span>
            <h2 className="font-serif font-black text-4xl sm:text-5xl text-white tracking-tight leading-tight">
              FROM NATURE <br />
              TO YOUR TABLE.
            </h2>
            <p className="text-base text-white/80 leading-relaxed font-sans">
              Unlike industrial snack brands that roast in hydrogenated oils and dust with synthetic flavorings, NutriNation preserves the raw botanical soul of every dry fruit.
            </p>
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-brand-green/20 text-brand-green-light flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Direct Orchard Relationships</h4>
                  <p className="text-xs text-white/70">Single-estate sourcing from Kashmir, Mangalore, and Mediterranean valleys.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-brand-green/20 text-brand-green-light flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Nitrogen-Flushed Hermetic Tin Packaging</h4>
                  <p className="text-xs text-white/70">Zero humidity entry. Your almonds and cashews remain just as crisp as harvest day.</p>
                </div>
              </div>
            </div>
            <div className="pt-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 text-xs uppercase font-bold tracking-widest text-brand-saffron hover:text-white transition-colors"
              >
                <span>Read Full Sourcing Story</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right Dual Image Showcase */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-white/5 border border-white/10">
              <img
                src="https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&w=800&q=80"
                alt="Harvest King Cashews"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-white/5 border border-white/10 translate-y-6">
              <img
                src="https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=800&q=80"
                alt="Harvest Afghani Anjeer"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          8. CUSTOMER REVIEWS (Editorial Testimonials)
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-green block mb-1">
            VERIFIED REVIEWS
          </span>
          <h2 className="font-serif font-black text-3xl sm:text-4xl text-brand-dark">
            CONNOISSEUR EXPERIENCES
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {REVIEWS.slice(0, 3).map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border/80 shadow-subtle flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-1 text-brand-saffron mb-4">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-brand-saffron" />
                  ))}
                </div>
                <h4 className="font-serif font-bold text-base text-brand-dark mb-2">
                  &ldquo;{review.title}&rdquo;
                </h4>
                <p className="text-xs text-brand-muted leading-relaxed mb-6 font-sans">
                  {review.comment}
                </p>
              </div>

              <div className="pt-4 border-t border-brand-border flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-brand-dark">{review.customerName}</p>
                  <p className="text-[11px] text-brand-muted">{review.location}</p>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-brand-green bg-brand-green/10 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" /> Verified Buyer
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          9. FINAL DRAMATIC CTA ("NOURISH NATURALLY")
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="rounded-3xl bg-gradient-to-br from-brand-green to-brand-green-dark text-white p-8 sm:p-16 text-center relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <span className="text-xs uppercase font-bold tracking-widest text-brand-saffron">
              START YOUR WELLNESS JOURNEY
            </span>
            <h2 className="font-serif font-black text-3xl sm:text-5xl tracking-tight text-white">
              NOURISH NATURALLY.
            </h2>
            <p className="text-sm sm:text-base text-white/90 leading-relaxed font-sans">
              Discover premium dry fruits selected with meticulous care for your family&apos;s daily vitality and celebration.
            </p>
            <div className="pt-2">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-white hover:bg-brand-cream text-brand-dark font-bold text-sm px-8 py-4 rounded-2xl transition-all shadow-lg hover:shadow-xl group"
              >
                <span>SHOP THE HARVEST COLLECTION</span>
                <ArrowRight className="w-4 h-4 text-brand-green group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
