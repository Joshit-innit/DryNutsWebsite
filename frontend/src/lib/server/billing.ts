import { db } from "@/lib/server/db";
import { getCouponDiscount, getCouponProblem, priceCart } from "@/lib/order-pricing";
import { DeliverySpeed, getDeliveryFee } from "@/lib/store-settings";
import { CartItem, OrderQuote, StoreSettings } from "@/types";

/**
 * The one place an order's amount is worked out. Checkout's quote and the order itself
 * both come through here, so what the customer is shown is what they are charged.
 * Prices, coupons and delivery all come from the database; the browser only says what
 * it wants. A coupon that can't be used is left off and reported in couponProblem.
 */
export async function buildBill(
  cart: CartItem[],
  options: { couponCode?: string; deliverySpeed: DeliverySpeed; userId?: string }
): Promise<OrderQuote & { settings: StoreSettings }> {
  const productIds = [...new Set(cart.map((item) => item.productId))];
  const products = await Promise.all(productIds.map((id) => db.getProductBySlug(id)));
  const { items, subtotal } = priceCart(cart, products.filter((product) => product !== undefined));

  const code = options.couponCode?.trim();
  let coupon = null;
  let couponProblem: string | null = null;
  let discount = 0;

  if (code) {
    if (!options.userId) {
      couponProblem = "Sign in to use a coupon.";
    } else {
      const found = await db.getCouponByCode(code);
      const alreadyUsed = found ? await db.hasRedeemed(found.code, options.userId) : false;
      couponProblem = getCouponProblem(found, subtotal, alreadyUsed);
      if (found && !couponProblem) {
        coupon = found;
        discount = getCouponDiscount(found, subtotal);
      }
    }
  }

  const settings = await db.getSettings();
  const deliveryFee = getDeliveryFee(subtotal, settings.freeDeliveryMin, options.deliverySpeed);

  return {
    items,
    subtotal,
    coupon,
    couponProblem,
    discount,
    deliveryFee,
    total: Math.max(0, subtotal - discount + deliveryFee),
    settings,
  };
}
