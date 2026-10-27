import { REVIEWS } from "@/data/mockData";
import { Review } from "@/types";

let currentReviews = [...REVIEWS];

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
