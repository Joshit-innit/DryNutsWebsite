"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { categoryService } from "@/services/categories";
import { productService } from "@/services/products";
import { Category, Product, CategorySlug } from "@/types";
import ProductCard from "@/components/products/ProductCard";
import { ChevronRight, Sparkles, CheckCircle2, ShieldCheck, ArrowUpDown } from "lucide-react";

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
        <Link href="/products" className="bg-brand-green text-white px-6 py-3 rounded-xl font-semibold text-xs">
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
            <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/70 to-brand-dark/20" />
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
              <span className="eyebrow text-brand-saffron inline-flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" /> {category.originHighlight}
              </span>

              <h1 className="font-serif font-medium text-4xl sm:text-6xl text-white tracking-tight">
                {category.name}
              </h1>

              <p className="text-base sm:text-lg text-white/80 font-sans leading-relaxed">
                {category.description}
              </p>

              {/* Bullet Benefits */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 text-xs text-white/90">
                {category.benefits.map((b, i) => (
                  <div key={i} className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-xl backdrop-blur-xs">
                    <CheckCircle2 className="w-4 h-4 text-brand-green-light flex-shrink-0" />
                    <span className="line-clamp-1">{b}</span>
                  </div>
                ))}
              </div>
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
              <option value="rating">Top Rated</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-80 bg-white rounded-2xl animate-pulse border border-brand-border" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-brand-border">
            <h3 className="font-serif font-bold text-lg text-brand-dark">
              New harvest coming soon
            </h3>
            <p className="text-xs text-brand-muted mt-1 mb-4">
              We are currently packing the 2026 crop for this category.
            </p>
            <Link href="/products" className="bg-brand-green text-white px-5 py-2.5 rounded-xl text-xs font-semibold">
              Browse Other Harvests
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
