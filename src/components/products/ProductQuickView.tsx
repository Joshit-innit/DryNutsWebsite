"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useStore } from "@/context/StoreContext";
import { formatPrice, calculateDiscount } from "@/lib/utils";
import { X, Star, ShoppingBag, Heart, ShieldCheck, Truck, Check, ArrowRight } from "lucide-react";

export default function ProductQuickView() {
  const { quickViewProduct, setQuickViewProduct, addToCart, toggleWishlist, isInWishlist } = useStore();
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isAdded, setIsAdded] = useState(false);

  if (!quickViewProduct) return null;

  const currentVariant = quickViewProduct.variants[selectedVariantIndex] || quickViewProduct.variants[0];
  const discountPercent = calculateDiscount(currentVariant.mrp, currentVariant.price);
  const wishlisted = isInWishlist(quickViewProduct.id);

  const handleAddToCart = () => {
    addToCart(quickViewProduct, currentVariant, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-brand-border relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => setQuickViewProduct(null)}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-brand-cream text-brand-dark hover:bg-brand-beige flex items-center justify-center transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Product Gallery Left */}
          <div className="bg-brand-cream/50 p-6 flex flex-col items-center justify-between border-r border-brand-border/60">
            <div className="w-full aspect-square rounded-2xl overflow-hidden mb-4 relative bg-white border border-brand-border/40">
              <img
                src={quickViewProduct.images[activeImageIndex] || quickViewProduct.images[0]}
                alt={quickViewProduct.name}
                className="w-full h-full object-cover"
              />
              {discountPercent > 0 && (
                <span className="absolute top-3 left-3 bg-brand-green text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                  {discountPercent}% OFF
                </span>
              )}
            </div>

            {/* Thumbnail Strip */}
            {quickViewProduct.images.length > 1 && (
              <div className="flex gap-2 w-full justify-center">
                {quickViewProduct.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                      activeImageIndex === idx ? "border-brand-green scale-105" : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details Right */}
          <div className="p-6 sm:p-8 flex flex-col justify-between">
            <div>
              {/* Category & Rating */}
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="uppercase tracking-wider font-bold text-brand-green">
                  {quickViewProduct.categoryName}
                </span>
                <div className="flex items-center gap-1 text-brand-dark font-semibold">
                  <Star className="w-3.5 h-3.5 fill-brand-saffron text-brand-saffron" />
                  <span>{quickViewProduct.rating.toFixed(1)}</span>
                  <span className="text-brand-muted">({quickViewProduct.reviewCount} reviews)</span>
                </div>
              </div>

              <h2 className="font-serif font-bold text-xl sm:text-2xl text-brand-dark mb-2">
                {quickViewProduct.name}
              </h2>

              <p className="text-xs text-brand-muted mb-4 leading-relaxed line-clamp-3">
                {quickViewProduct.shortDescription}
              </p>

              {/* Price Display */}
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-2xl font-black text-brand-dark">
                  {formatPrice(currentVariant.price)}
                </span>
                {currentVariant.mrp > currentVariant.price && (
                  <span className="text-sm text-brand-muted line-through">
                    {formatPrice(currentVariant.mrp)}
                  </span>
                )}
                <span className="text-xs text-brand-green font-semibold ml-auto">
                  Inclusive of all taxes
                </span>
              </div>

              {/* Weight Options */}
              <div className="mb-5">
                <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-2">
                  Select Pack Size:
                </label>
                <div className="flex flex-wrap gap-2">
                  {quickViewProduct.variants.map((v, idx) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariantIndex(idx)}
                      className={`text-xs px-3.5 py-1.5 rounded-lg font-semibold border transition-all ${
                        selectedVariantIndex === idx
                          ? "bg-brand-green text-white border-brand-green shadow-xs"
                          : "bg-white text-brand-dark border-brand-border hover:border-brand-muted"
                      }`}
                    >
                      {v.weight}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center gap-4 mb-6">
                <span className="text-xs font-bold text-brand-dark uppercase tracking-wider">
                  Quantity:
                </span>
                <div className="flex items-center border border-brand-border rounded-xl bg-brand-cream/50 overflow-hidden">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-8 h-8 flex items-center justify-center text-brand-dark hover:bg-brand-beige transition-colors font-bold"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-xs font-bold">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-8 h-8 flex items-center justify-center text-brand-dark hover:bg-brand-beige transition-colors font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div>
              <div className="flex gap-3 mb-4">
                <button
                  onClick={handleAddToCart}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all shadow-md ${
                    isAdded ? "bg-brand-green-dark" : "bg-brand-green hover:bg-brand-green-dark"
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Added to Bag</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add to Bag • {formatPrice(currentVariant.price * quantity)}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => toggleWishlist(quickViewProduct)}
                  className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-colors ${
                    wishlisted
                      ? "bg-red-50 border-red-200 text-red-500"
                      : "border-brand-border hover:bg-brand-cream text-brand-dark"
                  }`}
                  aria-label="Wishlist"
                >
                  <Heart className={`w-5 h-5 ${wishlisted ? "fill-red-500" : ""}`} />
                </button>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-brand-border text-xs text-brand-muted">
                <div className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-brand-green" />
                  <span>Free delivery over ₹999</span>
                </div>
                <Link
                  href={`/products/${quickViewProduct.slug}`}
                  onClick={() => setQuickViewProduct(null)}
                  className="text-brand-green font-semibold hover:underline flex items-center gap-1"
                >
                  <span>Full details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
