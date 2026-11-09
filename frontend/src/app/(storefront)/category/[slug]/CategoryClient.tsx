"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { categoryService } from "@/services/categories";
import { productService } from "@/services/products";
import { Category, Product, CategorySlug } from "@/types";
import ProductCard from "@/components/products/ProductCard";
import { ProductGridSkeleton } from "@/components/ui/Skeleton";

export default function CategoryPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"popularity" | "price-asc" | "price-desc" | "rating">("popularity");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const cat = await categoryService.getCategoryBySlug(slug);
      if (!cat) {
        setLoading(false);
        return;
      }
      setCategory(cat);

      const items = await productService.getAllProducts({
        category: slug as CategorySlug,
        sortBy,
      });
      setProducts(items);
      setLoading(false);
    }
    loadData();
  }, [slug, sortBy]);

  if (!loading && !category) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="mb-4 text-3xl font-semibold tracking-[-0.035em] text-brand-dark">Category not found</h1>
        <p className="mb-6 text-[15px] leading-relaxed text-brand-muted">The dry fruit category you requested could not be located.</p>
        <Link href="/products" className="btn-primary">
          Explore All Dry Fruits
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-16">
      {/* Category Hero Banner */}
      {category && (
        <section className="relative bg-brand-dark overflow-hidden min-h-[22rem]">
          <h1 className="sr-only">{category.name}</h1>
          <img
            src={category.bannerImage || category.image}
            alt={category.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </section>
      )}

      {/* Products Grid & Sorting Bar */}
      <section className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-12">
        <div className="mb-8 flex items-center justify-between gap-4 border-b border-brand-border pb-6">
          {/* The banner carries no text, so this line names the shelf in readable type. */}
          <p className="min-w-0 text-[15px] text-brand-muted" aria-live="polite">
            {loading ? (
              <span className="skeleton inline-block h-4 w-40 align-middle" aria-label="Loading products" />
            ) : (
              <>
                <span className="font-semibold text-brand-dark">{category?.name}</span>
                <span className="mx-2 text-brand-border-dark" aria-hidden>·</span>
                <span className="tabular-nums">{products.length}</span> {products.length === 1 ? "variety" : "varieties"}
              </>
            )}
          </p>

          <label className="flex shrink-0 items-center gap-3 text-[14px]">
            <span className="hidden text-brand-muted sm:inline">Sort by</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="h-10 cursor-pointer rounded-xl border border-brand-border bg-white px-3 text-[14px] font-medium text-brand-dark focus:border-brand-green focus:outline-none"
            >
              <option value="popularity">Most popular</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
            </select>
          </label>
        </div>

        {loading ? (
          <ProductGridSkeleton count={6} className="gap-6 lg:grid-cols-3" />
        ) : products.length === 0 ? (
          <div className="py-4">
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-brand-dark">No products in this category yet.</h2>
            <p className="mt-2 text-[15px] text-brand-muted">
              Browse the full collection to explore other dry fruits.
            </p>
            <Link href="/products" className="btn-primary mt-5">
              Browse collection
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
