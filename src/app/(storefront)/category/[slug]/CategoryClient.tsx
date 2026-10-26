"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { categoryService } from "@/services/categories";
import { productService } from "@/services/products";
import { Category, Product, CategorySlug } from "@/types";
import ProductCard from "@/components/products/ProductCard";
import { ChevronRight } from "lucide-react";

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
        <h1 className="font-serif font-bold text-3xl text-brand-dark mb-4">Category Not Found</h1>
        <p className="text-sm text-brand-muted mb-6">The dry fruit category you requested could not be located.</p>
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
        <section className="relative bg-brand-dark text-white py-20 sm:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden min-h-[22rem] flex items-end">
          <div className="absolute inset-0 z-0">
            <img
              src={category.bannerImage || category.image}
              alt={category.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-brand-dark/60" />
          </div>

          <div className="max-w-7xl mx-auto relative z-10">
            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-xs text-white/60 mb-4">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <ChevronRight className="w-3 h-3" />
              <Link href="/products" className="hover:text-white transition-colors">Categories</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-brand-saffron font-semibold">{category.name}</span>
            </div>

            <div className="max-w-3xl space-y-4">
              <span className="eyebrow text-brand-saffron">NutriNation collection</span>

              <h1 className="font-serif font-medium text-4xl sm:text-6xl text-white tracking-tight">
                {category.name}
              </h1>

              <p className="text-base sm:text-lg text-white/80 font-sans leading-relaxed">
                Explore available {category.name.toLowerCase()}, compare pack sizes, and choose what suits your table.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Products Grid & Sorting Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between pb-6 border-b border-brand-border mb-8">
          <div>
            <span className="text-xs text-brand-muted">
              Showing <strong>{products.length}</strong> varieties of {category?.name}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-brand-muted hidden sm:inline">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white border border-brand-border rounded-xl px-3 py-1.5 text-xs font-semibold text-brand-dark focus:outline-none focus:border-brand-green cursor-pointer"
            >
              <option value="popularity">Most Popular</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-80 bg-brand-beige animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="border-l-2 border-brand-saffron py-4 pl-5">
            <h3 className="text-xl text-brand-dark">No products in this category yet.</h3>
            <p className="mt-2 text-sm text-brand-muted">
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
