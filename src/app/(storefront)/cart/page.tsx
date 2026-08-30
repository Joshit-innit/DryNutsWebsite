"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useStore } from "@/context/StoreContext";
import { formatPrice } from "@/lib/utils";
import { PRODUCTS } from "@/data/mockData";
import ProductCard from "@/components/products/ProductCard";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Truck,
  Check,
  Gift,
  ArrowLeft,
} from "lucide-react";

export default function CartPage() {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartSubtotal,
    cartDiscount,
    cartDeliveryFee,
    cartTotal,
    appliedCoupon,
    applyCouponCode,
    removeCoupon,
  } = useStore();

  const [couponCode, setCouponCode] = useState("");
  const [giftNote, setGiftNote] = useState("");
  const [isGift, setIsGift] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.trim()) {
      await applyCouponCode(couponCode);
    }
  };

  const recommendedItems = PRODUCTS.filter((p) => !cart.some((c) => c.productId === p.id)).slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="border-b border-brand-border pb-6 flex items-center justify-between">
        <div>
          <p className="eyebrow mb-2">Shopping bag</p>
          <h1 className="font-serif font-medium text-3xl sm:text-4xl text-brand-dark">
            Your bag ({cart.reduce((s, i) => s + i.quantity, 0)})
          </h1>
        </div>
        <Link
          href="/products"
          className="text-xs font-bold uppercase text-brand-green hover:underline flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Continue Shopping
        </Link>
      </div>

      {cart.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-brand-border max-w-lg mx-auto space-y-4">
          <div className="w-20 h-20 rounded-full bg-brand-cream flex items-center justify-center text-brand-green mx-auto">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h2 className="font-serif font-bold text-2xl text-brand-dark">Your bag is currently empty</h2>
          <p className="text-xs text-brand-muted max-w-sm mx-auto">
            Explore our curated 9 harvest categories including authentic Kashmiri Mamra and King Cashews.
          </p>
          <div className="pt-2">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-brand-green hover:bg-brand-green-dark text-white font-bold text-xs px-8 py-3.5 rounded-xl transition-all shadow-sm"
            >
              <span>Explore All Dry Fruits</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Table of items */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white rounded-3xl border border-brand-border p-6 shadow-xs overflow-hidden">
              <div className="divide-y divide-brand-border">
                {cart.map((item) => (
                  <div key={`${item.productId}-${item.variantId}`} className="py-5 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    {/* Thumbnail & Name */}
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-2xl bg-brand-cream overflow-hidden flex-shrink-0 border border-brand-border">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <Link
                          href={`/products/${item.slug}`}
                          className="font-serif font-bold text-sm sm:text-base text-brand-dark hover:text-brand-green transition-colors line-clamp-1"
                        >
                          {item.name}
                        </Link>
                        <p className="text-xs text-brand-muted mt-0.5">Pack Weight: <strong>{item.weight}</strong></p>
                        <p className="text-xs font-bold text-brand-dark mt-1">{formatPrice(item.price)} each</p>
                      </div>
                    </div>

                    {/* Quantity & Controls */}
                    <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6">
                      <div className="flex items-center border border-brand-border rounded-xl bg-brand-cream/50 overflow-hidden shadow-xs">
                        <button
                          onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center text-brand-dark hover:bg-brand-beige font-bold text-xs"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center text-brand-dark hover:bg-brand-beige font-bold text-xs"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="font-bold text-base text-brand-dark block">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                        <button
                          onClick={() => removeFromCart(item.productId, item.variantId)}
                          className="text-[11px] text-red-500 hover:underline font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Gift Note Accordion */}
            <div className="bg-white rounded-3xl border border-brand-border p-6 shadow-xs space-y-3">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-brand-dark uppercase tracking-wider">
                <input
                  type="checkbox"
                  checked={isGift}
                  onChange={(e) => setIsGift(e.target.checked)}
                  className="w-4 h-4 rounded text-brand-green accent-brand-green"
                />
                <Gift className="w-4 h-4 text-brand-saffron" />
                <span>This is a gift order — Add gold-foil personalized card (+FREE)</span>
              </label>

              {isGift && (
                <textarea
                  placeholder="Write your custom gift message for the recipient..."
                  rows={2}
                  value={giftNote}
                  onChange={(e) => setGiftNote(e.target.value)}
                  className="w-full text-xs p-3 border border-brand-border rounded-xl focus:outline-none focus:border-brand-green"
                />
              )}
            </div>
          </div>

          {/* Right Order Summary */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl border border-brand-border p-6 sm:p-8 shadow-card space-y-6">
              <h3 className="font-serif font-bold text-lg text-brand-dark border-b border-brand-border pb-3">
                Order Summary
              </h3>

              {/* Promo Code Form */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark mb-2">
                  Have a Promo Code?
                </label>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-brand-green/10 border border-brand-green/30 text-xs">
                    <span className="font-bold text-brand-green">
                      Code {appliedCoupon.code} applied (-{formatPrice(cartDiscount)})
                    </span>
                    <button onClick={removeCoupon} className="text-red-500 font-bold hover:underline">
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. FIRSTBUY"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 text-xs px-3 py-2.5 border border-brand-border rounded-xl focus:outline-none focus:border-brand-green uppercase font-semibold"
                    />
                    <button
                      type="submit"
                      className="bg-brand-dark hover:bg-brand-dark-light text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors"
                    >
                      Apply
                    </button>
                  </form>
                )}
              </div>

              {/* Pricing Line Items */}
              <div className="space-y-2 text-xs text-brand-muted pt-2 border-t border-brand-border">
                <div className="flex justify-between">
                  <span>Bag Subtotal</span>
                  <span className="text-brand-dark font-semibold">{formatPrice(cartSubtotal)}</span>
                </div>
                {cartDiscount > 0 && (
                  <div className="flex justify-between text-brand-green font-semibold">
                    <span>Discount</span>
                    <span>-{formatPrice(cartDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery Speed</span>
                  <span className="text-brand-dark font-medium">
                    {cartDeliveryFee === 0 ? "FREE Express" : formatPrice(cartDeliveryFee)}
                  </span>
                </div>
                <div className="flex justify-between text-base font-black text-brand-dark pt-3 border-t border-brand-border">
                  <span>Total Amount</span>
                  <span className="text-xl text-brand-green">{formatPrice(cartTotal)}</span>
                </div>
              </div>

              {/* Checkout CTA */}
              <Link
                href="/checkout"
                className="w-full bg-brand-green hover:bg-brand-green-dark text-white font-bold text-sm py-4 rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group"
              >
                <span>PROCEED TO CHECKOUT</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <div className="flex items-center justify-center gap-2 text-[11px] text-brand-muted">
                <ShieldCheck className="w-4 h-4 text-brand-green" />
                <span>100% Secure 256-bit Encrypted Checkout</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cross-Sell */}
      {recommendedItems.length > 0 && (
        <div className="pt-8 border-t border-brand-border space-y-6">
          <h3 className="font-serif font-bold text-xl text-brand-dark">
            YOU MAY ALSO LIKE
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendedItems.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
