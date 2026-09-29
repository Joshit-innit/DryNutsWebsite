"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Product, WeightVariant } from "@/types";
import { formatPrice, calculateDiscount } from "@/lib/utils";
import { getProductImage } from "@/lib/product-images";
import { useStore } from "@/context/StoreContext";
import { Heart, Eye, ShoppingBag, Star, Check } from "lucide-react";

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
  const primaryImage = getProductImage(product);
  const hoverImage = getProductImage(product, 1);

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
      className="group flex flex-col h-full"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-brand-beige">
        <Link href={`/products/${product.slug}`} className="block w-full h-full">
          <img
            src={isHovered ? hoverImage : primaryImage}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            loading={priority ? "eager" : "lazy"}
            onError={(event) => {
              event.currentTarget.src = primaryImage;
            }}
          />
        </Link>

        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
          {product.isBestSeller && (
            <span className="bg-brand-dark/90 backdrop-blur-md text-brand-saffron text-[9.5px] font-bold tracking-[0.16em] uppercase px-2.5 py-1 rounded-full shadow-sm border border-brand-saffron/20">
              Connoisseur Choice
            </span>
          )}
          {discountPercent > 0 && (
            <span className="bg-brand-green text-brand-cream text-[9.5px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full shadow-sm">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
          <button
            onClick={handleWishlist}
            aria-label="Wishlist"
            className={`w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md transition-all ${
              wishlisted ? "bg-white text-red-500" : "bg-white/80 text-brand-dark hover:bg-white"
            }`}
          >
            <Heart className={`w-4 h-4 ${wishlisted ? "fill-red-500" : ""}`} />
          </button>
          <button
            onClick={handleQuickView}
            aria-label="Quick preview"
            className="w-9 h-9 rounded-full bg-white/80 text-brand-dark hover:bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="pt-4 flex-1 flex flex-col">
        <div className="flex items-center justify-between text-[11px] text-brand-muted mb-1">
          <span className="tracking-[0.16em] uppercase">{product.categoryName}</span>
          <span className="inline-flex items-center gap-1">
            <Star className="w-3 h-3 fill-brand-saffron text-brand-saffron" />
            {product.rating.toFixed(1)}
          </span>
        </div>

        <Link href={`/products/${product.slug}`} className="group/title">
          <h3 className="font-marcellus text-xl font-normal text-brand-dark group-hover/title:text-brand-green transition-colors line-clamp-2 leading-[1.25] tracking-[0.015em]">
            {product.name}
          </h3>
        </Link>
        <p className="font-marcellus text-xs text-brand-muted/90 mt-1.5 line-clamp-2 leading-relaxed tracking-[0.01em]">
          {product.shortDescription || product.origin}
        </p>

        {product.variants.length > 1 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {product.variants.map((v, idx) => (
              <button
                key={v.id}
                onClick={() => setSelectedVariantIndex(idx)}
                className={`text-[11px] px-2.5 py-1 rounded-full border transition-all ${
                  selectedVariantIndex === idx
                    ? "bg-brand-green text-white border-brand-green"
                    : "bg-transparent text-brand-muted border-brand-border hover:border-brand-muted"
                }`}
              >
                {v.weight}
              </button>
            ))}
          </div>
        )}

        <div className="mt-auto pt-4 flex items-center justify-between gap-2 border-t border-brand-border/60">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold tracking-tight text-brand-dark font-sans">{formatPrice(currentVariant.price)}</span>
              {currentVariant.mrp > currentVariant.price && (
                <span className="text-xs text-brand-muted line-through">
                  {formatPrice(currentVariant.mrp)}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={currentVariant.stock <= 0}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm ${
              isAdded
                ? "bg-brand-saffron text-brand-dark scale-105"
                : "bg-brand-green text-brand-cream hover:bg-brand-green-light hover:scale-105 active:scale-95"
            }`}
            aria-label="Add to bag"
          >
            {isAdded ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
