"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Award,
  ShieldCheck,
  Truck,
  Leaf,
  CheckCircle2,
  Star,
  Sparkles,
} from "lucide-react";
import { CATEGORIES, PRODUCTS, REVIEWS } from "@/data/mockData";
import ProductCard from "@/components/products/ProductCard";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1606923829579-0cb981a83e2e?auto=format&fit=crop&w=2000&q=80";
const EDITORIAL_IMAGE =
  "https://images.unsplash.com/photo-1599599810769-bcde5a160d25?auto=format&fit=crop&w=1800&q=80";
const STORY_LEFT =
  "https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=900&q=80";
const STORY_RIGHT =
  "https://images.unsplash.com/photo-1606313564200-e75d5e30476e?auto=format&fit=crop&w=900&q=80";

const ORIGINS = [
  "Kashmir Mamra",
  "Mangalore W-180",
  "Kerman Pistachio",
  "Jordan Medjool",
  "Malatya Apricot",
  "Kandahar Anjeer",
  "Pahalgam Walnut",
  "Sangli Kishmish",
];

export default function HomePage() {
  const coreCategories = CATEGORIES.filter(
    (c) => c.slug !== "combos" && c.slug !== "gift-boxes"
  );
  const bestSellers = PRODUCTS.filter((p) => p.isBestSeller).slice(0, 4);
  const combos = PRODUCTS.filter((p) => p.category === "combos" || p.category === "gift-boxes");

  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative min-h-[92vh] flex items-end lg:items-center">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={HERO_IMAGE}
            alt="Assorted premium dry fruits"
            className="h-full w-full object-cover animate-kenburns"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/55 to-brand-dark/25" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-3xl text-white"
          >
            <p className="eyebrow text-brand-saffron mb-5">Harvest 2026 · Single-estate lots</p>
            <h1 className="font-serif font-medium text-[3.1rem] sm:text-6xl lg:text-7xl leading-[0.95] text-[#FBF7F1]">
              The orchard,
              <br />
              <span className="italic font-normal text-brand-saffron">distilled.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base sm:text-lg text-white/78 leading-relaxed font-light">
              Kashmiri Mamra, King W-180 cashews, and mountain-cured fruit — selected for aroma,
              snapped for crunch, sealed in nitrogen so it arrives as it left the grove.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <Link href="/products" className="btn-primary bg-brand-saffron text-brand-dark hover:bg-[#d4b688]">
                Shop the harvest
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/products?filter=bestseller" className="btn-ghost text-white border-white/40">
                Best sellers
              </Link>
            </div>
          </motion.div>

          <div className="mt-16 grid grid-cols-3 gap-6 max-w-lg border-t border-white/15 pt-6 text-white">
            {[
              ["100%", "Raw & unsweetened"],
              ["Top 1%", "Grade selection"],
              ["Zero", "Added oils"],
            ].map(([stat, label]) => (
              <div key={label}>
                <p className="font-serif text-2xl sm:text-3xl italic text-brand-saffron">{stat}</p>
                <p className="text-[11px] tracking-wide text-white/60 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Origin marquee */}
      <div className="border-y border-brand-border bg-brand-cream-light overflow-hidden py-4">
        <div className="flex w-max animate-marquee gap-10 whitespace-nowrap">
          {[...ORIGINS, ...ORIGINS].map((origin, i) => (
            <span key={`${origin}-${i}`} className="flex items-center gap-10 text-xs tracking-[0.22em] uppercase text-brand-muted">
              {origin}
              <span className="text-brand-saffron">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <p className="eyebrow mb-3">Nine essential harvests</p>
              <h2 className="font-serif text-4xl sm:text-5xl font-medium text-brand-dark leading-tight">
                From grove to tin
              </h2>
            </div>
            <p className="text-sm text-brand-muted max-w-md leading-relaxed">
              Each lot is graded by hand — extra-light walnut halves, jumbo cashews, unsulfured fruit.
              Nothing roasted in oil. Nothing dyed.
            </p>
          </div>
        </Reveal>

        <Stagger className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
          {coreCategories.map((cat, i) => (
            <StaggerItem key={cat.id} className={i === 0 ? "col-span-2 lg:col-span-1 lg:row-span-2" : ""}>
              <Link
                href={`/category/${cat.slug}`}
                className={`group relative overflow-hidden rounded-[1.4rem] bg-brand-beige block ${
                  i === 0 ? "h-64 sm:h-80 lg:h-full min-h-[22rem]" : "h-56 sm:h-64"
                }`}
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 via-brand-dark/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6 text-white">
                  <p className="text-[10px] tracking-[0.2em] uppercase text-brand-saffron mb-1">
                    {cat.originHighlight.split(",")[0]}
                  </p>
                  <h3 className="font-serif text-2xl sm:text-3xl font-medium">{cat.name}</h3>
                  <p className="text-xs text-white/70 mt-1 line-clamp-1">{cat.tagline}</p>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* Bestsellers */}
      <section className="bg-brand-cream-light/80 border-y border-brand-border py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
              <div>
                <p className="eyebrow mb-3">Most requested lots</p>
                <h2 className="font-serif text-4xl sm:text-5xl font-medium">House favorites</h2>
              </div>
              <Link
                href="/products?filter=bestseller"
                className="text-sm font-medium text-brand-green inline-flex items-center gap-2 group"
              >
                View all
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {bestSellers.map((product, idx) => (
              <ProductCard key={product.id} product={product} priority={idx < 2} />
            ))}
          </div>
        </div>
      </section>

      {/* Editorial banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
        <Reveal>
          <div className="relative min-h-[28rem] rounded-[2rem] overflow-hidden">
            <img src={EDITORIAL_IMAGE} alt="Almonds in a ceramic bowl" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-brand-dark/88 via-brand-dark/55 to-transparent" />
            <div className="relative z-10 max-w-lg p-8 sm:p-14 text-white">
              <p className="eyebrow mb-4">Nitrogen-sealed freshness</p>
              <h2 className="font-serif text-4xl sm:text-5xl font-medium leading-tight">
                Crunch that lasts past the first handful.
              </h2>
              <p className="mt-5 text-sm text-white/75 leading-relaxed font-light">
                Delicate oils in almonds and walnuts go rancid in cheap pouches. We flush every tin
                with nitrogen so the harvest stays bright, sweet, and snapping-crisp.
              </p>
              <Link href="/products" className="btn-primary mt-8 bg-white text-brand-dark hover:bg-brand-cream">
                Shop collection
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <Reveal>
          <div className="text-center mb-12">
            <p className="eyebrow mb-3">The standard</p>
            <h2 className="font-serif text-4xl font-medium">Why it tastes different</h2>
          </div>
        </Reveal>
        <Stagger className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Leaf, title: "Never oil-roasted", body: "Raw or dry-roasted lots only. No hydrogenated fats." },
            { icon: Award, title: "Grade, not bulk", body: "W-180 cashews and extra-light walnut halves, not mixed sizes." },
            { icon: ShieldCheck, title: "Triple sorted", body: "Hand-checked for splits, moisture, and foreign matter." },
            { icon: Truck, title: "Air across India", body: "Insured transit. Free express over ₹999." },
          ].map(({ icon: Icon, title, body }) => (
            <StaggerItem key={title}>
              <div className="h-full rounded-3xl border border-brand-border bg-white/70 p-6 hover:border-brand-saffron/50 transition-colors">
                <div className="w-11 h-11 rounded-full bg-brand-green/10 text-brand-green flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-xl font-medium mb-2">{title}</h3>
                <p className="text-sm text-brand-muted leading-relaxed">{body}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* Combos */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <Reveal>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <p className="eyebrow mb-3">Composed for the table</p>
              <h2 className="font-serif text-4xl sm:text-5xl font-medium">Combos & gift caskets</h2>
            </div>
            <Link href="/category/combos" className="text-sm font-medium text-brand-green inline-flex items-center gap-2 group">
              Explore all
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {combos.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Story */}
      <section className="bg-brand-dark text-[#F7F1E8] py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-14 items-center">
          <Reveal className="lg:col-span-6 space-y-6">
            <p className="eyebrow">Sourcing philosophy</p>
            <h2 className="font-serif text-4xl sm:text-5xl font-medium leading-tight">
              From nature
              <br />
              <span className="italic text-brand-saffron">to your table.</span>
            </h2>
            <p className="text-white/70 leading-relaxed font-light">
              Industrial snack brands roast in cheap oil and dust with flavor. We keep the botanical
              character of each fruit — cold-cracked almonds, sun-cured figs, and cashews graded like gems.
            </p>
            <div className="space-y-4 pt-2">
              <div className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-brand-saffron shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Direct orchard relationships</p>
                  <p className="text-sm text-white/55">Kashmir, Mangalore, Jordan Valley, Malatya.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-brand-saffron shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Hermetic, nitrogen-flushed tins</p>
                  <p className="text-sm text-white/55">Zero humidity in. Crunch stays as harvest day.</p>
                </div>
              </div>
            </div>
            <Link href="/contact" className="inline-flex items-center gap-2 text-sm text-brand-saffron hover:text-white transition-colors pt-2">
              Read the sourcing story
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Reveal>
          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            <div className="aspect-[3/4] rounded-3xl overflow-hidden">
              <img src={STORY_LEFT} alt="Cashews" className="h-full w-full object-cover" />
            </div>
            <div className="aspect-[3/4] rounded-3xl overflow-hidden mt-8">
              <img src={STORY_RIGHT} alt="Dried figs" className="h-full w-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <Reveal>
          <div className="text-center mb-12">
            <p className="eyebrow mb-3">Verified notes</p>
            <h2 className="font-serif text-4xl sm:text-5xl font-medium">What regulars notice</h2>
          </div>
        </Reveal>
        <Stagger className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {REVIEWS.slice(0, 3).map((review) => (
            <StaggerItem key={review.id}>
              <blockquote className="h-full rounded-3xl border border-brand-border bg-white/80 p-7 flex flex-col justify-between">
                <div>
                  <div className="flex gap-1 text-brand-saffron mb-4">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-brand-saffron" />
                    ))}
                  </div>
                  <p className="font-serif text-xl italic text-brand-dark leading-snug mb-3">
                    “{review.title}”
                  </p>
                  <p className="text-sm text-brand-muted leading-relaxed">{review.comment}</p>
                </div>
                <footer className="pt-6 mt-6 border-t border-brand-border flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium">{review.customerName}</p>
                    <p className="text-xs text-brand-muted">{review.location}</p>
                  </div>
                  <span className="text-[10px] tracking-wider uppercase text-brand-green">Verified</span>
                </footer>
              </blockquote>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* Final CTA */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-7xl mx-auto rounded-[2rem] bg-brand-green text-[#F7F1E8] px-8 py-16 sm:py-20 text-center relative overflow-hidden">
          <Sparkles className="absolute top-8 right-10 w-8 h-8 text-brand-saffron/40" />
          <p className="eyebrow mb-4">Everyday wellness</p>
          <h2 className="font-serif text-4xl sm:text-5xl font-medium">Nourish naturally.</h2>
          <p className="mt-4 max-w-lg mx-auto text-white/70 font-light">
            A handful that actually tastes like the tree it came from.
          </p>
          <Link
            href="/products"
            className="btn-primary mt-8 bg-brand-saffron text-brand-dark hover:bg-[#d4b688]"
          >
            Shop the collection
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
