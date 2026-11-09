"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, ArrowRight, Download, Loader2 } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { orderService } from "@/services/orders";
import { apiErrorMessage } from "@/lib/auth-session";
import { downloadInvoice } from "@/lib/order-documents";
import { DeliverySpeed, getDeliveryFee, getIncludedGst, ONLINE_PAYMENTS_ENABLED } from "@/lib/store-settings";
import { formatPrice } from "@/lib/utils";
import { CouponField } from "@/components/cart/CouponField";
import { FloatingInput } from "@/components/watermelon/floating-input";
import { SelectionCard } from "@/components/watermelon/selection-card";
import { Order } from "@/types";

const addressSchema = z.object({
  name: z.string().trim().min(2, "Enter the recipient's full name"),
  phone: z.string().trim().regex(/^[6-9]\d{9}$/, "Enter a 10-digit mobile number"),
  street: z.string().trim().min(5, "Enter the house number and street"),
  landmark: z.string().trim().optional(),
  city: z.string().trim().min(2, "Enter the city"),
  state: z.string().trim().min(2, "Enter the state"),
  pincode: z.string().trim().regex(/^[1-9][0-9]{5}$/, "Enter a 6-digit PIN code"),
});

type AddressValues = z.infer<typeof addressSchema>;
type PaymentMethod = Order["paymentMethod"];

const ONLINE_METHODS: { id: PaymentMethod; title: string }[] = [
  { id: "UPI", title: "UPI" },
  { id: "Card", title: "Credit or debit card" },
  { id: "NetBanking", title: "Net banking" },
];

const formatDate = (isoDate: string) =>
  new Date(isoDate).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });

