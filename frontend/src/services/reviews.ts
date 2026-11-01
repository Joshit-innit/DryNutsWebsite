import { Review } from "@/types";
import { backendApi, unwrapData } from "@/lib/api/axios";

export const reviewService = {
  async getAllReviews(): Promise<Review[]> {
    try {
      const res = await backendApi.get("/reviews");
      return unwrapData<Review[]>(res);
    } catch {
      return [];
    }
  },

  async deleteReview(id: string): Promise<boolean> {
    try {
      await backendApi.delete(`/reviews/${encodeURIComponent(id)}`);
      return true;
    } catch {
      return false;
    }
  },

  async getReviewsForProduct(productId: string): Promise<Review[]> {
    try {
      const res = await backendApi.get(`/reviews?productId=${encodeURIComponent(productId)}`);
      return unwrapData<Review[]>(res);
    } catch {
      return [];
    }
  },

  async addReview(review: Omit<Review, "id" | "date" | "likes">): Promise<Review> {
    const res = await backendApi.post("/reviews", review);
    return unwrapData<Review>(res);
  },
};
