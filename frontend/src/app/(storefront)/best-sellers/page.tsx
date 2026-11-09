"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Check, Heart, MapPin, Search, ShoppingBag, Sparkles, X } from "lucide-react";
import { productService } from "@/services/products";
import { useStore } from "@/context/StoreContext";
import { Product } from "@/types";
import { formatPrice } from "@/lib/utils";
import { getProductImageMeta } from "@/lib/product-images";
import { lowestPrice, shortName, sized } from "@/lib/landing";
import { LoadingRegion, ProductCardSkeleton, ProductGridSkeleton, Skeleton } from "@/components/ui/Skeleton";

type SortKey = "loved" | "price-asc" | "price-desc" | "savings";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "loved", label: "Most loved" },
  { key: "price-asc", label: "Price: low to high" },
  { key: "price-desc", label: "Price: high to low" },
  { key: "savings", label: "Biggest savings" },
];

/** Best savings across a product's sizes, as a whole percentage. */
function bestSaving(product: Product) {
  return Math.max(0, ...product.variants.map((v) => (v.mrp > v.price ? Math.round(((v.mrp - v.price) / v.mrp) * 100) : 0)));
}

function inStock(product: Product) {
  return product.variants.some((v) => v.stock > 0);
}

/* -------------------------------------------------------------------------- */
/* Shared buy controls: size chips, price, add to bag, wishlist                */
/* -------------------------------------------------------------------------- */

function useBuy(product: Product) {
  const { addToCart, toggleWishlist, isInWishlist } = useStore();
  const [index, setIndex] = useState(() => Math.max(0, product.variants.findIndex((v) => v.stock > 0)));
  const [added, setAdded] = useState(false);
  const variant = product.variants[index] ?? product.variants[0];

  const add = (event: React.MouseEvent) => {
    event.preventDefault();
    if (!variant || variant.stock <= 0) return;
    addToCart(product, variant, 1);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  };

  return {
    variant,
    index,
    setIndex,
    added,
    add,
    wishlisted: isInWishlist(product.id),
    toggleWish: (event: React.MouseEvent) => {
      event.preventDefault();
      toggleWishlist(product);
    },
  };
}

function SizeChips({ product, index, setIndex, dark = false }: { product: Product; index: number; setIndex: (i: number) => void; dark?: boolean }) {
  if (product.variants.length < 2) return null;
  return (
    <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label={`Size for ${product.name}`}>
      {product.variants.map((v, i) => {
        const active = i === index;
        const soldOut = v.stock <= 0;
        return (
          <button
            key={v.id}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={soldOut}
            onClick={(event) => {
              event.preventDefault();
              setIndex(i);
            }}
            className={`rounded-lg border px-2.5 py-1 text-[12px] font-medium transition-colors disabled:cursor-not-allowed disabled:line-through disabled:opacity-40 ${
              active
                ? dark
                  ? "border-white bg-white text-brand-dark"
                  : "border-brand-dark bg-brand-dark text-white"
                : dark
                  ? "border-white/30 text-white hover:border-white"
                  : "border-brand-border-dark text-brand-dark hover:border-brand-dark"
            }`}
          >
            {v.weight}
          </button>
        );
      })}
    </div>
  );
}

function AddButton({ added, onClick, disabled, dark = false }: { added: boolean; onClick: (e: React.MouseEvent) => void; disabled: boolean; dark?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
        added
          ? "bg-brand-green text-white"
          : dark
            ? "bg-white text-brand-dark hover:bg-brand-cream"
            : "bg-brand-dark text-white hover:bg-black"
      }`}
    >
      {added ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
      {disabled ? "Sold out" : added ? "Added" : "Add to bag"}
    </button>
  );
}

function WishButton({ active, onClick, dark = false, name }: { active: boolean; onClick: (e: React.MouseEvent) => void; dark?: boolean; name: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={active ? `Remove ${name} from wishlist` : `Save ${name} to wishlist`}
      className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl border transition-colors ${
        dark ? "border-white/30 text-white hover:border-white" : "border-brand-border-dark bg-white text-brand-dark hover:border-brand-dark"
      }`}
    >
      <Heart className={`h-4 w-4 ${active ? "fill-red-500 text-red-500" : ""}`} />
    </button>
  );
}

