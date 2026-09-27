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
  const [products, setProducts] = React.useState<any[]>(PRODUCTS);

  React.useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/v1/products", { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          if (json.data?.length) {
            setProducts(json.data);
          }
        }
      } catch {
        // Fallback to initial PRODUCTS
      }
    }
    load();
  }, []);

  const coreCategories = CATEGORIES.filter(
    (c) => c.slug !== "combos" && c.slug !== "gift-boxes"
  );
  const bestSellers = products.filter((p) => p.isBestSeller).slice(0, 4);
  const combos = products.filter((p) => p.category === "combos" || p.category === "gift-boxes");

  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative min-h-[92vh] flex items-end lg:items-center">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={HERO_IMAGE}
            alt="Assorted premium dry fruits"
            className="h-full w-full object-cover animate-kenburns brightness-[0.88]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/60 to-brand-dark/30" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl text-white"
          >
            <p className="eyebrow text-brand-saffron tracking-[0.24em] mb-4">
              Single-Estate Harvest 2026 · Cold-Packed
            </p>
            <h1 className="font-serif font-bold text-4xl sm:text-6xl lg:text-7xl leading-[1.04] text-brand-cream tracking-tight">
              The orchard,
              <br />
              <span className="italic font-normal text-brand-saffron">distilled.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base sm:text-lg text-brand-cream/80 leading-relaxed font-light">
              Kashmiri Mamra, King W-180 cashews, and mountain-cured fruit — selected for natural aroma,
              hand-graded for crunch, and hermetically sealed in nitrogen.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <Link href="/products" className="btn-primary bg-brand-saffron text-brand-dark hover:bg-brand-saffron-light border-brand-saffron font-bold">
                Shop the harvest
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/products?filter=bestseller" className="btn-ghost text-brand-cream border-brand-cream/40 hover:bg-white/10 font-semibold">
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
              <p className="eyebrow text-brand-saffron mb-2">Nine Essential Harvests</p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-dark tracking-tight leading-tight">
                From grove to table.
              </h2>
            </div>
            <p className="text-sm text-brand-muted max-w-md leading-relaxed">
              Each lot is graded by hand — extra-light walnut halves, jumbo king cashews, and unsulfured mountain fruit.
              Zero added oils, dyes, or syrups.
            </p>
          </div>
        </Reveal>

        <Stagger className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
          {coreCategories.map((cat, i) => (
            <StaggerItem key={cat.id} className={i === 0 ? "col-span-2 lg:col-span-1 lg:row-span-2" : ""}>
              <Link
                href={`/category/${cat.slug}`}
                className={`group relative overflow-hidden rounded-2xl bg-brand-beige card-hover block ${
                  i === 0 ? "h-64 sm:h-80 lg:h-full min-h-[22rem]" : "h-56 sm:h-64"
                }`}
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="img-smooth absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/85 via-brand-dark/25 to-transparent transition-opacity duration-300 group-hover:opacity-90" />
                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 text-white">
                  <p className="text-[10px] tracking-[0.2em] uppercase text-brand-saffron font-bold mb-1">
                    {cat.originHighlight.split(",")[0]}
                  </p>
                  <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">{cat.name}</h3>
                  <p className="text-xs text-white/70 mt-1 line-clamp-1 font-light">{cat.tagline}</p>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* Bestsellers */}
      <section className="bg-white border-y border-brand-border py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
              <div>
                <p className="eyebrow text-brand-saffron mb-2">Connoisseur Selection</p>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-dark tracking-tight">House Favorites</h2>
              </div>
              <Link
                href="/products?filter=bestseller"
                className="text-xs font-bold uppercase tracking-wider text-brand-dark hover:text-brand-saffron inline-flex items-center gap-2 group transition-colors"
              >
                View full harvest
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
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
          <div className="relative min-h-[28rem] rounded-3xl overflow-hidden card-hover">
            <img src={EDITORIAL_IMAGE} alt="Almonds in a ceramic bowl" className="img-smooth absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-brand-dark/90 via-brand-dark/60 to-transparent" />
            <div className="relative z-10 max-w-lg p-8 sm:p-14 text-white">
              <p className="eyebrow text-brand-saffron mb-3">Nitrogen-Sealed Freshness</p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
                Crunch that lasts past the first handful.
              </h2>
              <p className="mt-5 text-sm sm:text-base text-white/80 leading-relaxed font-light">
                Delicate oils in almonds and walnuts oxidize quickly in standard pouches. We seal every container
                under nitrogen inert atmosphere so the harvest stays sweet, fragrant, and snapping-crisp.
              </p>
              <Link href="/products" className="btn-primary mt-8 bg-white text-brand-dark hover:bg-brand-cream border-white font-bold">
                Shop Collection
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
            <p className="eyebrow text-brand-saffron mb-2">The Standard</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-brand-dark">Why it tastes different</h2>
          </div>
        </Reveal>
        <Stagger className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Leaf, title: "Never Oil-Roasted", body: "Raw or slow air-cured lots only. Zero hydrogenated oils or syrups." },
            { icon: Award, title: "Top 1% Grade Selection", body: "Jumbo King W-180 cashews and extra-light Kashmiri walnut halves." },
            { icon: ShieldCheck, title: "Triple Inspected", body: "Hand-graded for pristine kernel integrity, moisture, and aroma." },
            { icon: Truck, title: "Express Direct", body: "Direct from farm to doorstep. Free express delivery over ₹999." },
          ].map(({ icon: Icon, title, body }) => (
            <StaggerItem key={title}>
              <div className="h-full rounded-2xl border border-brand-border bg-white p-6 card-hover">
                <div className="w-10 h-10 rounded-xl bg-brand-green/5 text-brand-green flex items-center justify-center mb-4 border border-brand-border/60">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-brand-dark tracking-tight mb-2">{title}</h3>
                <p className="text-xs sm:text-sm text-brand-muted leading-relaxed font-normal">{body}</p>
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
              <p className="eyebrow text-brand-saffron mb-2">Composed For The Table</p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-brand-dark">Combos & Gift Caskets</h2>
            </div>
            <Link href="/category/combos" className="text-xs font-bold uppercase tracking-wider text-brand-dark hover:text-brand-saffron inline-flex items-center gap-2 group transition-colors">
              Explore All
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
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
      <section className="bg-brand-dark text-white py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-14 items-center">
          <Reveal className="lg:col-span-6 space-y-6">
            <p className="eyebrow text-brand-saffron">Sourcing Philosophy</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
              Pure botanical character,
              <br />
              <span className="text-brand-saffron font-serif font-normal italic">uncorrupted.</span>
            </h2>
            <p className="text-white/70 leading-relaxed font-light text-base sm:text-lg">
              Conventional commercial snack nuts are heavily salted, oiled, and roasted at high heat to mask lower grade kernels.
              NutriNation preserves pristine origin terroir: cold-harvested Kashmiri Mamra, sun-ripened Kandahar figs, and hand-cracked King walnuts.
            </p>
            <div className="space-y-4 pt-2">
              <div className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-brand-saffron shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm text-white">Direct Single-Estate Provenance</p>
                  <p className="text-sm text-white/60">Kashmir valleys, Mangalore orchards, Jordan Rift Valley.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-brand-saffron shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm text-white">Hermetically Nitrogen-Sealed</p>
                  <p className="text-sm text-white/60">Zero humidity intrusion. Snap and aroma stay true to harvest day.</p>
                </div>
              </div>
            </div>
            <Link href="/contact" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-saffron hover:text-white transition-colors pt-2">
              Read Our Sourcing Charter
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Reveal>
          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            <div className="aspect-[3/4] rounded-2xl overflow-hidden card-hover">
              <img src={STORY_LEFT} alt="Cashews" className="img-smooth h-full w-full object-cover" />
            </div>
            <div className="aspect-[3/4] rounded-2xl overflow-hidden mt-8 card-hover">
              <img src={STORY_RIGHT} alt="Dried figs" className="img-smooth h-full w-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <Reveal>
          <div className="text-center mb-12">
            <p className="eyebrow text-brand-saffron mb-2">Verified Harvest Reviews</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-brand-dark">What Connoisseurs Say</h2>
          </div>
        </Reveal>
        <Stagger className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {REVIEWS.slice(0, 3).map((review) => (
            <StaggerItem key={review.id}>
              <blockquote className="h-full rounded-2xl border border-brand-border bg-white p-7 card-hover flex flex-col justify-between">
                <div>
                  <div className="flex gap-1 text-brand-saffron mb-4">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-brand-saffron" />
                    ))}
                  </div>
                  <p className="text-lg font-bold text-brand-dark tracking-tight leading-snug mb-3">
                    “{review.title}”
                  </p>
                  <p className="text-sm text-brand-muted leading-relaxed">{review.comment}</p>
                </div>
                <footer className="pt-6 mt-6 border-t border-brand-border flex items-center justify-between text-sm">
                  <div>
                    <p className="font-bold text-brand-dark">{review.customerName}</p>
                    <p className="text-xs text-brand-muted">{review.location}</p>
                  </div>
                  <span className="text-[10px] font-bold tracking-wider uppercase text-brand-green bg-brand-green/5 px-2 py-0.5 rounded-full border border-brand-border">Verified Buyer</span>
                </footer>
              </blockquote>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* Final CTA */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-7xl mx-auto rounded-3xl bg-brand-dark text-white px-8 py-16 sm:py-24 text-center relative overflow-hidden card-hover border border-white/10">
          <Sparkles className="absolute top-8 right-10 w-8 h-8 text-brand-saffron/30" />
          <p className="eyebrow text-brand-saffron mb-3">Everyday Botanical Wellness</p>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">Nourish naturally.</h2>
          <p className="mt-4 max-w-lg mx-auto text-white/75 font-light text-base sm:text-lg leading-relaxed">
            Real dry fruits harvested at peak ripeness, cold-packed to retain authentic tree aroma and essential nutrients.
          </p>
          <Link
            href="/products"
            className="btn-primary mt-8 bg-brand-saffron text-brand-dark hover:bg-brand-saffron-light border-brand-saffron font-bold text-sm px-8 py-4 shadow-lg hover:shadow-xl"
          >
            Shop The Harvest
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
