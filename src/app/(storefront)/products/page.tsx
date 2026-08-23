"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { productService, ProductFilterOptions } from "@/services/products";
import { CATEGORIES } from "@/data/mockData";
import { Product, CategorySlug } from "@/types";
import ProductCard from "@/components/products/ProductCard";
import {
  Filter,
  SlidersHorizontal,
  X,
  Star,
  Search,
  Check,
  ChevronDown,
  ArrowUpDown,
  RotateCcw,
} from "lucide-react";

function ProductsContent() {
  const searchParams = useSearchParams();
  const initialCategory = (searchParams.get("category") as CategorySlug) || "all";
  const initialFilter = searchParams.get("filter");

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState<CategorySlug | "all">(initialCategory);
  const [priceRange, setPriceRange] = useState<number>(4000);
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<ProductFilterOptions["sortBy"]>(
    initialFilter === "bestseller" ? "popularity" : "popularity"
  );
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await productService.getAllProducts({
        category: selectedCategory,
        maxPrice: priceRange,
        rating: selectedRating,
        inStockOnly,
        search: searchQuery,
        sortBy,
      });
      setProducts(data);
      setLoading(false);
    }
    load();
  }, [selectedCategory, priceRange, selectedRating, inStockOnly, searchQuery, sortBy]);

  const resetFilters = () => {
    setSelectedCategory("all");
    setPriceRange(4000);
    setSelectedRating(0);
    setInStockOnly(false);
    setSearchQuery("");
    setSortBy("popularity");
  };

  const hasActiveFilters =
    selectedCategory !== "all" ||
    priceRange < 4000 ||
    selectedRating > 0 ||
    inStockOnly ||
    searchQuery.trim() !== "";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Page Header */}
      <div className="mb-8 border-b border-brand-border pb-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-brand-green block mb-1">
              THE COMPLETE COLLECTION
            </span>
            <h1 className="font-serif font-black text-3xl sm:text-4xl text-brand-dark">
              ALL DRY FRUITS & COMBOS
            </h1>
            <p className="text-xs sm:text-sm text-brand-muted mt-1">
              Showing {products.length} hand-selected premium dry fruits and gift boxes.
            </p>
          </div>

          {/* Search & Sort Row */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-brand-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-brand-border rounded-xl focus:outline-none focus:border-brand-green"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-dark"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                aria-label="Sort products"
                className="appearance-none bg-white border border-brand-border rounded-xl px-4 py-2 pr-8 text-xs font-semibold text-brand-dark focus:outline-none focus:border-brand-green cursor-pointer shadow-xs"
              >
                <option value="popularity">Sort by: Popularity</option>
                <option value="rating">Highest Rated</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="discount">Biggest Discount</option>
                <option value="newest">New Arrivals</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-brand-muted absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Mobile Filter Trigger */}
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-1.5 bg-white border border-brand-border px-3.5 py-2 rounded-xl text-xs font-semibold text-brand-dark"
            >
              <SlidersHorizontal className="w-4 h-4 text-brand-green" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-brand-orange" />
              )}
            </button>
          </div>
        </div>

        {/* Active Filter Chips */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-4">
            <span className="text-xs text-brand-muted font-medium">Active filters:</span>
            {selectedCategory !== "all" && (
              <span className="inline-flex items-center gap-1 bg-brand-green/10 text-brand-green text-xs px-2.5 py-1 rounded-full font-semibold">
                Category: {selectedCategory}
                <button onClick={() => setSelectedCategory("all")}><X className="w-3 h-3" /></button>
              </span>
            )}
            {selectedRating > 0 && (
              <span className="inline-flex items-center gap-1 bg-brand-saffron/10 text-brand-dark text-xs px-2.5 py-1 rounded-full font-semibold">
                {selectedRating}+ Stars
                <button onClick={() => setSelectedRating(0)}><X className="w-3 h-3" /></button>
              </span>
            )}
            {inStockOnly && (
              <span className="inline-flex items-center gap-1 bg-brand-green/10 text-brand-green text-xs px-2.5 py-1 rounded-full font-semibold">
                In Stock Only
                <button onClick={() => setInStockOnly(false)}><X className="w-3 h-3" /></button>
              </span>
            )}
            <button
              onClick={resetFilters}
              className="text-xs text-brand-orange hover:underline font-bold ml-2 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Reset All
            </button>
          </div>
        )}
      </div>

      {/* Main Layout (Desktop Sticky Sidebar + Product Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Filter Sidebar */}
        <aside className="hidden lg:block lg:col-span-1 space-y-6 bg-white p-6 rounded-3xl border border-brand-border shadow-xs h-fit sticky top-28">
          <div className="flex items-center justify-between pb-4 border-b border-brand-border">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-brand-green" />
              <h3 className="font-serif font-bold text-base text-brand-dark">Filters</h3>
            </div>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-xs text-brand-muted hover:text-brand-orange transition-colors font-medium"
              >
                Clear all
              </button>
            )}
          </div>

          {/* 1. Category Filter */}
          <div>
            <h4 className="text-xs uppercase font-bold tracking-wider text-brand-dark mb-3">
              Categories
            </h4>
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                  selectedCategory === "all"
                    ? "bg-brand-green text-white font-bold shadow-xs"
                    : "text-brand-dark hover:bg-brand-cream"
                }`}
              >
                <span>All Harvests</span>
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                    selectedCategory === cat.slug
                      ? "bg-brand-green text-white font-bold shadow-xs"
                      : "text-brand-dark hover:bg-brand-cream"
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className="text-[10px] opacity-70">({cat.itemCount})</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Price Range Slider */}
          <div className="pt-4 border-t border-brand-border">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-xs uppercase font-bold tracking-wider text-brand-dark">
                Max Price
              </h4>
              <span className="text-xs font-bold text-brand-green">
                Up to ₹{priceRange}
              </span>
            </div>
            <input
              type="range"
              min="200"
              max="4000"
              step="100"
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              aria-label="Price range filter"
              className="w-full accent-brand-green cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-brand-muted mt-1">
              <span>₹200</span>
              <span>₹4,000</span>
            </div>
          </div>

          {/* 3. Minimum Customer Rating */}
          <div className="pt-4 border-t border-brand-border">
            <h4 className="text-xs uppercase font-bold tracking-wider text-brand-dark mb-2">
              Rating
            </h4>
            <div className="space-y-1">
              {[4, 3, 0].map((star) => (
                <button
                  key={star}
                  onClick={() => setSelectedRating(star)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-2 ${
                    selectedRating === star
                      ? "bg-brand-saffron/20 font-bold text-brand-dark"
                      : "text-brand-muted hover:bg-brand-cream"
                  }`}
                >
                  <div className="flex items-center text-brand-saffron">
                    {star > 0 ? (
                      [...Array(star)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-brand-saffron" />
                      ))
                    ) : (
                      <span className="text-xs font-normal">All Ratings</span>
                    )}
                  </div>
                  {star > 0 && <span className="text-brand-dark font-medium">& above</span>}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Availability Checkbox */}
          <div className="pt-4 border-t border-brand-border">
            <label className="flex items-center gap-2 text-xs font-medium text-brand-dark cursor-pointer">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="w-4 h-4 rounded text-brand-green accent-brand-green cursor-pointer"
              />
              <span>In Stock Harvests Only</span>
            </label>
          </div>
        </aside>

        {/* Product Grid Area */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-brand-border p-4 h-96 animate-pulse space-y-4"
                >
                  <div className="bg-brand-beige h-48 rounded-xl w-full" />
                  <div className="h-4 bg-brand-beige rounded w-3/4" />
                  <div className="h-3 bg-brand-beige rounded w-1/2" />
                  <div className="h-8 bg-brand-beige rounded w-full mt-8" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-brand-border max-w-md mx-auto my-12">
              <div className="w-16 h-16 rounded-full bg-brand-cream flex items-center justify-center text-brand-muted mx-auto mb-4">
                <Search className="w-8 h-8 text-brand-green/60" />
              </div>
              <h3 className="font-serif font-bold text-lg text-brand-dark mb-1">
                No matching harvests found
              </h3>
              <p className="text-xs text-brand-muted mb-6">
                Try adjusting your category filter, price range, or search keywords.
              </p>
              <button
                onClick={resetFilters}
                className="bg-brand-green hover:bg-brand-green-dark text-white text-xs font-semibold px-6 py-2.5 rounded-xl transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Bottom Sheet */}
      {isMobileFilterOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex flex-col justify-end">
          <div className="bg-white rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto space-y-6 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-brand-border">
              <h3 className="font-serif font-bold text-lg text-brand-dark">Filter Products</h3>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-1 rounded-full text-brand-dark hover:bg-brand-cream"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Mobile Category Select */}
            <div>
              <h4 className="text-xs uppercase font-bold text-brand-dark mb-2">Category</h4>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`p-2 rounded-xl text-xs font-semibold border ${
                    selectedCategory === "all" ? "bg-brand-green text-white border-brand-green" : "border-brand-border"
                  }`}
                >
                  All Categories
                </button>
                {CATEGORIES.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(c.slug)}
                    className={`p-2 rounded-xl text-xs font-semibold border text-left line-clamp-1 ${
                      selectedCategory === c.slug ? "bg-brand-green text-white border-brand-green" : "border-brand-border"
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Actions */}
            <div className="flex gap-3 pt-4 border-t border-brand-border">
              <button
                onClick={resetFilters}
                className="flex-1 py-3 border border-brand-border text-xs font-bold text-brand-dark rounded-xl"
              >
                Reset
              </button>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 py-3 bg-brand-green text-white text-xs font-bold rounded-xl"
              >
                Apply ({products.length} Items)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-16 text-center text-xs text-brand-muted">Loading harvest catalog...</div>}>
      <ProductsContent />
    </Suspense>
  );
}

