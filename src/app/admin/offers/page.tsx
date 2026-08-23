"use client";

import React from "react";
import { Tag, Sparkles, Plus, Calendar, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminOffersPage() {
  const offers = [
    {
      id: "off-1",
      title: "Festive Season Early-Bird Campaign",
      tagline: "Flat 25% OFF on Royal Nizam Gift Hampers & Combos",
      badge: "LIVE CAMPAIGN",
      period: "15 Aug 2026 - 31 Oct 2026",
      reach: "14.2k Impressions",
      conversions: "340 Orders",
      status: "active",
    },
    {
      id: "off-2",
      title: "Monsoon Wellness Immunity Pairing",
      tagline: "Free 250g Black Kishmish with 1kg Kashmiri Mamra Almonds",
      badge: "SEASONAL",
      period: "01 Jul 2026 - 31 Aug 2026",
      reach: "8.9k Impressions",
      conversions: "192 Orders",
      status: "active",
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-brand-green">
            CAMPAIGNS & MARKETING
          </span>
          <h1 className="font-serif font-black text-2xl sm:text-3xl text-brand-dark">
            Promotional Offers & Seasonal Campaigns
          </h1>
          <p className="text-xs text-brand-muted mt-0.5">
            Manage homepage promotional banners, harvest announcements, and gift bundle offers.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {offers.map((off) => (
          <div
            key={off.id}
            className="bg-white rounded-3xl border border-brand-border p-6 shadow-xs space-y-4 hover:border-brand-green/40 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 bg-brand-orange/10 text-brand-orange text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                <Sparkles className="w-3 h-3" /> {off.badge}
              </span>
              <span className="text-xs text-brand-muted flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> {off.period}
              </span>
            </div>

            <div>
              <h3 className="font-serif font-bold text-lg text-brand-dark">{off.title}</h3>
              <p className="text-xs text-brand-muted mt-1 leading-relaxed">{off.tagline}</p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-brand-border flex items-center justify-between text-xs">
              <div>
                <span className="text-brand-muted block text-[10px]">Campaign Reach</span>
                <span className="font-bold text-brand-dark">{off.reach}</span>
              </div>
              <div>
                <span className="text-brand-muted block text-[10px]">Direct Sales</span>
                <span className="font-bold text-brand-green">{off.conversions}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => toast.success("Offer settings updated")}
                className="text-xs font-bold text-brand-green hover:underline"
              >
                Edit Banner Asset & CTA →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
