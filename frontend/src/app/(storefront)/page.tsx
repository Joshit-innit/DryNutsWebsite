"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { CATEGORIES, PRODUCTS } from "@/data/mockData";
import ProductCard from "@/components/products/ProductCard";
import HarvestHero from "@/components/home/HarvestHero";
import { productService } from "@/services/products";
import { getCategoryImages, getProductImage } from "@/lib/product-images";
import { formatPrice } from "@/lib/utils";
import { Product } from "@/types";

/** Bestsellers first, then featured picks, then the rest of the catalogue. */
function topProducts(products: Product[]) {
  const rank = (p: Product) => (p.isBestSeller ? 2 : 0) + (p.isFeatured ? 1 : 0);
  return [...products].sort((a, b) => rank(b) - rank(a) || b.reviewCount - a.reviewCount).slice(0, 10);
}

function shortName(name: string) {
  return name.replace(/\s*\(.*?\)\s*/g, " ").replace(/\s+/g, " ").trim();
}

function lowestPrice(product: Product) {
  return Math.min(...product.variants.map((v) => v.price));
}

function SectionHeading({
  label,
  title,
  action,
}: {
  label: string;
  title: React.ReactNode;
  action?: { href: string; text: string };
}) {
  return (
    <div className="mb-10 flex flex-col gap-6 sm:mb-14 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="section-label mb-4">{label}</p>
        <h2 className="section-title max-w-2xl">{title}</h2>
      </div>
      {action && (
        <Link href={action.href} className="group inline-flex items-center gap-2 text-[15px] font-medium text-brand-dark">
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          <span className="link-rule">{action.text}</span>
        </Link>
      )}
    </div>
  );
}