export default function CheckoutPage() {
  const {
    cart,
    cartSubtotal,
    cartDiscount,
    appliedCoupon,
    applyQuote,
    storeSettings,
    refreshStoreSettings,
    clearCart,
    user,
  } = useStore();
  const [deliverySpeed, setDeliverySpeed] = useState<DeliverySpeed>("standard");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");
  const [orderError, setOrderError] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AddressValues>({ resolver: zodResolver(addressSchema), mode: "onTouched" });

  // The session loads after the first render, and the customer may have started typing.
  useEffect(() => {
    if (user && !getValues("name")) setValue("name", user.name);
  }, [user, getValues, setValue]);

  const standardFee = getDeliveryFee(cartSubtotal, storeSettings.freeDeliveryMin, "standard");
  const expressFee = getDeliveryFee(cartSubtotal, storeSettings.freeDeliveryMin, "express");
  const deliveryFee = deliverySpeed === "express" ? expressFee : standardFee;
  const total = Math.max(0, cartSubtotal - cartDiscount + deliveryFee);

  const couponCode = appliedCoupon?.code;
  const cartLines = cart.map((item) => `${item.productId}:${item.variantId}:${item.quantity}`).join();

  // Saved bags can outlive a price change or a coupon, so the server has the last word
  // on the bill before the customer commits to it.
  const checkBill = useCallback(
    async (isCurrent: () => boolean = () => true) => {
      if (cart.length === 0) return;
      try {
        const quote = await orderService.getQuote({ items: cart, couponCode, deliverySpeed });
        if (!isCurrent()) return;
        applyQuote(quote);
        if (quote.couponProblem) {
          setOrderError(`Coupon ${couponCode} was removed. ${quote.couponProblem}`);
        } else if (quote.subtotal !== cartSubtotal) {
          setOrderError("Some prices have changed since you added them. Your total is up to date.");
        }
      } catch (error) {
        if (isCurrent()) setOrderError(apiErrorMessage(error, "We couldn't check your total. Please try again."));
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- cartLines stands in for the cart; applyQuote isn't stable.
    [cartLines, couponCode, cartSubtotal, deliverySpeed]
  );

  useEffect(() => {
    let current = true;
    checkBill(() => current);
    return () => {
      current = false;
    };
  }, [checkBill]);

  const placeOrder = async (address: AddressValues) => {
    setOrderError(null);
    try {
      const order = await orderService.createOrder({
        items: cart,
        couponCode: appliedCoupon?.code,
        deliverySpeed,
        total,
        paymentMethod,
        shippingAddress: {
          ...address,
          id: `addr-${Date.now()}`,
          phone: `+91 ${address.phone}`,
          type: "home",
        },
      });
      setConfirmedOrder(order);
      clearCart();
      window.scrollTo({ top: 0 });
    } catch (error) {
      setOrderError(apiErrorMessage(error, "We couldn't place your order. Please try again."));
      await refreshStoreSettings();
      await checkBill();
    }
  };

  if (confirmedOrder) {
    return <Confirmation order={confirmedOrder} onInvoice={() => downloadInvoice(confirmedOrder, storeSettings)} />;
  }

  if (cart.length === 0) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
        <h1 className="text-4xl tracking-[-0.04em]">Your bag is empty.</h1>
        <p className="mt-3 text-[15px] text-brand-muted">Add something good, and we&apos;ll be ready when you are.</p>
        <Link
          href="/products"
          className="mt-7 flex h-12 items-center gap-2 rounded-xl bg-brand-dark px-6 text-[15px] font-medium text-white transition-colors hover:bg-black"
        >
          Browse the shop
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(placeOrder)}
      noValidate
      className="mx-auto grid max-w-6xl grid-cols-1 gap-x-16 gap-y-10 px-4 pb-16 pt-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_400px] lg:px-8 lg:pt-12"
    >
      <div className="min-w-0">
        <Link href="/cart" className="inline-flex items-center gap-1.5 text-[14px] text-brand-muted transition-colors hover:text-brand-dark">
          <ArrowLeft className="h-4 w-4" />
          Back to bag
        </Link>
        <h1 className="mt-4 text-[clamp(2.5rem,5vw,3.5rem)] tracking-[-0.04em]">Checkout</h1>
        <p className="mt-3 text-[15px] text-brand-muted">
          {user ? (
            <>Ordering as {user.email}</>
          ) : (
            <>
              Checking out as a guest.{" "}
              <Link href="/login?next=/checkout" className="link-rule text-brand-dark">
                Sign in
              </Link>{" "}
              to keep this order in your account.
            </>
          )}
        </p>

        <Section title="Delivery address">
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <FloatingInput id="name" label="Full name" autoComplete="name" error={errors.name?.message} {...register("name")} />
            <FloatingInput
              id="phone"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              label="Mobile number"
              autoComplete="tel-national"
              error={errors.phone?.message}
              {...register("phone")}
            />
            <div className="sm:col-span-2">
              <FloatingInput id="street" label="House number and street" autoComplete="street-address" error={errors.street?.message} {...register("street")} />
            </div>
            <div className="sm:col-span-2">
              <FloatingInput id="landmark" label="Landmark (optional)" {...register("landmark")} />
            </div>
            <FloatingInput id="city" label="City" autoComplete="address-level2" error={errors.city?.message} {...register("city")} />
            <FloatingInput id="state" label="State" autoComplete="address-level1" error={errors.state?.message} {...register("state")} />
            <FloatingInput
              id="pincode"
              inputMode="numeric"
              maxLength={6}
              label="PIN code"
              autoComplete="postal-code"
              error={errors.pincode?.message}
              {...register("pincode")}
            />
          </div>
        </Section>

        <Section title="Delivery">
          <div role="radiogroup" aria-label="Delivery speed" className="space-y-2.5">
            <SelectionCard
              name="delivery"
              value="standard"
              checked={deliverySpeed === "standard"}
              onSelect={() => setDeliverySpeed("standard")}
              title="Standard"
              description={`Free on orders over ${formatPrice(storeSettings.freeDeliveryMin)}`}
              aside={standardFee === 0 ? "Free" : formatPrice(standardFee)}
            />
            <SelectionCard
              name="delivery"
              value="express"
              checked={deliverySpeed === "express"}
              onSelect={() => setDeliverySpeed("express")}
              title="Express"
              description="Dispatched ahead of standard orders"
              aside={formatPrice(expressFee)}
            />
          </div>
        </Section>

        <Section title="Payment">
          <div role="radiogroup" aria-label="Payment method" className="space-y-2.5">
            <SelectionCard
              name="payment"
              value="COD"
              checked={paymentMethod === "COD"}
              onSelect={() => setPaymentMethod("COD")}
              title="Cash on delivery"
              description={`Pay ${formatPrice(total)} when your order arrives`}
            />
            {ONLINE_METHODS.map((method) => (
              <SelectionCard
                key={method.id}
                name="payment"
                value={method.id}
                checked={paymentMethod === method.id}
                disabled={!ONLINE_PAYMENTS_ENABLED}
                onSelect={() => setPaymentMethod(method.id)}
                title={method.title}
                description={ONLINE_PAYMENTS_ENABLED ? "Pay securely online" : "Not available yet"}
              />
            ))}
          </div>
        </Section>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-[20px] border border-brand-border bg-white p-6">
          <h2 className="text-[19px] tracking-[-0.03em]">Your order</h2>

          <ul className="mt-5 space-y-4">
            {cart.map((item) => (
              <li key={`${item.productId}-${item.variantId}`} className="flex items-center gap-3">
                <div className="relative h-14 w-14 shrink-0">
                  <img src={item.image} alt="" className="h-full w-full rounded-lg bg-brand-beige object-cover" />
                  {item.quantity > 1 && (
                    <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-dark px-1 text-[11px] font-medium tabular-nums text-white">
                      {item.quantity}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-medium">{item.name}</p>
                  <p className="text-[13px] text-brand-muted">{item.weight}</p>
                </div>
                <p className="text-[14px] tabular-nums">{formatPrice(item.price * item.quantity)}</p>
              </li>
            ))}
          </ul>

          <div className="mt-5 border-t border-dotted border-[#D3CEC3] pt-5">
            <CouponField />
          </div>

          <dl className="mt-5 space-y-2.5 border-t border-dotted border-[#D3CEC3] pt-5 text-[14px]">
            <Row label="Subtotal" value={formatPrice(cartSubtotal)} />
            {cartDiscount > 0 && <Row label={`Coupon ${appliedCoupon?.code}`} value={`−${formatPrice(cartDiscount)}`} accent />}
            <Row label="Delivery" value={deliveryFee === 0 ? "Free" : formatPrice(deliveryFee)} />
          </dl>

          <div className="mt-5 flex items-baseline justify-between border-t border-dotted border-[#D3CEC3] pt-5">
            <span className="text-[15px] font-medium">Total</span>
            <span className="text-[28px] font-semibold tabular-nums tracking-[-0.02em]">{formatPrice(total)}</span>
          </div>
          <p className="mt-1 text-right text-[13px] text-brand-muted">
            Includes {formatPrice(getIncludedGst(total, storeSettings.gstRate))} GST at {storeSettings.gstRate}%
          </p>

          {orderError && (
            <p role="alert" className="mt-5 rounded-xl bg-red-50 px-3.5 py-3 text-[14px] leading-snug text-red-800">
              {orderError}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-dark text-[15px] font-medium text-white transition-[background-color,transform] duration-200 hover:bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-brand-green active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSubmitting ? "Placing your order" : "Place order"}
          </button>
          <p className="mt-3 text-center text-[13px] leading-relaxed text-brand-muted">
            Free cancellation until your order ships.{" "}
            <Link href="/refund-policy" className="link-rule">
              Refund policy
            </Link>
          </p>
        </div>
      </aside>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10 border-t border-brand-border pt-7">
      <h2 className="mb-5 text-[19px] tracking-[-0.03em]">{title}</h2>
      {children}
    </section>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className={accent ? "text-brand-green" : "text-brand-muted"}>{label}</dt>
      <dd className={accent ? "tabular-nums text-brand-green" : "tabular-nums"}>{value}</dd>
    </div>
  );
}

function Confirmation({ order, onInvoice }: { order: Order; onInvoice: () => void }) {
  const firstName = order.shippingAddress.name.split(" ")[0];

  return (
    <div className="mx-auto max-w-xl px-4 pb-20 pt-12 sm:px-6 sm:pt-20">
      <h1 className="text-balance text-[clamp(2.5rem,6vw,3.75rem)] leading-[1] tracking-[-0.04em]">
        Thank you, <span className="font-accent font-normal italic tracking-[-0.02em]">{firstName}.</span>
      </h1>
      <p className="mt-4 text-[15px] leading-relaxed text-brand-muted">
        Your order is in. Keep {formatPrice(order.total)} ready in cash for delivery.
      </p>

      <dl className="mt-8 rounded-[20px] border border-brand-border bg-white p-6 text-[14px]">
        <div className="space-y-3">
          <Row label="Order number" value={order.orderNumber} />
          <Row label="Estimated delivery" value={formatDate(order.estimatedDelivery)} />
          <Row label="Delivering to" value={`${order.shippingAddress.city}, ${order.shippingAddress.pincode}`} />
          {order.discount > 0 && (
            <Row label={`Coupon ${order.couponCode}`} value={`−${formatPrice(order.discount)}`} accent />
          )}
        </div>
        <div className="mt-4 flex items-baseline justify-between border-t border-dotted border-[#D3CEC3] pt-4">
          <dt className="text-[15px] font-medium">To pay on delivery</dt>
          <dd className="text-[22px] font-semibold tabular-nums tracking-[-0.02em]">{formatPrice(order.total)}</dd>
        </div>
      </dl>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link
          href={`/account/orders/${order.id}`}
          className="flex h-12 items-center justify-center gap-2 rounded-xl sm:flex-1 bg-brand-dark text-[15px] font-medium text-white transition-colors hover:bg-black"
        >
          Track this order
          <ArrowRight className="h-4 w-4" />
        </Link>
        <button
          type="button"
          onClick={onInvoice}
          className="flex h-12 items-center justify-center gap-2 rounded-xl sm:flex-1 border border-brand-dark text-[15px] font-medium text-brand-dark transition-colors hover:bg-brand-dark hover:text-white"
        >
          <Download className="h-4 w-4" />
          Download invoice
        </button>
      </div>
    </div>
  );
}
