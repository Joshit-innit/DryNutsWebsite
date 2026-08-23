"use client";

import React, { useState, useEffect } from "react";
import { couponService } from "@/services/coupons";
import { Coupon } from "@/types";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";
import { Percent, Plus, Trash2, CheckCircle2, Sparkles } from "lucide-react";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  // New coupon form state
  const [showModal, setShowModal] = useState(false);
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [discountValue, setDiscountValue] = useState(15);
  const [minOrderValue, setMinOrderValue] = useState(999);

  useEffect(() => {
    async function load() {
      const data = await couponService.getAllCoupons();
      setCoupons(data);
      setLoading(false);
    }
    load();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    const newC: Coupon = {
      code: code.toUpperCase().trim(),
      description,
      discountType,
      discountValue: Number(discountValue),
      minOrderValue: Number(minOrderValue),
      expiryDate: "2026-12-31",
      usageCount: 0,
      status: "active",
    };

    await couponService.createCoupon(newC);
    setCoupons([newC, ...coupons]);
    setShowModal(false);
    setCode("");
    setDescription("");
    toast.success(`Promo code ${newC.code} activated!`);
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-brand-green">
            DISCOUNT ENGINE
          </span>
          <h1 className="font-serif font-black text-2xl sm:text-3xl text-brand-dark">
            Coupons & Promo Rules ({coupons.length})
          </h1>
          <p className="text-xs text-brand-muted mt-0.5">
            Configure percentage & flat promotional discounts with minimum order thresholds.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-brand-green hover:bg-brand-green-dark text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Coupon</span>
        </button>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-3xl border border-brand-border shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-[11px] uppercase font-bold text-brand-muted border-b border-brand-border">
            <tr>
              <th className="py-3 px-4">Coupon Code</th>
              <th className="py-3 px-3">Description</th>
              <th className="py-3 px-3">Discount Rule</th>
              <th className="py-3 px-3">Min. Cart Value</th>
              <th className="py-3 px-3">Times Used</th>
              <th className="py-3 px-3">Expiry</th>
              <th className="py-3 px-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {coupons.map((c) => (
              <tr key={c.code} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-4">
                  <span className="font-mono font-black text-xs text-brand-green bg-brand-green/10 px-2.5 py-1 rounded-lg">
                    {c.code}
                  </span>
                </td>
                <td className="py-3 px-3 text-brand-dark max-w-xs">{c.description}</td>
                <td className="py-3 px-3 font-bold text-brand-dark">
                  {c.discountType === "percentage" ? `${c.discountValue}% OFF` : `₹${c.discountValue} FLAT OFF`}
                </td>
                <td className="py-3 px-3">{formatPrice(c.minOrderValue)}</td>
                <td className="py-3 px-3 font-bold">{c.usageCount} orders</td>
                <td className="py-3 px-3 text-brand-muted">{c.expiryDate}</td>
                <td className="py-3 px-4 text-right">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-800">
                    Active
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for new coupon */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-brand-border space-y-4">
            <h3 className="font-serif font-bold text-xl text-brand-dark">Create Promo Code</h3>
            <form onSubmit={handleCreateCoupon} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Coupon Code (Uppercase)</label>
                <input
                  type="text"
                  placeholder="e.g. FESTIVE30"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-brand-border rounded-xl font-mono uppercase font-bold focus:outline-none focus:border-brand-green"
                  required
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Special 30% Festive Discount"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-brand-border rounded-xl focus:outline-none focus:border-brand-green"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-brand-border rounded-xl focus:outline-none focus:border-brand-green font-semibold"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">Discount Value</label>
                  <input
                    type="number"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-brand-border rounded-xl focus:outline-none focus:border-brand-green font-bold text-brand-green"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Minimum Order Subtotal (₹)</label>
                <input
                  type="number"
                  value={minOrderValue}
                  onChange={(e) => setMinOrderValue(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-brand-border rounded-xl focus:outline-none focus:border-brand-green"
                  required
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-brand-border text-brand-muted font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-brand-green text-white font-bold rounded-xl shadow-xs"
                >
                  Activate Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
