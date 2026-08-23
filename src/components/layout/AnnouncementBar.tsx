"use client";

import React, { useState } from "react";
import { Sparkles, X, Truck } from "lucide-react";

export default function AnnouncementBar() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="bg-brand-green text-white text-xs py-2 px-4 relative z-40 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex-1 flex items-center justify-center gap-2 text-center">
          <Truck className="w-3.5 h-3.5 text-brand-saffron hidden sm:inline" />
          <span className="font-medium tracking-wide">
            Freshly packed 2026 harvest • <strong>FREE express delivery</strong> across India on orders over ₹999
          </span>
          <span className="hidden md:inline-flex items-center gap-1 bg-white/15 px-2 py-0.5 rounded text-[11px] font-semibold text-brand-cream">
            <Sparkles className="w-3 h-3 text-brand-saffron" /> Code: FIRSTBUY for 15% OFF
          </span>
        </div>
        <button
          onClick={() => setVisible(false)}
          className="text-white/70 hover:text-white transition-colors p-0.5 ml-2"
          aria-label="Dismiss announcement"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
