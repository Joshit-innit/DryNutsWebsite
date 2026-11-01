import { Review } from "@/types";
import { backendApi, unwrapData } from "@/lib/api/axios";

export const reviewService = {
  /** Admin only: reviews are moderated, not shown on the storefront. */
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

  async addReview(review: { productId: string; rating: number; title: string; comment: string }): Promise<Review> {
    const res = await backendApi.post("/reviews", review);
    return unwrapData<Review>(res);
  },
};
