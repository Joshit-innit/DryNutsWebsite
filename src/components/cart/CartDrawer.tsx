"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useStore } from "@/context/StoreContext";
import { formatPrice } from "@/lib/utils";
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check,
} from "lucide-react";

export default function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    cartSubtotal,
    cartDiscount,
    cartDeliveryFee,
    cartTotal,
    appliedCoupon,
    applyCouponCode,
    removeCoupon,
  } = useStore();

  const [couponInput, setCouponInput] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  if (!isCartOpen) return null;

  const freeDeliveryThreshold = 999;
  const progressPercent = Math.min(100, (cartSubtotal / freeDeliveryThreshold) * 100);
  const remainingForFreeDelivery = Math.max(0, freeDeliveryThreshold - cartSubtotal);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setIsApplyingCoupon(true);
    await applyCouponCode(couponInput);
    setIsApplyingCoupon(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
          {/* Drawer Header */}
          <div className="p-5 border-b border-brand-border flex items-center justify-between bg-brand-cream/60">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-brand-green" />
              <h2 className="font-serif font-bold text-lg text-brand-dark">
                Your Harvest Bag ({cart.reduce((s, i) => s + i.quantity, 0)})
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-full hover:bg-brand-beige text-brand-dark transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Bar */}
          <div className="px-5 py-3 bg-brand-beige/40 border-b border-brand-border">
            <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
              <span>
                {remainingForFreeDelivery === 0 ? (
                  <span className="text-brand-green flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> FREE Express Delivery Unlocked!
                  </span>
                ) : (
                  <span>
                    Add <strong className="text-brand-dark">{formatPrice(remainingForFreeDelivery)}</strong> more for FREE delivery
                  </span>
                )}
              </span>
              <span className="text-brand-muted">{Math.round(progressPercent)}%</span>
            </div>
            <div className="w-full bg-brand-border h-2 rounded-full overflow-hidden">
              <div
                className="bg-brand-green h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-16 flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-brand-cream flex items-center justify-center text-brand-muted mb-4">
                  <ShoppingBag className="w-8 h-8 text-brand-green/60" />
                </div>
                <h3 className="font-serif font-bold text-lg text-brand-dark mb-1">
                  Your bag is empty
                </h3>
                <p className="text-xs text-brand-muted max-w-xs mb-6">
                  Nourish your daily routine with hand-selected Kashmiri Mamra, Jumbo Cashews, and Royal Medjool dates.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="bg-brand-green hover:bg-brand-green-dark text-white text-xs font-semibold px-6 py-3 rounded-xl transition-all shadow-sm"
                >
                  Explore Harvest Collection
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={`${item.productId}-${item.variantId}`}
                  className="flex gap-3 p-3 rounded-2xl border border-brand-border/80 bg-white hover:border-brand-green/30 transition-all"
                >
                  {/* Thumbnail */}
                  <div className="w-20 h-20 rounded-xl bg-brand-cream overflow-hidden flex-shrink-0 border border-brand-border/40">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <Link
                          href={`/products/${item.slug}`}
                          onClick={() => setIsCartOpen(false)}
                          className="font-serif font-bold text-xs sm:text-sm text-brand-dark hover:text-brand-green transition-colors line-clamp-1"
                        >
                          {item.name}
                        </Link>
                        <button
                          onClick={() => removeFromCart(item.productId, item.variantId)}
                          className="text-brand-muted hover:text-red-500 p-1 transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="text-[11px] text-brand-muted font-medium block">
                        Pack size: {item.weight}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      {/* Quantity buttons */}
                      <div className="flex items-center border border-brand-border rounded-lg bg-brand-cream/50 overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center text-brand-dark hover:bg-brand-beige text-xs font-bold"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-bold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center text-brand-dark hover:bg-brand-beige text-xs font-bold"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Line total */}
                      <span className="font-bold text-sm text-brand-dark">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer (Summary & Checkout CTA) */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-brand-border bg-brand-cream/30 space-y-4">
              {/* Coupon Input */}
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-brand-green/10 border border-brand-green/30 text-xs">
                  <div className="flex items-center gap-1.5 text-brand-green font-semibold">
                    <Sparkles className="w-4 h-4 text-brand-saffron" />
                    <span>Coupon <strong>{appliedCoupon.code}</strong> applied (-{formatPrice(cartDiscount)})</span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-red-500 hover:underline text-[11px] font-bold"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter Coupon Code (e.g. FIRSTBUY)"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="flex-1 text-xs px-3 py-2 border border-brand-border rounded-xl focus:outline-none focus:border-brand-green uppercase font-semibold placeholder:normal-case"
                  />
                  <button
                    type="submit"
                    disabled={isApplyingCoupon}
                    className="bg-brand-dark hover:bg-brand-dark-light text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
                  >
                    Apply
                  </button>
                </form>
              )}

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-brand-muted">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-brand-dark font-medium">{formatPrice(cartSubtotal)}</span>
                </div>
                {cartDiscount > 0 && (
                  <div className="flex justify-between text-brand-green">
                    <span>Discount</span>
                    <span>-{formatPrice(cartDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span>{cartDeliveryFee === 0 ? "FREE" : formatPrice(cartDeliveryFee)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-brand-dark pt-2 border-t border-brand-border">
                  <span>Total Payable</span>
                  <span className="text-base text-brand-green">{formatPrice(cartTotal)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Link
                  href="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full bg-brand-green hover:bg-brand-green-dark text-white font-semibold text-sm py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/cart"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full bg-white hover:bg-brand-cream text-brand-dark border border-brand-border font-medium text-xs py-2.5 rounded-xl transition-colors block text-center"
                >
                  View Full Cart & Details
                </Link>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-brand-muted pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-green" />
                <span>100% Guaranteed Freshness • Verified Safe Payments</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
