import { Coupon, CouponWallet } from "@/types";
import { backendApi, unwrapData } from "@/lib/api/axios";

export { reviewService } from "@/services/reviews";

export const couponService = {
  async getAllCoupons(): Promise<Coupon[]> {
    try {
      const res = await backendApi.get("/coupons");
      return unwrapData<Coupon[]>(res);
    } catch {
      return [];
    }
  },

  async validateCoupon(
    code: string,
    subtotal: number
  ): Promise<{ valid: boolean; coupon?: Coupon; discount: number; message: string }> {
    try {
      const res = await backendApi.post("/coupons/validate", { code, subtotal });
      return unwrapData(res);
    } catch {
      return { valid: false, discount: 0, message: "Could not check that promo code. Please try again." };
    }
  },

  async createCoupon(newCoupon: Coupon): Promise<Coupon> {
    const res = await backendApi.post("/coupons", newCoupon);
    return unwrapData<Coupon>(res);
  },

  async updateCoupon(code: string, changes: Pick<Partial<Coupon>, "expiryDate" | "status">): Promise<Coupon> {
    const res = await backendApi.patch(`/coupons/${encodeURIComponent(code)}`, changes);
    return unwrapData<Coupon>(res);
  },

  async getMyCoupons(): Promise<CouponWallet> {
    const res = await backendApi.get("/coupons/mine");
    return unwrapData<CouponWallet>(res);
  },
};
