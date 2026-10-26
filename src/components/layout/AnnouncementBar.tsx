"use client";

import React, { useState } from "react";
import { X } from "lucide-react";

export default function AnnouncementBar() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="bg-brand-green text-[#F7F1E8] text-[11px] sm:text-xs py-2.5 px-4 relative z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 text-center">
        <p className="tracking-wide font-light">
          Explore cashews, pistachios, almonds, dried fruit, combos, and gift boxes.
        </p>
        <button
          onClick={() => setVisible(false)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
          aria-label="Dismiss announcement"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