export default function HomePage() {
  const [products, setProducts] = React.useState<Product[]>(PRODUCTS);

  React.useEffect(() => {
    productService.getAllProducts().then((live) => {
      // The local catalogue stays in place if the API is unreachable or empty.
      if (live.length > 0) setProducts(live);
    });
  }, []);

  const ranked = topProducts(products);
  const featured = ranked[0];
  const shelf = ranked.slice(0, 4);
  const directory = ranked.slice(0, 8);
  const coreCategories = CATEGORIES.filter((c) => c.slug !== "combos" && c.slug !== "gift-boxes");
  const countIn = (slug: string) => products.filter((p) => p.category === slug).length;
  const today = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date());

  return (
    <div className="overflow-hidden">
      <HarvestHero products={ranked} />

      {/* ------------------------------------------------ Harvest of the Day */}
      {featured && (
        <section className="mx-auto max-w-[1440px] px-2 pb-24 pt-24 sm:px-3 sm:pt-32">
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-[15px] text-brand-dark">
            <span>Harvest of the Day</span>
            <span className="rounded-md border border-brand-border-dark px-2 py-0.5 text-sm">{today}</span>
            <span>
              Rated <span className="font-semibold">{featured.rating.toFixed(1)}</span>
              <span className="text-brand-muted"> of 5</span>
            </span>
          </div>
          <h2 className="mx-auto mt-6 max-w-[14ch] px-4 text-center text-[clamp(3rem,8.4vw,8.5rem)] font-bold uppercase leading-[0.9] tracking-[-0.055em]">
            {shortName(featured.name).split(" ").slice(0, 3).join(" ")}
          </h2>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 px-4 text-[17px] font-medium sm:text-xl">
            <span className="inline-flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-dark text-xs font-bold text-white">
                {featured.categoryName.charAt(0)}
              </span>
              <Link href={`/category/${featured.category}`} className="link-rule">
                {featured.categoryName}
              </Link>
            </span>
            <span className="inline-flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-green text-xs font-bold text-white">
                {featured.origin.charAt(0)}
              </span>
              <span className="link-rule">{featured.origin.split(",")[0]}</span>
            </span>
          </div>

          <Link
            href={`/products/${featured.slug}`}
            className="group relative mt-14 block overflow-hidden rounded-2xl bg-brand-beige"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getProductImage(featured).replace(/([?&])w=\d+/, "$1w=2000")}
              alt={featured.name}
              className="aspect-[16/9] w-full object-cover transition-transform duration-[1200ms] ease-luxury group-hover:scale-[1.03] sm:aspect-[21/9]"
              loading="lazy"
            />
            <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-4 bg-gradient-to-t from-black/55 to-transparent p-5 pt-24 text-white sm:p-8">
              <p className="max-w-md text-[15px] leading-relaxed text-white/85">{featured.shortDescription}</p>
              <span className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-brand-dark">
                From {formatPrice(lowestPrice(featured))} <ArrowUpRight className="h-4 w-4" />
              </span>
            </div>
          </Link>
        </section>
      )}

      {/* ------------------------------------------------ Category gallery */}
      <section className="border-t border-brand-border bg-[#F9F8F5]">
        <div className="mx-auto max-w-[1440px] px-4 py-24 sm:px-6 sm:py-32 lg:px-12">
          <SectionHeading
            label="Harvests"
            title={
              <>
                Nine pantry essentials,
                <br />
                chosen with care.
              </>
            }
            action={{ href: "/products", text: "See every category" }}
          />

          <div className="grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {coreCategories.map((category) => (
              <Link key={category.id} href={`/category/${category.slug}`} className="group block">
                <div className="overflow-hidden rounded-2xl bg-brand-beige">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getCategoryImages(category.slug)[0].replace(/([?&])w=\d+/, "$1w=900")}
                    alt={category.name}
                    className="aspect-[4/3] w-full object-cover transition-transform duration-700 ease-luxury group-hover:scale-[1.04]"
                    loading="lazy"
                  />
                </div>
                <div className="mt-4 flex items-baseline justify-between gap-4">
                  <p className="flex min-w-0 items-baseline gap-2">
                    <span className="text-lg font-semibold tracking-[-0.03em]">{category.name}</span>
                    <span className="text-xs text-brand-muted">from</span>
                    <span className="link-rule truncate text-[15px] font-medium">{category.originHighlight.split(",")[0]}</span>
                  </p>
                  <span className="shrink-0 text-[13px] text-brand-muted">
                    {countIn(category.slug) > 0 ? `${String(countIn(category.slug)).padStart(2, "0")} items` : "Explore"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ From the shelf */}
      <section className="mx-auto max-w-[1440px] px-4 py-24 sm:px-6 sm:py-32 lg:px-12">
        <SectionHeading
          label="From the shelf"
          title={
            <>
              Start with the
              <br />
              <span className="font-accent text-brand-green">essentials.</span>
            </>
          }
          action={{ href: "/products", text: "Shop all products" }}
        />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {shelf.map((product, index) => (
            <ProductCard key={product.id} product={product} priority={index < 2} />
          ))}
        </div>
      </section>

      {/* ------------------------------------------------ Gifting (dark cards) */}
      <section className="mx-auto max-w-[1440px] px-4 pb-24 sm:px-6 sm:pb-32 lg:px-12">
        <p className="mb-10 text-center text-[17px] text-brand-dark">For celebrations, visits and everyday generosity.</p>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {[
            { slug: "gift-boxes", label: "Gifting", title: "Gift & Festival Boxes", note: "Wrapped and ready to give" },
            { slug: "combos", label: "Everyday", title: "Curated Combos", note: "Daily wellness blends" },
          ].map((card) => (
            <Link
              key={card.slug}
              href={`/category/${card.slug}`}
              className="group relative flex min-h-[26rem] flex-col justify-between overflow-hidden rounded-2xl bg-brand-dark p-7 text-white sm:p-10"
            >
              <div className="flex items-start justify-between gap-6">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-white text-lg font-bold tracking-[-0.06em] text-brand-dark">
                  <span>
                    N<span className="text-brand-green">.</span>
                  </span>
                </span>
                <div className="w-[52%] overflow-hidden rounded-xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getCategoryImages(card.slug)[0].replace(/([?&])w=\d+/, "$1w=900")}
                    alt=""
                    className="aspect-[4/3] w-full object-cover transition-transform duration-700 ease-luxury group-hover:scale-[1.05]"
                    loading="lazy"
                  />
                </div>
              </div>
              <div>
                <p className="text-[15px] text-white/60">{card.label}</p>
                <div className="mt-2 flex items-end justify-between gap-6">
                  <h3 className="text-[clamp(2rem,3.6vw,3.25rem)] font-semibold leading-[0.98] tracking-[-0.045em] text-white">
                    {card.title}
                  </h3>
                  {countIn(card.slug) > 0 && (
                    <span className="shrink-0 rounded-xl border border-white/25 px-3.5 py-2 text-center">
                      <span className="block text-xs text-white/60">Packs</span>
                      <span className="block text-2xl font-semibold leading-none tracking-[-0.03em]">
                        {String(countIn(card.slug)).padStart(2, "0")}
                      </span>
                    </span>
                  )}
                </div>
                <div className="mt-8 flex items-center justify-between text-[15px] text-white/70">
                  <span>{card.note}</span>
                  <span className="inline-flex items-center gap-1.5 text-white">
                    Explore <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------ Pantry directory */}
      <section className="border-t border-brand-border bg-[#F9F8F5]">
        <div className="mx-auto max-w-[1440px] px-4 py-24 sm:px-6 sm:py-32 lg:px-12">
          <SectionHeading
            label="The pantry list"
            title={
              <>
                Every bestseller,
                <br />
                at a glance.
              </>
            }
            action={{ href: "/products", text: "Open the full catalogue" }}
          />

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead>
                <tr className="text-[14px] text-brand-dark">
                  <th className="pb-4 pl-2 font-medium">Name</th>
                  <th className="pb-4 font-medium">Origin</th>
                  <th className="pb-4 font-medium">Grade</th>
                  <th className="pb-4 font-medium">Rating</th>
                  <th className="pb-4 font-medium">From</th>
                  <th className="pb-4" aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {directory.map((product) => (
                  <tr key={product.id} className="rule-dotted group">
                    <td className="py-4 pl-2">
                      <Link href={`/products/${product.slug}`} className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={getProductImage(product).replace(/([?&])w=\d+/, "$1w=120")}
                          alt=""
                          className="h-11 w-11 rounded-full object-cover"
                          loading="lazy"
                        />
                        <span className="link-rule text-[16px] font-semibold tracking-[-0.02em]">{shortName(product.name)}</span>
                      </Link>
                    </td>
                    <td className="py-4 text-[15px] text-brand-muted">{product.origin.split(",")[0]}</td>
                    <td className="py-4 text-[15px] text-brand-muted">{product.grade || "Premium"}</td>
                    <td className="py-4 text-[15px]">
                      <span className="font-semibold">{product.rating.toFixed(1)}</span>
                      <span className="text-brand-muted">/5</span>
                    </td>
                    <td className="py-4 text-[15px] font-semibold">{formatPrice(lowestPrice(product))}</td>
                    <td className="py-4 pr-2 text-right">
                      <Link
                        href={`/products/${product.slug}`}
                        className="inline-flex h-10 items-center rounded-xl border border-brand-border-dark bg-white px-5 text-sm font-medium transition-colors hover:border-brand-dark hover:bg-brand-dark hover:text-white"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
