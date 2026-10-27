"use client";

import React, { useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";

export default function AnnouncementBar() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="relative z-40 bg-brand-dark px-4 py-2 text-[12.5px] text-white/80">
      <div className="mx-auto flex max-w-[1440px] items-center justify-center gap-3 text-center">
        <p className="tracking-[-0.005em]">
          <span className="mr-2 inline-block rounded-md border border-white/20 px-1.5 py-px text-[11px] font-medium text-white">New</span>
          The new-season Mamra almond harvest has landed.{" "}
          <Link href="/category/almonds" className="font-medium text-white underline decoration-white/30 decoration-2 underline-offset-4 hover:decoration-white">
            Shop almonds
          </Link>
        </p>
        <button
          onClick={() => setVisible(false)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
          aria-label="Dismiss announcement"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
