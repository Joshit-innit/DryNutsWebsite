"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Sliders, Save, ShieldCheck, Check } from "lucide-react";

export default function AdminSettingsPage() {
  const [storeName, setStoreName] = useState("NutriNation Foods");
  const [supportEmail, setSupportEmail] = useState("care@nutrination.in");
  const [freeShippingMin, setFreeShippingMin] = useState(999);
  const [gstRate, setGstRate] = useState(5); // 5% GST for unprocessed dry fruits
  const [nitrogenSealAudit, setNitrogenSealAudit] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Store operational settings saved successfully!");
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <span className="text-xs uppercase font-bold tracking-wider text-brand-green">
          CONFIGURATIONS & TAXATION
        </span>
        <h1 className="font-serif font-black text-2xl sm:text-3xl text-brand-dark">
          Store Operations & Settings
        </h1>
        <p className="text-xs text-brand-muted mt-0.5">
          Configure GST tax calculation, free shipping thresholds, and compliance checks.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white rounded-3xl border border-brand-border p-6 sm:p-8 shadow-xs space-y-4 text-xs">
          <h3 className="font-serif font-bold text-base text-brand-dark border-b border-brand-border pb-3">
            Store Identity
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold mb-1">Brand Name</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-brand-border rounded-xl focus:outline-none focus:border-brand-green font-semibold"
              />
            </div>
            <div>
              <label className="block font-bold mb-1">Support Email</label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-brand-border rounded-xl focus:outline-none focus:border-brand-green"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-brand-border p-6 sm:p-8 shadow-xs space-y-4 text-xs">
          <h3 className="font-serif font-bold text-base text-brand-dark border-b border-brand-border pb-3">
            Shipping & GST Policy
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold mb-1">Free Delivery Minimum Order (₹)</label>
              <input
                type="number"
                value={freeShippingMin}
                onChange={(e) => setFreeShippingMin(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-brand-border rounded-xl focus:outline-none focus:border-brand-green font-bold text-brand-green"
              />
            </div>
            <div>
              <label className="block font-bold mb-1">Standard Dry Fruit GST Rate (%)</label>
              <input
                type="number"
                value={gstRate}
                onChange={(e) => setGstRate(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-brand-border rounded-xl focus:outline-none focus:border-brand-green font-bold"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer font-bold text-brand-dark">
              <input
                type="checkbox"
                checked={nitrogenSealAudit}
                onChange={(e) => setNitrogenSealAudit(e.target.checked)}
                className="w-4 h-4 rounded text-brand-green accent-brand-green"
              />
              <span>Enforce mandatory Clean-room Nitrogen Flush Inspection Checklist before order dispatch</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-brand-green hover:bg-brand-green-dark text-white text-xs font-bold px-8 py-3 rounded-xl shadow-xs transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Operational Rules</span>
          </button>
        </div>
      </form>
    </div>
  );
}
