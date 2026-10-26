"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CATEGORIES, PRODUCTS } from "@/data/mockData";
import ProductCard from "@/components/products/ProductCard";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1606923829579-0cb981a83e2e?auto=format&fit=crop&w=2200&q=85";
const GIFT_IMAGE =
  "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1600&q=85";

const categoryLayout = [
  "col-span-2 row-span-2 min-h-[25rem] md:min-h-[34rem]",
  "min-h-[12rem] md:min-h-[16rem]",
  "min-h-[12rem] md:min-h-[16rem]",
  "min-h-[12rem] md:min-h-[16rem]",
  "min-h-[12rem] md:min-h-[16rem]",
  "col-span-2 min-h-[14rem] md:min-h-[18rem]",
  "min-h-[12rem] md:min-h-[16rem]",
  "min-h-[12rem] md:min-h-[16rem]",
  "min-h-[12rem] md:min-h-[16rem]",
];

export default function HomePage() {
  const [products, setProducts] = React.useState(PRODUCTS);

  React.useEffect(() => {
    async function loadProducts() {
      try {
        const response = await fetch("/api/v1/products", { cache: "no-store" });
        const result = await response.json();
        if (response.ok && Array.isArray(result.data) && result.data.length > 0) {
          setProducts(result.data);
        }
      } catch {
        // The local catalog remains available while an external API is unavailable.
      }
    }

    loadProducts();
  }, []);

  const coreCategories = CATEGORIES.filter(
    (category) => category.slug !== "combos" && category.slug !== "gift-boxes"
  );
  const selectedProducts = products.slice(0, 4);
  const collectionProducts = products
    .filter((product) => product.category === "combos" || product.category === "gift-boxes")
    .slice(0, 3);

  return (
    <div className="overflow-hidden">
      <section className="relative flex min-h-[min(760px,82vh)] items-end bg-brand-dark">
        <img
          src={HERO_IMAGE}
          alt="A selection of dry fruits arranged for serving"
          className="absolute inset-0 h-full w-full object-cover"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-brand-dark/60" />
        <div className="relative mx-auto w-full max-w-7xl px-5 pb-14 pt-32 sm:px-8 sm:pb-20 lg:px-10">
          <div className="max-w-2xl border-l-2 border-brand-saffron pl-5 sm:pl-7">
            <p className="eyebrow mb-5 text-brand-saffron">NutriNation</p>
            <h1 className="max-w-xl text-4xl leading-[1.08] text-white sm:text-6xl lg:text-7xl">
              Good food begins with thoughtful ingredients.
            </h1>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-white/80 sm:text-lg">
              A focused collection of Indian dry fruits, dried fruit, everyday combinations, and gift boxes.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/products" className="btn-primary bg-brand-saffron text-brand-dark hover:bg-brand-saffron-light border-brand-saffron">
                Explore the collection <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/category/gift-boxes" className="btn-ghost border-white/70 text-white hover:bg-white/10">
                View gift boxes
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:px-10">
        <div className="mb-10 flex flex-col gap-4 border-b border-brand-border pb-6 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow mb-3 text-brand-green">Shop by ingredient</p>
            <h2 className="max-w-xl text-3xl leading-tight sm:text-4xl">Nine pantry essentials, chosen with care.</h2>
          </div>
          <Link href="/products" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-dark hover:text-brand-green">
            See every category <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {coreCategories.map((category, index) => (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className={`group relative overflow-hidden bg-brand-beige ${categoryLayout[index]}`}
            >
              <img
                src={category.image}
                alt={category.name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                loading="lazy"
              />
              <div className="absolute inset-x-0 bottom-0 bg-brand-dark/70 p-4 text-white sm:p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-saffron">{String(index + 1).padStart(2, "0")}</p>
                <h3 className="mt-1 text-xl text-white sm:text-2xl">{category.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-brand-border bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="mb-10 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow mb-3 text-brand-green">From the shelf</p>
              <h2 className="text-3xl sm:text-4xl">Start with the essentials.</h2>
            </div>
            <Link href="/products" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-dark hover:text-brand-green">
              Shop all products <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {selectedProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} priority={index < 2} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl grid-cols-1 lg:grid-cols-2">
        <div className="min-h-[24rem] bg-brand-beige sm:min-h-[32rem]">
          <img
            src={GIFT_IMAGE}
            alt="NutriNation gift box presentation"
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="flex items-center bg-brand-beige px-5 py-16 sm:px-12 lg:px-16">
          <div className="max-w-md">
            <p className="eyebrow mb-4 text-brand-green">Gifting, made simple</p>
            <h2 className="text-3xl leading-tight sm:text-4xl">A considered gift for the people at your table.</h2>
            <p className="mt-5 text-base leading-relaxed text-brand-muted">
              Explore prepared combinations and gift boxes for celebrations, visits, and everyday generosity.
            </p>
            <Link href="/category/gift-boxes" className="btn-primary mt-8">
              Explore gift boxes <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {collectionProducts.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:px-10">
          <div className="mb-10 max-w-2xl">
            <p className="eyebrow mb-3 text-brand-green">Shareable selections</p>
            <h2 className="text-3xl sm:text-4xl">Combinations for more than one craving.</h2>
          </div>
          <div className="grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {collectionProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
