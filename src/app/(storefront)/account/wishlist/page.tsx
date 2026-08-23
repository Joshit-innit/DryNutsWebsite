"use client";

import React from "react";
import Link from "next/link";
import { useStore } from "@/context/StoreContext";
import { PRODUCTS } from "@/data/mockData";
import ProductCard from "@/components/products/ProductCard";
import { Heart, ShoppingBag, ArrowRight, ChevronRight } from "lucide-react";

export default function WishlistPage() {
  const { wishlist } = useStore();
  const wishlistedProducts = PRODUCTS.filter((p) => wishlist.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 min-h-[70vh]">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-brand-muted">
        <Link href="/account" className="hover:text-brand-green">My Account</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-brand-dark font-semibold">Saved Wishlist</span>
      </div>

      <div className="flex items-center justify-between border-b border-brand-border pb-6">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-brand-orange">
            SAVED FAVORITES
          </span>
          <h1 className="font-serif font-black text-3xl text-brand-dark">
            YOUR SAVED WISHLIST ({wishlistedProducts.length})
          </h1>
        </div>
      </div>

      {wishlistedProducts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-brand-border max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-brand-cream text-brand-orange flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="font-serif font-bold text-lg text-brand-dark">
            Your wishlist is waiting for something delicious
          </h3>
          <p className="text-xs text-brand-muted">
            Tap the heart on any product to save it here for later.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-brand-green hover:bg-brand-green-dark text-white text-xs font-bold px-6 py-3 rounded-xl transition-colors"
          >
            <span>Explore Dry Fruits</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlistedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
