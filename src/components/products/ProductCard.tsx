"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Product, WeightVariant } from "@/types";
import { formatPrice, calculateDiscount } from "@/lib/utils";
import { useStore } from "@/context/StoreContext";
import { Heart, Eye, ShoppingBag, Star, Sparkles, Check } from "lucide-react";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const { addToCart, toggleWishlist, isInWishlist, setQuickViewProduct } = useStore();
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const currentVariant: WeightVariant = product.variants[selectedVariantIndex] || product.variants[0];
  const discountPercent = calculateDiscount(currentVariant.mrp, currentVariant.price);
  const wishlisted = isInWishlist(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, currentVariant, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickViewProduct(product);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group bg-white rounded-2xl border border-brand-border/80 overflow-hidden shadow-subtle hover:shadow-hover hover:border-brand-green/30 transition-all duration-300 flex flex-col h-full"
    >
      {/* Image & Badges Container */}
      <div className="relative aspect-square w-full bg-brand-cream overflow-hidden">
        {/* Product Image */}
        <Link href={`/products/${product.slug}`} className="block w-full h-full">
          <img
            src={isHovered && product.images[1] ? product.images[1] : product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading={priority ? "eager" : "lazy"}
          />
        </Link>

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
          {product.isBestSeller && (
            <span className="bg-brand-orange text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm">
              Best Seller
            </span>
          )}
          {product.grade && (
            <span className="bg-brand-dark/80 backdrop-blur-sm text-brand-cream text-[10px] font-medium px-2 py-0.5 rounded-full">
              {product.grade}
            </span>
          )}
          {discountPercent > 0 && (
            <span className="bg-brand-green text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Top Right Action Icons */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
          <button
            onClick={handleWishlist}
            aria-label="Wishlist"
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm ${
              wishlisted
                ? "bg-red-50 text-red-500 scale-110"
                : "bg-white/90 text-brand-dark hover:text-red-500 hover:bg-white"
            }`}
          >
            <Heart className={`w-4 h-4 ${wishlisted ? "fill-red-500" : ""}`} />
          </button>

          <button
            onClick={handleQuickView}
            aria-label="Quick preview"
            className="w-8 h-8 rounded-full bg-white/90 text-brand-dark hover:text-brand-green hover:bg-white flex items-center justify-center transition-all shadow-sm opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Product Content Details */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-xs text-brand-muted mb-1.5">
            <span className="uppercase tracking-wider font-semibold text-[11px] text-brand-green">
              {product.categoryName}
            </span>
            <div className="flex items-center gap-1 bg-brand-cream px-1.5 py-0.5 rounded text-brand-dark font-semibold text-[11px]">
              <Star className="w-3 h-3 fill-brand-saffron text-brand-saffron" />
              <span>{product.rating.toFixed(1)}</span>
              <span className="text-brand-muted text-[10px]">({product.reviewCount})</span>
            </div>
          </div>

          {/* Product Title */}
          <Link href={`/products/${product.slug}`}>
            <h3 className="font-serif font-bold text-sm sm:text-base text-brand-dark hover:text-brand-green transition-colors line-clamp-2 mb-1">
              {product.name}
            </h3>
          </Link>

          {/* Short tagline or origin */}
          <p className="text-xs text-brand-muted line-clamp-1 mb-3">
            Origin: {product.origin.split(",")[0]}
          </p>

          {/* Weight Variant Selector Pills */}
          {product.variants.length > 1 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {product.variants.map((v, idx) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVariantIndex(idx)}
                  className={`text-xs px-2 py-0.5 rounded-md font-medium border transition-all ${
                    selectedVariantIndex === idx
                      ? "bg-brand-green text-white border-brand-green shadow-xs"
                      : "bg-white text-brand-dark border-brand-border hover:border-brand-muted"
                  }`}
                >
                  {v.weight}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Pricing & Add to Cart Button */}
        <div className="pt-3 border-t border-brand-border/60 flex items-center justify-between gap-2 mt-auto">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-bold text-brand-dark">
                {formatPrice(currentVariant.price)}
              </span>
              {currentVariant.mrp > currentVariant.price && (
                <span className="text-xs text-brand-muted line-through">
                  {formatPrice(currentVariant.mrp)}
                </span>
              )}
            </div>
            <span className="text-[10px] text-brand-green font-medium block">
              {currentVariant.stock > 0 ? "In Stock • Ships in 24h" : "Out of Stock"}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={currentVariant.stock <= 0}
            className={`flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
              isAdded
                ? "bg-brand-green-dark text-white"
                : "bg-brand-green hover:bg-brand-green-dark text-white shadow-xs hover:shadow-sm"
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Added</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
