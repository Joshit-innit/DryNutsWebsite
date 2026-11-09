"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { formatPrice } from "@/lib/utils";

/** Not a <form>: checkout's whole page is one, and forms can't nest. */
export function CouponField() {
  const { user, appliedCoupon, cartDiscount, applyCouponCode, removeCoupon, setIsCartOpen } = useStore();
  const pathname = usePathname();
  const [code, setCode] = useState("");
  const [applying, setApplying] = useState(false);

  const closeDrawer = () => setIsCartOpen(false);

  if (!user) {
    return (
      <p className="text-[14px] leading-snug text-brand-muted">
        Have a coupon?{" "}
        <Link href={`/login?next=${encodeURIComponent(pathname)}`} onClick={closeDrawer} className="link-rule text-brand-dark">
          Sign in
        </Link>{" "}
        to use it.
      </p>
    );
  }

  if (appliedCoupon) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl bg-brand-green/10 px-3.5 py-3 text-[14px]">
        <p className="min-w-0 text-brand-green">
          <span className="font-medium">{appliedCoupon.code}</span> saves you {formatPrice(cartDiscount)}
        </p>
        <button type="button" onClick={removeCoupon} className="shrink-0 text-brand-muted underline-offset-2 hover:text-brand-dark hover:underline">
          Remove
        </button>
      </div>
    );
  }

  const apply = async () => {
    if (!code.trim() || applying) return;
    setApplying(true);
    const applied = await applyCouponCode(code);
    setApplying(false);
    if (applied) setCode("");
  };

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3 text-[14px]">
        <label htmlFor="coupon-code" className="font-medium text-brand-dark">
          Coupon code
        </label>
        <Link href="/account/coupons" onClick={closeDrawer} className="text-[13px] text-brand-muted underline-offset-2 hover:text-brand-dark hover:underline">
          Your coupons
        </Link>
      </div>
      <div className="flex gap-2">
        <input
          id="coupon-code"
          type="text"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              apply();
            }
          }}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          className="h-11 min-w-0 flex-1 rounded-xl border border-brand-border bg-white px-3.5 text-[15px] font-medium uppercase text-brand-dark caret-brand-green outline-none transition-[border-color,box-shadow] duration-200 hover:border-[#D3CEC3] focus:border-brand-green focus:shadow-[0_0_0_1px_#2D4A33]"
        />
        <button
          type="button"
          onClick={apply}
          disabled={applying || !code.trim()}
          className="flex h-11 min-w-20 items-center justify-center rounded-xl bg-brand-dark px-4 text-[14px] font-medium text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
        >
          {applying ? <Loader2 className="h-4 w-4 animate-spin" aria-label="Checking coupon" /> : "Apply"}
        </button>
      </div>
    </div>
  );
}
