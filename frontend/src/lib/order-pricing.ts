import { CartItem, Coupon, CouponRedemption, CouponWallet, Product } from "@/types";

/** Thrown when a cart no longer matches the catalogue. */
export class PricingError extends Error {}

/** Today in India, where the store trades: a coupon lasts to the end of its expiry date there. */
export const todayInStore = () => new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

const EXPIRED_SHOWN_FOR_DAYS = 30;

export const isCouponExpired = (coupon: Coupon) => coupon.expiryDate < todayInStore();

const isCouponExhausted = (coupon: Coupon) =>
  coupon.usageLimit !== undefined && coupon.usageCount >= coupon.usageLimit;

/** A real calendar date, today or later. */
export function isValidExpiry(date: unknown): date is string {
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const parsed = new Date(`${date}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().startsWith(date) && date >= todayInStore();
}

export const formatCouponDate = (date: string) =>
  new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });

/** Why a coupon can't be used on this order, or null when it can. */
export function getCouponProblem(coupon: Coupon | undefined, subtotal: number, alreadyUsed = false): string | null {
  if (!coupon || coupon.status === "disabled") return "That coupon code isn't valid.";
  if (alreadyUsed) return "You have already used this coupon on this account.";
  if (coupon.status === "expired" || isCouponExpired(coupon)) {
    return `This coupon expired on ${formatCouponDate(coupon.expiryDate)}.`;
  }
  if (isCouponExhausted(coupon)) return "This coupon has reached its limit.";
  if (subtotal < coupon.minOrderValue) {
    return `Add items worth ₹${coupon.minOrderValue - subtotal} more to apply code ${coupon.code}.`;
  }
  return null;
}

export function getCouponDiscount(coupon: Coupon, subtotal: number): number {
  const discount =
    coupon.discountType === "percentage" ? Math.round((subtotal * coupon.discountValue) / 100) : coupon.discountValue;
  const capped = coupon.maxDiscount ? Math.min(discount, coupon.maxDiscount) : discount;
  return Math.min(capped, subtotal);
}

/** Sorts every coupon into what this account can still use, has used, or just missed. */
export function buildCouponWallet(coupons: Coupon[], redemptions: CouponRedemption[]): CouponWallet {
  const usedCodes = new Set(redemptions.map((redemption) => redemption.couponCode));
  const oldestExpiryShown = new Date(Date.now() - EXPIRED_SHOWN_FOR_DAYS * 86_400_000).toISOString().split("T")[0];

  const unused = coupons.filter((coupon) => !usedCodes.has(coupon.code) && coupon.status !== "disabled");
  const lapsed = (coupon: Coupon) => coupon.status === "expired" || isCouponExpired(coupon);

  return {
    available: unused
      .filter((coupon) => !lapsed(coupon) && !isCouponExhausted(coupon))
      .sort((a, b) => a.expiryDate.localeCompare(b.expiryDate)),
    used: redemptions.map((redemption) => ({
      ...redemption,
      description: coupons.find((coupon) => coupon.code === redemption.couponCode)?.description ?? "",
    })),
    expired: unused
      .filter((coupon) => lapsed(coupon) && coupon.expiryDate >= oldestExpiryShown)
      .sort((a, b) => b.expiryDate.localeCompare(a.expiryDate)),
  };
}

/** Rebuilds the cart from catalogue data, keeping only what the customer chose. */
export function priceCart(cart: CartItem[], products: Product[]): { items: CartItem[]; subtotal: number } {
  const items = cart.map(({ productId, variantId, quantity, image, category, name }) => {
    const product = products.find((candidate) => candidate.id === productId);
    const variant = product?.variants.find((candidate) => candidate.id === variantId);
    if (!product || !variant) {
      throw new PricingError(`${name || "An item in your bag"} is no longer available. Please remove it to continue.`);
    }
    return {
      productId,
      variantId,
      quantity,
      name: product.name,
      slug: product.slug,
      category: product.categoryName || category,
      weight: variant.weight,
      price: variant.price,
      mrp: variant.mrp,
      image: image || product.images[0],
      sku: variant.sku,
    };
  });
  return { items, subtotal: items.reduce((sum, item) => sum + item.price * item.quantity, 0) };
}
