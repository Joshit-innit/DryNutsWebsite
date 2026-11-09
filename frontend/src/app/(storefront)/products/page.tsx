"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { productService, ProductFilterOptions } from "@/services/products";
import { CATEGORIES } from "@/data/mockData";
import { CategorySlug, Product } from "@/types";
import ProductCard from "@/components/products/ProductCard";
import { ProductGridSkeleton } from "@/components/ui/Skeleton";
import { formatPrice } from "@/lib/utils";

function ProductsContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<CategorySlug | "all">(
    (searchParams.get("category") as CategorySlug) || "all"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState(4000);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<ProductFilterOptions["sortBy"]>(
    searchParams.get("filter") === "bestseller" ? "popularity" : "newest"
  );

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      const result = await productService.getAllProducts({
        category: selectedCategory,
        search: searchQuery,
        maxPrice: priceRange,
        inStockOnly,
        sortBy,
      });
      setProducts(result);
      setLoading(false);
    }

    loadProducts();
  }, [selectedCategory, searchQuery, priceRange, inStockOnly, sortBy]);

  const resetFilters = () => {
    setSelectedCategory("all");
    setSearchQuery("");
    setPriceRange(4000);
    setInStockOnly(false);
    setSortBy("newest");
  };

  const hasFilters = selectedCategory !== "all" || searchQuery || priceRange < 4000 || inStockOnly;

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
      <header className="max-w-3xl">
        <p className="section-label mb-4">The complete collection</p>
        <h1 className="section-title">Dry fruits for the everyday table.</h1>
        <p className="mt-5 max-w-[60ch] text-base leading-relaxed text-brand-muted">
          Browse the core collection, combinations, and gift boxes. Select a product to see its available sizes and details.
        </p>
      </header>

      <section className="mt-10 border-y border-brand-border py-5" aria-label="Catalog filters">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-end">
          <label className="relative block">
            <span className="sr-only">Search products</span>
            <Search className="absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search the collection"
              className="w-full border-0 border-b border-brand-border bg-transparent py-3 pl-7 pr-8 text-sm text-brand-dark outline-none focus:border-brand-green"
            />
            {searchQuery && (
              <button type="button" onClick={() => setSearchQuery("")} aria-label="Clear search" className="absolute right-0 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-dark">
                <X className="h-4 w-4" />
              </button>
            )}
          </label>

          <label className="flex items-center gap-3 text-sm text-brand-muted">
            <span className="whitespace-nowrap">Category</span>
            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value as CategorySlug | "all")}
              className="min-w-40 border-b border-brand-border bg-transparent py-3 text-sm font-medium text-brand-dark outline-none focus:border-brand-green"
            >
              <option value="all">All categories</option>
              {CATEGORIES.map((category) => (
                <option key={category.id} value={category.slug}>{category.name}</option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-3 text-sm text-brand-muted">
            <span className="whitespace-nowrap">Sort</span>
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as ProductFilterOptions["sortBy"])}
              className="min-w-40 border-b border-brand-border bg-transparent py-3 text-sm font-medium text-brand-dark outline-none focus:border-brand-green"
            >
              <option value="newest">Latest additions</option>
              <option value="popularity">Featured</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
            </select>
          </label>
        </div>

        <div className="mt-5 flex flex-col gap-4 border-t border-brand-border pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-brand-dark">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(event) => setInStockOnly(event.target.checked)}
                className="h-4 w-4 rounded border-brand-border accent-brand-green"
              />
              Available now
            </label>
            <label className="flex items-center gap-3 text-sm text-brand-dark">
              <span className="min-w-[6.5rem] whitespace-nowrap tabular-nums">Up to {formatPrice(priceRange)}</span>
              <input
                type="range"
                min="200"
                max="4000"
                step="100"
                value={priceRange}
                onChange={(event) => setPriceRange(Number(event.target.value))}
                className="w-32 accent-brand-green sm:w-44"
              />
            </label>
          </div>
          {hasFilters && (
            <button type="button" onClick={resetFilters} className="self-start text-sm font-semibold text-brand-green hover:text-brand-green-dark sm:self-auto">
              Clear filters
            </button>
          )}
        </div>
      </section>

      <div className="mt-8 flex items-baseline justify-between">
        <p className="text-sm tabular-nums text-brand-muted" aria-live="polite">{loading ? "Loading products" : `${products.length} ${products.length === 1 ? "product" : "products"}`}</p>
      </div>

      {loading ? (
        <ProductGridSkeleton className="mt-8" />
      ) : products.length === 0 ? (
        <div className="my-20 max-w-xl">
          <h2 className="text-2xl font-semibold tracking-[-0.03em]">No products match those filters.</h2>
          <p className="mt-3 text-sm leading-relaxed text-brand-muted">Try a different category, a larger price range, or clear the current filters.</p>
          <button type="button" onClick={resetFilters} className="btn-primary mt-6">Reset collection</button>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-5 py-12"><ProductGridSkeleton /></div>}>
      <ProductsContent />
    </Suspense>
  );
}
