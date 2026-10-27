"use client";

import React, { useState } from "react";
import { REVIEWS } from "@/data/mockData";
import { Review } from "@/types";
import { toast } from "sonner";
import { Star, CheckCircle2, Trash2, Check, ShieldCheck } from "lucide-react";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>(REVIEWS);

  const handleApprove = (id: string) => {
    toast.success("Review published live to product page.");
  };

  const handleDelete = (id: string) => {
    setReviews(reviews.filter((r) => r.id !== id));
    toast.info("Review removed.");
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <span className="text-xs uppercase font-semibold tracking-[0.08em] text-brand-muted">
          QUALITY ASSURANCE & FEEDBACK
        </span>
        <h1 className="font-semibold tracking-[-0.035em] text-2xl sm:text-3xl text-brand-dark">
          Customer Review Moderation
        </h1>
        <p className="text-xs text-brand-muted mt-0.5">
          Approve, audit, and moderate buyer ratings on harvest freshness and taste.
        </p>
      </div>

      <div className="space-y-4">
        {reviews.map((rev) => (
          <div
            key={rev.id}
            className="bg-white rounded-3xl border border-brand-border p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
          >
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-3">
                <div className="flex text-brand-saffron">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-brand-saffron" />
                  ))}
                </div>
                <span className="font-bold text-xs text-brand-dark">{rev.customerName}</span>
                <span className="text-[10px] text-brand-muted">({rev.location})</span>
                <span className="text-[10px] bg-brand-green/10 text-brand-green font-bold px-2 py-0.5 rounded-full">
                  Verified Purchase
                </span>
              </div>

              <h4 className="font-semibold tracking-[-0.025em] text-sm text-brand-dark">&ldquo;{rev.title}&rdquo;</h4>
              <p className="text-xs text-brand-muted leading-relaxed max-w-3xl">{rev.comment}</p>
            </div>

            <div className="flex items-center gap-2 self-end md:self-center">
              <button
                onClick={() => handleApprove(rev.id)}
                className="bg-brand-dark hover:bg-black text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Approved Live</span>
              </button>
              <button
                onClick={() => handleDelete(rev.id)}
                className="p-2 rounded-xl text-brand-muted hover:text-red-500 hover:bg-red-50 transition-colors"
                title="Delete Review"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
