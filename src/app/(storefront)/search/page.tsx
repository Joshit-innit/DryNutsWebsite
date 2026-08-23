"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { productService } from "@/services/products";
import { Product } from "@/types";
import { CATEGORIES } from "@/data/mockData";
import ProductCard from "@/components/products/ProductCard";
import { Search, X, Sparkles, TrendingUp, History, ArrowRight } from "lucide-react";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([
    "Mamra Almonds",
    "W-180 Cashews",
    "Afghani Anjeer",
    "Medjool Dates",
  ]);

  const popularSearches = [
    "Kashmiri Walnuts",
    "Iranian Pistachios",
    "7-in-1 Wellness Box",
    "Royal Gift Hamper",
    "Turkish Dried Apricots",
    "Black Raisins",
  ];

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length > 0) {
        setLoading(true);
        const data = await productService.getAllProducts({ search: query });
        setResults(data);
        setLoading(false);
      } else {
        setResults([]);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelectSearch = (term: string) => {
    setQuery(term);
    if (!recentSearches.includes(term)) {
      setRecentSearches([term, ...recentSearches.slice(0, 4)]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 min-h-[70vh]">
      {/* Search Input Bar */}
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="text-center space-y-2">
          <span className="text-xs uppercase font-bold tracking-widest text-brand-green">
            INSTANT HARVEST DISCOVERY
          </span>
          <h1 className="font-serif font-black text-3xl sm:text-4xl text-brand-dark">
            SEARCH NUTRINATION
          </h1>
        </div>

        <div className="relative">
          <Search className="w-6 h-6 text-brand-green absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search cashews, mamra almonds, dates, festive boxes..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full pl-13 pr-12 py-4 bg-white border-2 border-brand-border rounded-2xl text-sm sm:text-base font-medium shadow-card focus:outline-none focus:border-brand-green transition-all"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-dark p-1"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Suggestions / Tags */}
        {!query && (
          <div className="space-y-4 pt-4">
            {/* Recent searches */}
            {recentSearches.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-brand-muted uppercase tracking-wider mb-2">
                  <History className="w-3.5 h-3.5" />
                  <span>Recent Searches:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectSearch(s)}
                      className="text-xs bg-white border border-brand-border px-3 py-1.5 rounded-xl hover:border-brand-green text-brand-dark transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Popular searches */}
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-brand-orange uppercase tracking-wider mb-2">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Trending Harvests:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {popularSearches.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectSearch(s)}
                    className="text-xs bg-brand-cream border border-brand-border px-3 py-1.5 rounded-xl hover:border-brand-green text-brand-dark transition-colors font-medium"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Quick Browse */}
            <div className="pt-4 border-t border-brand-border">
              <span className="text-xs font-bold text-brand-dark uppercase tracking-wider block mb-3">
                Browse 9 Core Harvests
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {CATEGORIES.slice(0, 10).map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/category/${cat.slug}`}
                    className="p-2.5 rounded-xl bg-white border border-brand-border text-center hover:border-brand-green transition-all group"
                  >
                    <span className="text-xs font-semibold text-brand-dark group-hover:text-brand-green block">
                      {cat.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Search Results Display */}
      {query && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-brand-border pb-4">
            <h2 className="text-sm font-bold text-brand-dark">
              Search Results for &ldquo;<span className="text-brand-green">{query}</span>&rdquo;
            </h2>
            <span className="text-xs text-brand-muted">{results.length} items found</span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-80 bg-white rounded-2xl animate-pulse border border-brand-border" />
              ))}
            </div>
          ) : results.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-brand-border max-w-md mx-auto">
              <p className="font-serif font-bold text-lg text-brand-dark mb-1">
                No matching harvests found
              </p>
              <p className="text-xs text-brand-muted mb-6">
                Try searching for cashews, mamra, walnuts, dates, or wellness boxes.
              </p>
              <button
                onClick={() => setQuery("")}
                className="bg-brand-green text-white text-xs font-semibold px-5 py-2.5 rounded-xl"
              >
                Clear Search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {results.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