function PriceLine({ price, mrp, dark = false }: { price: number; mrp: number; dark?: boolean }) {
  const off = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
  return (
    <p className="flex flex-wrap items-baseline gap-x-2">
      <span className="text-2xl font-semibold tabular-nums tracking-[-0.03em]">{formatPrice(price)}</span>
      {off > 0 && (
        <>
          <span className={`text-sm tabular-nums line-through ${dark ? "text-white/60" : "text-brand-muted"}`}><span className="sr-only">MRP </span>{formatPrice(mrp)}</span>
          <span className={`text-sm font-semibold ${dark ? "text-brand-saffron-light" : "text-brand-green"}`}>{off}% off</span>
        </>
      )}
    </p>
  );
}

/* -------------------------------------------------------------------------- */
/* #1 spotlight                                                                */
/* -------------------------------------------------------------------------- */

function Spotlight({ product, rank }: { product: Product; rank: number }) {
  const buy = useBuy(product);
  const image = getProductImageMeta(product);
  return (
    <article className="group relative grid overflow-hidden rounded-3xl bg-brand-dark text-white lg:grid-cols-[1.15fr_1fr]">
      <Link href={`/products/${product.slug}`} className="relative block min-h-[18rem] overflow-hidden sm:min-h-[26rem]" style={{ backgroundColor: image.background }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={sized(image.src, 1400)}
          alt={image.alt}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-luxury group-hover:scale-[1.04]"
          style={{ objectPosition: image.objectPosition }}
        />
        <span className="absolute left-5 top-5 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-brand-dark">
          <Sparkles className="h-3.5 w-3.5 text-brand-saffron" />
          {rank === 1 ? "No. 1 best seller" : `Top ${product.categoryName} pick · #${rank} overall`}
        </span>
      </Link>

      <div className="flex flex-col justify-between gap-8 p-6 sm:p-10">
        <div>
          <p className="flex items-center gap-2 text-sm text-white/60">
            <span>{product.categoryName}</span>
            <span aria-hidden>·</span>
            <MapPin className="h-3.5 w-3.5" /> {product.origin.split(",")[0]}
          </p>
          <h2 className="mt-3 text-[clamp(2rem,4vw,3.4rem)] font-semibold leading-[0.98] tracking-[-0.045em] text-white">
            <Link href={`/products/${product.slug}`} className="hover:underline hover:decoration-1 hover:underline-offset-4">
              {shortName(product.name)}
            </Link>
          </h2>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/70">{product.shortDescription}</p>
          {product.benefits.length > 0 && (
            <ul className="mt-6 space-y-2 text-sm text-white/80">
              {product.benefits.slice(0, 3).map((benefit) => (
                <li key={benefit} className="flex gap-2.5">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-saffron-light" /> {benefit}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-4">
          <SizeChips product={product} index={buy.index} setIndex={buy.setIndex} dark />
          {buy.variant && <PriceLine price={buy.variant.price} mrp={buy.variant.mrp} dark />}
          <div className="flex gap-2">
            <AddButton added={buy.added} onClick={buy.add} disabled={!buy.variant || buy.variant.stock <= 0} dark />
            <WishButton active={buy.wishlisted} onClick={buy.toggleWish} dark name={product.name} />
            <Link
              href={`/products/${product.slug}`}
              className="ml-auto hidden h-11 items-center gap-1.5 rounded-xl border border-white/30 px-4 text-sm font-medium text-white transition-colors hover:border-white sm:inline-flex"
            >
              Details <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/* Ranked card                                                                 */
/* -------------------------------------------------------------------------- */

function RankedCard({ product, rank }: { product: Product; rank: number }) {
  const buy = useBuy(product);
  const image = getProductImageMeta(product);
  const podium = rank <= 3;
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-brand-border/70 transition-shadow duration-300 hover:shadow-hover">
      <Link href={`/products/${product.slug}`} className="relative block aspect-[5/4] overflow-hidden" style={{ backgroundColor: image.background }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={sized(image.src, 800)}
          alt={image.alt}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 ease-luxury group-hover:scale-[1.05]"
          style={{ objectPosition: image.objectPosition }}
        />
        <span
          className={`absolute left-3 top-3 grid h-10 min-w-10 place-items-center rounded-xl px-2 text-base font-bold tracking-[-0.04em] ${
            podium ? "bg-brand-saffron text-white" : "bg-white/90 text-brand-dark backdrop-blur"
          }`}
          aria-label={`Rank ${rank}`}
        >
          #{rank}
        </span>
        {bestSaving(product) >= 10 && (
          <span className="absolute right-3 top-3 rounded-lg bg-brand-green px-2 py-1 text-[11px] font-semibold text-white">
            Save up to {bestSaving(product)}%
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <p className="flex items-center gap-1.5 text-[12px] text-brand-muted">
            {product.categoryName} <span aria-hidden>·</span> {product.origin.split(",")[0]}
          </p>
          <h3 className="mt-1 text-[17px] font-semibold leading-snug tracking-[-0.02em]">
            <Link href={`/products/${product.slug}`} className="link-rule">
              {shortName(product.name)}
            </Link>
          </h3>
          {product.grade && <p className="mt-0.5 text-[12px] text-brand-muted">{product.grade}</p>}
        </div>
        <SizeChips product={product} index={buy.index} setIndex={buy.setIndex} />
        <div className="mt-auto space-y-3">
          {buy.variant && <PriceLine price={buy.variant.price} mrp={buy.variant.mrp} />}
          <div className="flex gap-2">
            <div className="flex-1 [&>button]:w-full">
              <AddButton added={buy.added} onClick={buy.add} disabled={!buy.variant || buy.variant.stock <= 0} />
            </div>
            <WishButton active={buy.wishlisted} onClick={buy.toggleWish} name={product.name} />
          </div>
        </div>
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/* Page                                                                        */
/* -------------------------------------------------------------------------- */

function BestSellersContent() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [all, setAll] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [stickyTop, setStickyTop] = useState(0);

  // Sit the filter bar just under the site's sticky header, whatever its height.
  useEffect(() => {
    const header = document.querySelector<HTMLElement>("body header");
    if (!header) return;
    const update = () => setStickyTop(header.offsetHeight);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(header);
    return () => observer.disconnect();
  }, []);

  const category = params.get("category") || "all";
  const sort = (SORTS.some((s) => s.key === params.get("sort")) ? params.get("sort") : "loved") as SortKey;

  const setParam = (key: string, value: string, fallback: string) => {
    const next = new URLSearchParams(params.toString());
    if (value === fallback) next.delete(key);
    else next.set(key, value);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  useEffect(() => {
    productService.getAllProducts({ sortBy: "popularity" }).then((list) => {
      setAll(list.filter((p) => p.isBestSeller));
      setLoading(false);
    });
  }, []);

  // The API's popularity order is the "most loved" ranking; ranks never change with filters.
  const ranks = useMemo(() => new Map(all.map((p, i) => [p.id, i + 1])), [all]);

  const categories = useMemo(() => {
    const counts = new Map<string, { name: string; count: number }>();
    for (const p of all) {
      const entry = counts.get(p.category) ?? { name: p.categoryName, count: 0 };
      entry.count += 1;
      counts.set(p.category, entry);
    }
    return [...counts.entries()].map(([slug, v]) => ({ slug, ...v }));
  }, [all]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = all.filter(
      (p) =>
        (category === "all" || p.category === category) &&
        (!q || `${p.name} ${p.categoryName} ${p.origin} ${p.tags.join(" ")}`.toLowerCase().includes(q))
    );
    if (sort === "price-asc") return [...list].sort((a, b) => lowestPrice(a) - lowestPrice(b));
    if (sort === "price-desc") return [...list].sort((a, b) => lowestPrice(b) - lowestPrice(a));
    if (sort === "savings") return [...list].sort((a, b) => bestSaving(b) - bestSaving(a));
    return list;
  }, [all, category, query, sort]);

  const showSpotlight = sort === "loved" && !query && visible.length > 0;
  const spotlight = showSpotlight ? visible[0] : null;
  const rest = showSpotlight ? visible.slice(1) : visible;
  const fromPrice = all.length ? Math.min(...all.map(lowestPrice)) : 0;
  const filtered = category !== "all" || query.trim().length > 0;

  return (
    <div className="pb-24">
      {/* Header */}
      <header className="mx-auto max-w-[1440px] px-4 pb-10 pt-12 sm:px-6 sm:pt-16 lg:px-12">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="section-label mb-4">Customer favourites</p>
            <h1 className="text-[clamp(2.75rem,7vw,6rem)] font-bold leading-[0.92] tracking-[-0.045em]">
              The ones people
              <br />
              <span className="font-accent font-normal text-brand-green">keep coming back for.</span>
            </h1>
          </div>
          {!loading && all.length > 0 && (
            <dl className="grid grid-cols-3 gap-px overflow-hidden rounded-2xl bg-brand-border text-center ring-1 ring-brand-border lg:min-w-[26rem]">
              {[
                ["Best sellers", String(all.length)],
                ["Harvests", String(categories.length)],
                ["From", formatPrice(fromPrice)],
              ].map(([label, value]) => (
                <div key={label} className="bg-white px-4 py-4">
                  <dt className="text-[12px] text-brand-muted">{label}</dt>
                  <dd className="mt-1 text-xl font-semibold tabular-nums tracking-[-0.03em]">{value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </header>

      {/* Sticky filter bar */}
      <div className="sticky z-30 border-y border-brand-border bg-brand-cream/90 backdrop-blur-md" style={{ top: stickyTop }}>
        <div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:px-12">
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-0.5 [scrollbar-width:none] sm:mx-0 sm:px-0 lg:flex-1" role="tablist" aria-label="Filter by harvest">
            {[{ slug: "all", name: "All", count: all.length }, ...categories].map((c) => {
              const active = category === c.slug;
              return (
                <button
                  key={c.slug}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setParam("category", c.slug, "all")}
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-[13px] font-medium transition-colors ${
                    active ? "border-brand-dark bg-brand-dark text-white" : "border-brand-border-dark bg-white text-brand-dark hover:border-brand-dark"
                  }`}
                >
                  {c.name}
                  <span className={`text-[11px] ${active ? "text-white/70" : "text-brand-muted"}`}>{c.count}</span>
                </button>
              );
            })}
          </div>
          <div className="flex gap-2">
            <label className="relative flex-1 lg:w-56 lg:flex-none">
              <span className="sr-only">Search best sellers</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search favourites"
                className="h-10 w-full rounded-xl border border-brand-border-dark bg-white pl-9 pr-8 text-sm outline-none focus:border-brand-dark"
              />
              {query && (
                <button type="button" onClick={() => setQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-dark" aria-label="Clear search">
                  <X className="h-4 w-4" />
                </button>
              )}
            </label>
            <label className="shrink-0">
              <span className="sr-only">Sort</span>
              <select
                value={sort}
                onChange={(event) => setParam("sort", event.target.value, "loved")}
                className="h-10 rounded-xl border border-brand-border-dark bg-white px-3 text-sm font-medium outline-none focus:border-brand-dark"
              >
                {SORTS.map((s) => (
                  <option key={s.key} value={s.key}>{s.label}</option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-4 pt-8 sm:px-6 lg:px-12">
        {loading ? (
          <LoadingRegion label="Loading best sellers" className="space-y-6">
            <Skeleton className="h-[26rem] rounded-3xl" />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }, (_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          </LoadingRegion>
        ) : visible.length === 0 ? (
          <div className="mx-auto my-16 max-w-md text-center">
            <h2 className="text-2xl font-semibold tracking-[-0.03em]">Nothing matches that yet.</h2>
            <p className="mt-2 text-sm text-brand-muted">Try another harvest or clear your search.</p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                router.replace(pathname, { scroll: false });
              }}
              className="btn-primary mt-6"
            >
              Show all best sellers
            </button>
          </div>
        ) : (
          <>
            <p className="mb-5 text-sm text-brand-muted" aria-live="polite">
              {filtered ? `${visible.length} of ${all.length} best sellers` : `All ${all.length} best sellers, most popular first`}
            </p>

            {spotlight && (
              <div className="mb-8">
                <Spotlight key={spotlight.id} product={spotlight} rank={ranks.get(spotlight.id) ?? 1} />
              </div>
            )}

            <motion.div layout className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <AnimatePresence mode="popLayout" initial={false}>
                {rest.map((product) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <RankedCard product={product} rank={ranks.get(product.id) ?? 0} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </>
        )}

        {/* Bottom CTA */}
        {!loading && (
          <section className="mt-20 flex flex-col items-start justify-between gap-6 rounded-3xl bg-brand-beige p-8 sm:flex-row sm:items-center sm:p-12">
            <div>
              <h2 className="text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">Looking for something else?</h2>
              <p className="mt-2 text-sm text-brand-muted">Browse the full collection, including new arrivals and gift boxes.</p>
            </div>
            <Link href="/products" className="group inline-flex h-12 items-center gap-2 rounded-xl bg-brand-dark px-6 text-sm font-medium text-white hover:bg-black">
              Shop all products <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </section>
        )}
      </div>
    </div>
  );
}

export default function BestSellersPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-12"><Skeleton className="h-[26rem] rounded-3xl" /><ProductGridSkeleton count={4} className="mt-6 gap-5" /></div>}>
      <BestSellersContent />
    </Suspense>
  );
}
