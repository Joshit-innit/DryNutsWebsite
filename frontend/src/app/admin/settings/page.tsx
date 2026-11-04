"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { apiErrorMessage } from "@/lib/auth-session";
import { DEFAULT_STORE_SETTINGS } from "@/lib/store-settings";
import { settingsService } from "@/services/settings";
import { StoreSettings } from "@/types";

export default function AdminSettingsPage() {
  const { refreshStoreSettings } = useStore();
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);
  const [status, setStatus] = useState<"loading" | "ready" | "failed">("loading");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    settingsService
      .getSettings()
      .then((saved) => {
        setSettings(saved);
        setStatus("ready");
      })
      .catch(() => setStatus("failed"));
  }, []);

  const update = (changes: Partial<StoreSettings>) => setSettings((prev) => ({ ...prev, ...changes }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      setSettings(await settingsService.saveSettings(settings));
      await refreshStoreSettings();
      toast.success("Store operational settings saved successfully!");
    } catch (error) {
      toast.error(apiErrorMessage(error, "Could not save store settings."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <span className="text-xs uppercase font-semibold tracking-[0.08em] text-brand-muted">
          CONFIGURATIONS & TAXATION
        </span>
        <h1 className="font-semibold tracking-[-0.035em] text-2xl sm:text-3xl text-brand-dark">
          Store Operations & Settings
        </h1>
        <p className="text-xs text-brand-muted mt-0.5">
          Configure GST tax calculation, free shipping thresholds, and compliance checks.
        </p>
        {status === "failed" && (
          <p role="alert" className="text-xs text-red-600 font-semibold mt-2">
            Could not load the saved settings, so saving is turned off. Refresh to try again.
          </p>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white rounded-3xl border border-brand-border p-6 sm:p-8 shadow-xs space-y-4 text-xs">
          <h3 className="font-semibold tracking-[-0.025em] text-base text-brand-dark border-b border-brand-border pb-3">
            Store Identity
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold mb-1">Brand Name</label>
              <input
                type="text"
                value={settings.storeName}
                onChange={(e) => update({ storeName: e.target.value })}
                className="w-full p-2.5 bg-brand-cream border border-brand-border rounded-xl focus:outline-none focus:border-brand-green font-semibold"
              />
            </div>
            <div>
              <label className="block font-bold mb-1">Support Email</label>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => update({ supportEmail: e.target.value })}
                className="w-full p-2.5 bg-brand-cream border border-brand-border rounded-xl focus:outline-none focus:border-brand-green"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-brand-border p-6 sm:p-8 shadow-xs space-y-4 text-xs">
          <h3 className="font-semibold tracking-[-0.025em] text-base text-brand-dark border-b border-brand-border pb-3">
            Shipping & GST Policy
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold mb-1">Free Delivery Minimum Order (₹)</label>
              <input
                type="number"
                min={0}
                value={settings.freeDeliveryMin}
                onChange={(e) => update({ freeDeliveryMin: Number(e.target.value) })}
                className="w-full p-2.5 bg-brand-cream border border-brand-border rounded-xl focus:outline-none focus:border-brand-green font-bold text-brand-green"
              />
            </div>
            <div>
              <label className="block font-bold mb-1">Standard Dry Fruit GST Rate (%)</label>
              <input
                type="number"
                min={0}
                max={100}
                step="0.01"
                value={settings.gstRate}
                onChange={(e) => update({ gstRate: Number(e.target.value) })}
                className="w-full p-2.5 bg-brand-cream border border-brand-border rounded-xl focus:outline-none focus:border-brand-green font-bold"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer font-bold text-brand-dark">
              <input
                type="checkbox"
                checked={settings.enforcePackingChecklist}
                onChange={(e) => update({ enforcePackingChecklist: e.target.checked })}
                className="w-4 h-4 rounded text-brand-green accent-brand-green"
              />
              <span>Enforce mandatory Clean-room Nitrogen Flush Inspection Checklist before order dispatch</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={status !== "ready" || saving}
            className="bg-brand-dark hover:bg-black text-white text-xs font-bold px-8 py-3 rounded-xl shadow-xs transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving..." : "Save Operational Rules"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
