import { COUPONS, REVIEWS } from "@/data/mockData";
import { Coupon, Review } from "@/types";

let currentCoupons = [...COUPONS];
let currentReviews = [...REVIEWS];

export const couponService = {
  async getAllCoupons(): Promise<Coupon[]> {
    await new Promise((res) => setTimeout(res, 20));
    return [...currentCoupons];
  },

  async validateCoupon(code: string, subtotal: number): Promise<{ valid: boolean; coupon?: Coupon; discount: number; message: string }> {
    await new Promise((res) => setTimeout(res, 30));
    const coupon = currentCoupons.find((c) => c.code.toUpperCase() === code.toUpperCase().trim() && c.status === "active");

    if (!coupon) {
      return { valid: false, discount: 0, message: "Invalid or expired promo code." };
    }

    if (subtotal < coupon.minOrderValue) {
      return {
        valid: false,
        discount: 0,
        message: `Add items worth ₹${coupon.minOrderValue - subtotal} more to apply code ${coupon.code}.`,
      };
    }

    let discount = 0;
    if (coupon.discountType === "percentage") {
      discount = Math.round((subtotal * coupon.discountValue) / 100);
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = coupon.discountValue;
    }

    return {
      valid: true,
      coupon,
      discount,
      message: `Coupon ${coupon.code} applied successfully! You saved ₹${discount}.`,
    };
  },

  async createCoupon(newCoupon: Coupon): Promise<Coupon> {
    await new Promise((res) => setTimeout(res, 30));
    currentCoupons = [newCoupon, ...currentCoupons];
    return newCoupon;
  },
};

export const reviewService = {
  async getReviewsForProduct(productId: string): Promise<Review[]> {
    await new Promise((res) => setTimeout(res, 20));
    return currentReviews.filter((r) => r.productId === productId);
  },

  async addReview(review: Omit<Review, "id" | "date" | "likes">): Promise<Review> {
    await new Promise((res) => setTimeout(res, 40));
    const created: Review = {
      ...review,
      id: `rev-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      likes: 0,
    };
    currentReviews = [created, ...currentReviews];
    return created;
  },
};
