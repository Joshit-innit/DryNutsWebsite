"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/context/StoreContext";
import { couponService } from "@/services/coupons";
import { formatCouponDate, todayInStore } from "@/lib/order-pricing";
import { formatPrice } from "@/lib/utils";
import { LoadingRegion, Skeleton } from "@/components/ui/Skeleton";
import { Coupon, CouponWallet } from "@/types";

const SOON_DAYS = 7;

const couponValue = (coupon: Coupon) =>
  coupon.discountType === "percentage" ? `${coupon.discountValue}% off` : `${formatPrice(coupon.discountValue)} off`;

function daysLeft(expiryDate: string) {
  const days = (Date.parse(expiryDate) - Date.parse(todayInStore())) / 86_400_000;
  return Math.round(days);
}

function endsLabel(expiryDate: string) {
  const days = daysLeft(expiryDate);
  if (days === 0) return "Ends today";
  if (days === 1) return "Ends tomorrow";
  if (days <= SOON_DAYS) return `Ends in ${days} days`;
  return `Valid until ${formatCouponDate(expiryDate)}`;
}

export default function AccountCouponsPage() {
  const [wallet, setWallet] = useState<CouponWallet | null>(null);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async () => {
    setFailed(false);
    try {
      setWallet(await couponService.getMyCoupons());
    } catch {
      setFailed(true);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="mx-auto max-w-3xl px-4 pb-20 pt-8 sm:px-6 lg:pt-12">
      <Link href="/account" className="inline-flex items-center gap-1.5 text-[14px] text-brand-muted transition-colors hover:text-brand-dark">
        <ArrowLeft className="h-4 w-4" />
        Back to account
      </Link>
      <h1 className="mt-4 text-[clamp(2.5rem,5vw,3.5rem)] tracking-[-0.04em]">Your coupons</h1>
      <p className="mt-3 text-[15px] text-brand-muted">Each coupon works once on your account.</p>

      {failed ? (
        <div className="mt-10 rounded-[20px] border border-brand-border bg-white p-6 text-[15px]">
          <p>We couldn&apos;t load your coupons.</p>
          <button type="button" onClick={load} className="link-rule mt-2 text-brand-dark">
            Try again
          </button>
        </div>
      ) : !wallet ? (
        <LoadingRegion label="Loading your coupons" className="mt-10 space-y-3">
          {[1, 2, 3].map((row) => (
            <Skeleton key={row} className="h-36 w-full rounded-[20px]" />
          ))}
        </LoadingRegion>
      ) : (
        <>
          <Section title="Ready to use" count={wallet.available.length}>
            {wallet.available.length > 0 ? (
              <div className="space-y-3">
                {wallet.available.map((coupon) => (
                  <AvailableCoupon key={coupon.code} coupon={coupon} />
                ))}
              </div>
            ) : (
              <p className="text-[15px] text-brand-muted">
                Nothing to use right now. New coupons will appear here.
              </p>
            )}
          </Section>

          {wallet.used.length > 0 && (
            <Section title="Used" count={wallet.used.length}>
              <ul className="divide-y divide-brand-border rounded-[20px] border border-brand-border bg-white">
                {wallet.used.map((use) => (
                  <li key={use.orderId} className="flex flex-col gap-1 p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                    <div className="min-w-0">
                      <p className="text-[15px] font-medium">{use.couponCode}</p>
                      <p className="text-[14px] text-brand-muted">
                        Saved {formatPrice(use.discount)} on {formatCouponDate(use.redeemedAt)}
                      </p>
                    </div>
                    <Link href={`/account/orders/${use.orderId}`} className="link-rule shrink-0 self-start text-[14px] sm:self-auto">
                      {use.orderNumber}
                    </Link>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {wallet.expired.length > 0 && (
            <Section title="Expired" count={wallet.expired.length}>
              <ul className="divide-y divide-brand-border rounded-[20px] border border-brand-border">
                {wallet.expired.map((coupon) => (
                  <li key={coupon.code} className="flex items-baseline justify-between gap-6 p-5 text-brand-muted">
                    <p className="min-w-0 text-[15px]">
                      {coupon.code} <span className="text-[14px]">· {couponValue(coupon)}</span>
                    </p>
                    <p className="shrink-0 text-[14px]">Ended {formatCouponDate(coupon.expiryDate)}</p>
                  </li>
                ))}
              </ul>
            </Section>
          )}
        </>
      )}
    </div>
  );
}

function Section({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <section className="mt-10 border-t border-brand-border pt-7">
      <h2 className="mb-5 text-[19px] tracking-[-0.03em]">
        {title} <span className="font-normal tabular-nums text-brand-muted">{count}</span>
      </h2>
      {children}
    </section>
  );
}

function AvailableCoupon({ coupon }: { coupon: Coupon }) {
  const { cart, cartSubtotal, appliedCoupon, applyCouponCode } = useStore();
  const [copied, setCopied] = useState(false);
  const [applying, setApplying] = useState(false);

  const applied = appliedCoupon?.code === coupon.code;
  const shortBy = coupon.minOrderValue - cartSubtotal;
  const endingSoon = daysLeft(coupon.expiryDate) <= SOON_DAYS;

  const terms = [
    coupon.minOrderValue > 0 && `On orders of ${formatPrice(coupon.minOrderValue)} or more`,
    coupon.maxDiscount && coupon.discountType === "percentage" && `Up to ${formatPrice(coupon.maxDiscount)} off`,
  ].filter(Boolean);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(coupon.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(`Couldn't copy it. The code is ${coupon.code}.`);
    }
  };

  const apply = async () => {
    setApplying(true);
    await applyCouponCode(coupon.code);
    setApplying(false);
  };

  return (
    <article className="rounded-[20px] border border-brand-border bg-white">
      <div className="p-5 sm:p-6">
        <div className="flex items-baseline justify-between gap-4">
          <p className="text-[28px] font-semibold leading-none tracking-[-0.03em]">{couponValue(coupon)}</p>
          <p className={`shrink-0 text-[14px] ${endingSoon ? "font-medium text-brand-saffron" : "text-brand-muted"}`}>
            {endsLabel(coupon.expiryDate)}
          </p>
        </div>
        {coupon.description && <p className="mt-2 text-[15px]">{coupon.description}</p>}
        {terms.length > 0 && <p className="mt-1 text-[14px] text-brand-muted">{terms.join(" · ")}</p>}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-dotted border-[#D3CEC3] px-5 py-3.5 sm:px-6">
        <button
          type="button"
          onClick={copy}
          aria-label={`Copy code ${coupon.code}`}
          className="inline-flex items-center gap-2 text-[15px] font-medium tracking-[0.04em] transition-colors hover:text-brand-green"
        >
          {coupon.code}
          {copied ? <Check className="h-4 w-4 text-brand-green" /> : <Copy className="h-4 w-4 text-brand-muted" />}
          <span aria-live="polite" className="text-[13px] font-normal tracking-normal text-brand-muted">
            {copied ? "Copied" : ""}
          </span>
        </button>

        {applied ? (
          <Link href="/checkout" className="link-rule inline-flex items-center gap-1 text-[14px]">
            Applied. Go to checkout
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        ) : cart.length > 0 && shortBy > 0 ? (
          <p className="text-[14px] text-brand-muted">Add {formatPrice(shortBy)} more to use this</p>
        ) : cart.length > 0 ? (
          <button
            type="button"
            onClick={apply}
            disabled={applying}
            className="h-10 rounded-xl bg-brand-dark px-4 text-[14px] font-medium text-white transition-colors hover:bg-black disabled:opacity-60"
          >
            Apply to bag
          </button>
        ) : null}
      </div>
    </article>
  );
}
