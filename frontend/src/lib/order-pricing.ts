import { CartItem, Coupon, Product } from "@/types";

/** Thrown when a cart no longer matches the catalogue. */
export class PricingError extends Error {}

const today = () => new Date().toISOString().split("T")[0];

/** Why a coupon can't be used on this order, or null when it can. */
export function getCouponProblem(coupon: Coupon | undefined, subtotal: number): string | null {
  const exhausted = coupon?.usageLimit !== undefined && coupon.usageCount >= coupon.usageLimit;
  if (!coupon || coupon.status !== "active" || coupon.expiryDate < today() || exhausted) {
    return "Invalid or expired promo code.";
  }
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

/** Rebuilds the cart from catalogue data, keeping only what the customer chose. */
export function priceCart(cart: CartItem[], products: Product[]): { items: CartItem[]; subtotal: number } {
  const items = cart.map(({ productId, variantId, quantity, image, category }) => {
    const product = products.find((candidate) => candidate.id === productId);
    const variant = product?.variants.find((candidate) => candidate.id === variantId);
    if (!product || !variant) {
      throw new PricingError("An item in your cart is no longer available.");
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
