"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { reviewService } from "@/services/reviews";
import { productService } from "@/services/products";
import { Product, Review } from "@/types";
import { toast } from "sonner";
import { Star, Trash2, MessageSquareText, Loader2 } from "lucide-react";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([reviewService.getAllReviews(), productService.getAllProducts()]).then(([list, catalogue]) => {
      setReviews(list);
      setProducts(catalogue);
      setLoading(false);
    });
  }, []);

  const productsById = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  const handleDelete = async (id: string) => {
    if (!(await reviewService.deleteReview(id))) {
      toast.error("Could not remove that review.");
      return;
    }
    setReviews((current) => current.filter((r) => r.id !== id));
    toast.info("Review removed.");
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <span className="text-xs uppercase font-semibold tracking-[0.08em] text-brand-muted">CUSTOMER FEEDBACK</span>
        <h1 className="font-semibold tracking-[-0.035em] text-2xl sm:text-3xl text-brand-dark">
          Customer Reviews ({reviews.length})
        </h1>
        <p className="text-xs text-brand-muted mt-0.5">
          Reviews customers send from product pages. They are private to your team and not shown on the storefront.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-16 text-sm text-brand-muted">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading reviews…
        </div>
      ) : reviews.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-brand-border bg-white px-6 py-16 text-center">
          <MessageSquareText className="h-8 w-8 text-brand-green" />
          <p className="text-sm font-semibold text-brand-dark">No reviews yet</p>
          <p className="max-w-sm text-xs text-brand-muted">
            When signed-in customers write a review on a product page, it will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((rev) => {
            const product = productsById.get(rev.productId);
            return (
              <div
                key={rev.id}
                className="bg-white rounded-3xl border border-brand-border p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <div className="flex" aria-label={`${rev.rating} out of 5 stars`}>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i <= rev.rating ? "fill-brand-saffron text-brand-saffron" : "text-brand-border-dark"}`} />
                      ))}
                    </div>
                    <span className="font-bold text-xs text-brand-dark">{rev.customerName}</span>
                    <span className="text-[11px] text-brand-muted">{rev.date}</span>
                    {product && (
                      <Link href={`/products/${product.slug}`} target="_blank" className="text-[11px] font-semibold text-brand-green hover:underline">
                        {product.name}
                      </Link>
                    )}
                  </div>
                  {rev.title && <h4 className="font-semibold tracking-[-0.025em] text-sm text-brand-dark">{rev.title}</h4>}
                  <p className="text-xs text-brand-muted leading-relaxed max-w-3xl whitespace-pre-line">{rev.comment}</p>
                </div>

                <button
                  onClick={() => handleDelete(rev.id)}
                  className="self-end md:self-center p-2 rounded-xl text-brand-muted hover:text-red-500 hover:bg-red-50 transition-colors"
                  title="Delete review"
                  aria-label={`Delete review by ${rev.customerName}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
