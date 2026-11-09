"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { CATEGORIES, PRODUCTS } from "@/data/mockData";
import { landingService } from "@/services/landing";
import { STORE_FAQS } from "@/data/faqs";
import ProductCard from "@/components/products/ProductCard";
import HeroGallery from "@/components/home/HeroGallery";
import FeaturedHarvest from "@/components/home/FeaturedHarvest";
import ProductMorph from "@/components/home/ProductMorph";
import FaqAccordion from "@/components/ui/FaqAccordion";
import { productService } from "@/services/products";
import { categoryPhoto, featuredPhoto, heroSlides, sized, topProducts } from "@/lib/landing";
import { LandingImage, Product } from "@/types";

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

const REEL_SIZE = 6;

// Secondary text tinted from each dark surface (sage on forest, linen on ink); both pass 7:1.
const GIFT_NOTE = "text-[#B9C8B3]";
const EVERYDAY_NOTE = "text-[#BDB7AC]";

const itemCount = (n: number) => `${String(n).padStart(2, "0")} ${n === 1 ? "item" : "items"}`;

export default function HomePage() {
  const [products, setProducts] = React.useState<Product[]>(PRODUCTS);
  // null until loaded, so the built-in photos never flash before the admin's ones.
  const [landing, setLanding] = React.useState<LandingImage[] | null>(null);

  React.useEffect(() => {
    productService.getAllProducts().then((live) => {
      // The local catalogue stays in place if the API is unreachable or empty.
      if (live.length > 0) setProducts(live);
    });
    landingService.getAll().then(setLanding);
  }, []);

  const ranked = React.useMemo(() => topProducts(products, 12), [products]);
  const slides = React.useMemo(() => (landing ? heroSlides(landing, ranked) : []), [landing, ranked]);
  const photos = landing ?? [];
  // The reel shows the top six, so the featured product and the shelf pick up after it
  // instead of repeating the same packs; a small catalogue falls back to the top.
  const featured = ranked[REEL_SIZE] ?? ranked[0];
  const shelfAfterReel = ranked.slice(REEL_SIZE + 1, REEL_SIZE + 5);
  const shelf = shelfAfterReel.length === 4 ? shelfAfterReel : ranked.slice(0, 4);
  const coreCategories = CATEGORIES.filter((c) => c.slug !== "combos" && c.slug !== "gift-boxes");
  const countIn = (slug: string) => products.filter((p) => p.category === slug).length;

  return (
    <div className="overflow-x-clip">
      <HeroGallery slides={slides} />

      {/* ------------------------------------------------ Harvest Reel (scroll morph) */}
      <ProductMorph products={ranked} />

      {/* ------------------------------------------------ Harvest of the Day */}
      {featured && <FeaturedHarvest product={featured} photo={landing ? sized(featuredPhoto(photos, featured), 2000) : undefined} />}

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
                    src={landing ? sized(categoryPhoto(photos, category.slug), 900) : undefined}
                    alt={category.name}
                    className="aspect-[4/3] w-full object-cover transition-transform duration-700 ease-luxury group-hover:scale-[1.04]"
                    loading="lazy"
                  />
                </div>
                <div className="mt-4 flex items-baseline justify-between gap-4">
                  <p className="flex min-w-0 items-baseline gap-2">
                    <span className="text-lg font-semibold tracking-[-0.03em] transition-colors duration-200 group-hover:text-brand-green-dark">{category.name}</span>
                    <span className="text-xs text-brand-muted">from</span>
                    <span className="link-rule truncate text-[15px] font-medium">{category.originHighlight.split(",")[0]}</span>
                  </p>
                  <span className="shrink-0 text-[13px] text-brand-muted">
                    {countIn(category.slug) > 0 ? itemCount(countIn(category.slug)) : "Explore"}
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

      {/* ------------------------------------------------ Gifting: the page's one Deep Forest band */}
      <section aria-labelledby="gifting-title" className="bg-brand-green-dark text-white">
        <div className="mx-auto max-w-[1440px] px-4 py-24 sm:px-6 sm:py-32 lg:px-12">
          <div className="mb-12 flex flex-col gap-6 sm:mb-16 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className={`mb-5 text-[15px] font-medium ${GIFT_NOTE}`}>Gifting</p>
              <h2
                id="gifting-title"
                className="max-w-[17ch] text-[clamp(2.5rem,5.6vw,5.25rem)] font-semibold leading-[0.98] tracking-[-0.045em] text-white"
              >
                For celebrations, visits and everyday{" "}
                <span className="font-accent tracking-[-0.02em] text-brand-saffron-light">generosity.</span>
              </h2>
            </div>
            <Link href="/category/gift-boxes" className="group inline-flex shrink-0 items-center gap-2 text-[15px] font-medium text-white">
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              <span className="link-rule">Shop gift boxes</span>
            </Link>
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-5">
            {/* Gift boxes: a tall photo panel, the hero's own motif */}
            <Link
              href="/category/gift-boxes"
              className="group relative flex min-h-[30rem] flex-col justify-end overflow-hidden rounded-[22px] bg-[#16261A] p-7 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-saffron-light sm:min-h-[38rem] sm:p-10"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={landing ? sized(categoryPhoto(photos, "gift-boxes"), 1600) : undefined}
                alt=""
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-luxury group-hover:scale-[1.04]"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0E1A11]/90 via-[#0E1A11]/30 to-transparent" aria-hidden />
              <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
                <div>
                  <h3 className="text-[clamp(2rem,3.8vw,3.5rem)] font-semibold leading-[0.98] tracking-[-0.045em] text-white">
                    Gift &amp; Festival Boxes
                  </h3>
                  <p className="mt-4 text-[15px] text-white/85">Wrapped and ready to give</p>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1.5 text-[15px] font-medium text-white">
                  {countIn("gift-boxes") > 0 && <span className="tabular-nums text-brand-saffron-light">{itemCount(countIn("gift-boxes"))}</span>}
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>

            {/* Everyday combos: the quieter Charcoal Ink companion */}
            <Link
              href="/category/combos"
              className="group flex flex-col justify-between gap-10 overflow-hidden rounded-[22px] bg-brand-dark p-7 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:p-10"
            >
              <div className="overflow-hidden rounded-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={landing ? sized(categoryPhoto(photos, "combos"), 900) : undefined}
                  alt=""
                  className="aspect-[4/3] w-full object-cover transition-transform duration-700 ease-luxury group-hover:scale-[1.04]"
                  loading="lazy"
                />
              </div>
              <div>
                <p className={`text-[15px] ${EVERYDAY_NOTE}`}>Everyday</p>
                <h3 className="mt-2 text-[clamp(1.75rem,2.6vw,2.5rem)] font-semibold leading-[1] tracking-[-0.04em] text-white">Curated Combos</h3>
                <div className={`mt-6 flex items-center justify-between text-[15px] ${EVERYDAY_NOTE}`}>
                  <span>Daily wellness blends</span>
                  <span className="inline-flex items-center gap-1.5 font-medium text-white">
                    {countIn("combos") > 0 && <span className="tabular-nums">{itemCount(countIn("combos"))}</span>}
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ FAQ (Watermelon faq-1) */}
      <section className="mx-auto max-w-[1440px] px-4 py-24 sm:px-6 sm:py-32 lg:px-12">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <div>
            <p className="section-label mb-4">Good to know</p>
            <h2 className="section-title max-w-md">
              Questions,
              <br />
              <span className="font-accent text-brand-green">answered.</span>
            </h2>
            <p className="mt-6 max-w-sm text-[15px] leading-relaxed text-brand-muted">
              Sourcing, freshness, gifting and delivery. Anything else, our team is a message away.
            </p>
            <Link href="/contact" className="group mt-8 inline-flex items-center gap-2 text-[15px] font-medium text-brand-dark">
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              <span className="link-rule">Contact concierge</span>
            </Link>
          </div>
          <FaqAccordion items={STORE_FAQS} defaultOpen={STORE_FAQS[0]?.id} />
        </div>
      </section>
    </div>
  );
}
