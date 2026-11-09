"use client";

import React, { useState, useEffect } from "react";
import { couponService } from "@/services/coupons";
import { Coupon, CouponChanges } from "@/types";
import { apiErrorMessage } from "@/lib/auth-session";
import { formatCouponDate, isCouponExpired, todayInStore } from "@/lib/order-pricing";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { TableRowsSkeleton } from "@/components/ui/Skeleton";

function couponBadge(coupon: Coupon) {
  if (coupon.status === "disabled") return { label: "Disabled", className: "bg-brand-beige text-brand-muted" };
  if (coupon.status === "expired" || isCouponExpired(coupon)) return { label: "Expired", className: "bg-red-100 text-red-800" };
  if (coupon.usageLimit !== undefined && coupon.usageCount >= coupon.usageLimit) {
    return { label: "Used up", className: "bg-amber-100 text-amber-900" };
  }
  return { label: "Active", className: "bg-green-100 text-green-800" };
}

const replaceCoupon = (coupons: Coupon[], updated: Coupon) =>
  coupons.map((coupon) => (coupon.code === updated.code ? updated : coupon));

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  // New coupon form state
  const [showModal, setShowModal] = useState(false);
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [minOrderValue, setMinOrderValue] = useState("");
  const [maxDiscount, setMaxDiscount] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [listed, setListed] = useState(true);
  const [saving, setSaving] = useState(false);

  // Changing the expiry date of one row
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [newExpiry, setNewExpiry] = useState("");

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
      minOrderValue: Number(minOrderValue || 0),
      maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
      expiryDate,
      usageCount: 0,
      usageLimit: usageLimit ? Number(usageLimit) : undefined,
      status: "active",
      listed,
    };

    setSaving(true);
    try {
      const created = await couponService.createCoupon(newC);
      setCoupons([created, ...coupons]);
      setShowModal(false);
      setCode("");
      setDescription("");
      setDiscountValue("");
      setMinOrderValue("");
      setMaxDiscount("");
      setUsageLimit("");
      setExpiryDate("");
      setListed(true);
      toast.success(`Promo code ${created.code} activated!`);
    } catch (error) {
      toast.error(apiErrorMessage(error, "Could not create the coupon."));
    } finally {
      setSaving(false);
    }
  };

  const updateCoupon = async (coupon: Coupon, changes: CouponChanges) => {
    try {
      const updated = await couponService.updateCoupon(coupon.code, changes);
      setCoupons((current) => replaceCoupon(current, updated));
      setEditingCode(null);
    } catch (error) {
      toast.error(apiErrorMessage(error, "Could not update the coupon."));
    }
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-semibold tracking-[0.08em] text-brand-muted">
            DISCOUNT ENGINE
          </span>
          <h1 className="font-semibold tracking-[-0.035em] text-2xl sm:text-3xl text-brand-dark">
            Coupons & Promo Rules ({coupons.length})
          </h1>
          <p className="text-xs text-brand-muted mt-0.5">
            Every coupon has an expiry date and works once per customer account.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-brand-dark hover:bg-black text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Coupon</span>
        </button>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-3xl border border-brand-border shadow-xs overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-brand-cream text-[11px] uppercase font-bold text-brand-muted border-b border-brand-border">
            <tr>
              <th className="py-3 px-4">Coupon Code</th>
              <th className="py-3 px-3">Description</th>
              <th className="py-3 px-3">Discount Rule</th>
              <th className="py-3 px-3">Min. Cart Value</th>
              <th className="py-3 px-3">Times Used</th>
              <th className="py-3 px-3">Expiry</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {loading ? <TableRowsSkeleton columns={8} rows={4} /> : coupons.map((c) => {
              const badge = couponBadge(c);
              return (
              <tr key={c.code} className="hover:bg-brand-cream/70 transition-colors">
                <td className="py-3 px-4">
                  <span className="font-mono font-black text-xs text-brand-green bg-brand-green/10 px-2.5 py-1 rounded-lg">
                    {c.code}
                  </span>
                </td>
                <td className="py-3 px-3 text-brand-dark max-w-xs">
                  {c.description}
                  {c.listed === false && (
                    <span className="mt-1 block text-[11px] text-brand-muted">Unlisted: only works for people given the code</span>
                  )}
                </td>
                <td className="py-3 px-3 font-bold text-brand-dark">
                  {c.discountType === "percentage" ? `${c.discountValue}% OFF` : `₹${c.discountValue} FLAT OFF`}
                </td>
                <td className="py-3 px-3">{formatPrice(c.minOrderValue)}</td>
                <td className="py-3 px-3 font-bold">
                  {c.usageCount}{c.usageLimit !== undefined && ` of ${c.usageLimit}`} {c.usageCount === 1 ? "order" : "orders"}
                </td>
                <td className="py-3 px-3 text-brand-muted whitespace-nowrap">
                  {editingCode === c.code ? (
                    <span className="flex items-center gap-2">
                      <input
                        type="date"
                        aria-label={`New expiry date for ${c.code}`}
                        min={todayInStore()}
                        value={newExpiry}
                        onChange={(e) => setNewExpiry(e.target.value)}
                        className="p-1.5 bg-brand-cream border border-brand-border rounded-lg focus:outline-none focus:border-brand-green"
                      />
                      <button
                        type="button"
                        disabled={!newExpiry}
                        onClick={() =>
                          updateCoupon(c, {
                            expiryDate: newExpiry,
                            status: c.status === "disabled" ? "disabled" : "active",
                          })
                        }
                        className="font-bold text-brand-green hover:underline disabled:opacity-50"
                      >
                        Save
                      </button>
                      <button type="button" onClick={() => setEditingCode(null)} className="font-bold hover:underline">
                        Cancel
                      </button>
                    </span>
                  ) : (
                    formatCouponDate(c.expiryDate)
                  )}
                </td>
                <td className="py-3 px-3">
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${badge.className}`}>
                    {badge.label}
                  </span>
                </td>
                <td className="py-3 px-4 text-right whitespace-nowrap space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCode(c.code);
                      setNewExpiry(c.expiryDate >= todayInStore() ? c.expiryDate : "");
                    }}
                    className="font-bold text-brand-dark hover:underline"
                  >
                    Change expiry
                  </button>
                  <button
                    type="button"
                    onClick={() => updateCoupon(c, { status: c.status === "disabled" ? "active" : "disabled" })}
                    className="font-bold text-brand-muted hover:underline"
                  >
                    {c.status === "disabled" ? "Enable" : "Disable"}
                  </button>
                  <button
                    type="button"
                    onClick={() => updateCoupon(c, { listed: c.listed === false })}
                    className="font-bold text-brand-muted hover:underline"
                  >
                    {c.listed === false ? "Show in wallets" : "Hide from wallets"}
                  </button>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal for new coupon */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-brand-border space-y-4">
            <h3 className="font-semibold tracking-[-0.025em] text-xl text-brand-dark">Create Promo Code</h3>
            <form onSubmit={handleCreateCoupon} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Coupon Code (Uppercase)</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full p-2.5 bg-brand-cream border border-brand-border rounded-xl font-mono uppercase font-bold focus:outline-none focus:border-brand-green"
                  required
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 bg-brand-cream border border-brand-border rounded-xl focus:outline-none focus:border-brand-green"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full p-2.5 bg-brand-cream border border-brand-border rounded-xl focus:outline-none focus:border-brand-green font-semibold"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">Discount Value</label>
                  <input
                    type="number"
                    min="1"
                    max={discountType === "percentage" ? 100 : undefined}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    className="w-full p-2.5 bg-brand-cream border border-brand-border rounded-xl focus:outline-none focus:border-brand-green font-bold text-brand-green"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Expiry Date</label>
                <input
                  type="date"
                  min={todayInStore()}
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full p-2.5 bg-brand-cream border border-brand-border rounded-xl focus:outline-none focus:border-brand-green"
                  required
                />
                <p className="mt-1 text-[11px] text-brand-muted">Works until the end of this date, India time.</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold mb-1">Min. Order (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={minOrderValue}
                    onChange={(e) => setMinOrderValue(e.target.value)}
                    className="w-full p-2.5 bg-brand-cream border border-brand-border rounded-xl focus:outline-none focus:border-brand-green"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Discount Cap (₹)</label>
                  <input
                    type="number"
                    min="1"
                    value={maxDiscount}
                    onChange={(e) => setMaxDiscount(e.target.value)}
                    className="w-full p-2.5 bg-brand-cream border border-brand-border rounded-xl focus:outline-none focus:border-brand-green"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Total Limit</label>
                  <input
                    type="number"
                    min="1"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(e.target.value)}
                    className="w-full p-2.5 bg-brand-cream border border-brand-border rounded-xl focus:outline-none focus:border-brand-green"
                  />
                </div>
              </div>
              <p className="text-[11px] text-brand-muted">These three are optional. Leave them blank for no limit.</p>

              <label className="flex items-start gap-2.5 pt-1">
                <input
                  type="checkbox"
                  checked={listed}
                  onChange={(e) => setListed(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-brand-green"
                />
                <span>
                  <span className="block font-bold">Show in customers&apos; coupon wallets</span>
                  <span className="block text-[11px] text-brand-muted">
                    Untick for a private code, such as one for staff or a single customer. It still works when typed in.
                  </span>
                </span>
              </label>

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
                  disabled={saving}
                  className="flex-1 py-2.5 bg-brand-green text-white font-bold rounded-xl shadow-xs disabled:opacity-60"
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
