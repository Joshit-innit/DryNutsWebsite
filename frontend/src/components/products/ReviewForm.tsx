"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, PenLine, Star } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/context/StoreContext";
import { reviewService } from "@/services/reviews";
import { apiErrorMessage } from "@/lib/auth-session";

const RATING_LABELS = ["", "Not for me", "Could be better", "Good", "Very good", "Excellent"];

/**
 * Lets signed-in customers send a review. Reviews go to the admin team and are
 * not displayed on the storefront.
 */
export default function ReviewForm({ productId, productName, slug }: { productId: string; productName: string; slug: string }) {
  const { user } = useStore();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!rating) {
      toast.error("Choose a star rating.");
      return;
    }
    if (!comment.trim()) {
      toast.error("Please write a few words about the product.");
      return;
    }
    setSending(true);
    try {
      await reviewService.addReview({ productId, rating, title: title.trim(), comment: comment.trim() });
      setSent(true);
    } catch (error) {
      toast.error(apiErrorMessage(error, "Could not send your review. Please try again."));
    } finally {
      setSending(false);
    }
  };

  const shown = hover || rating;

  return (
    <section className="border-t border-brand-border py-12 sm:py-16" aria-labelledby="review-heading">
      <div className="max-w-2xl">
        <p className="eyebrow mb-3 text-brand-green">Your feedback</p>
        <h2 id="review-heading" className="text-3xl">Tried the {productName.replace(/\s*\(.*?\)\s*/g, " ").trim()}?</h2>
        <p className="mt-3 text-sm leading-relaxed text-brand-muted">
          Tell us what you thought. Your review goes straight to our team and helps us choose what to harvest next.
        </p>

        {sent ? (
          <div className="mt-6 flex items-start gap-3 rounded-2xl bg-brand-green/10 p-5 text-sm text-brand-dark" role="status">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-green" />
            <div>
              <p className="font-semibold">Thank you, {user?.name.split(" ")[0] || "friend"}.</p>
              <p className="mt-1 text-brand-muted">Your review has been sent to our team.</p>
            </div>
          </div>
        ) : !user ? (
          <Link
            href={`/login?next=${encodeURIComponent(`/products/${slug}`)}`}
            className="mt-6 inline-flex items-center gap-2 rounded-xl border border-brand-border-dark bg-white px-5 py-3 text-sm font-medium text-brand-dark transition-colors hover:border-brand-dark hover:bg-brand-dark hover:text-white"
          >
            <PenLine className="h-4 w-4" /> Sign in to write a review
          </Link>
        ) : !open ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-dark px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-black"
          >
            <PenLine className="h-4 w-4" /> Write a review
          </button>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-5 rounded-2xl border border-brand-border bg-white p-5 sm:p-6">
            <fieldset>
              <legend className="mb-2 text-sm font-semibold text-brand-dark">Your rating</legend>
              <div className="flex items-center gap-3">
                <div className="flex" onMouseLeave={() => setHover(0)}>
                  {[1, 2, 3, 4, 5].map((value) => (
                    <label key={value} className="cursor-pointer p-0.5" onMouseEnter={() => setHover(value)}>
                      <input
                        type="radio"
                        name="rating"
                        value={value}
                        checked={rating === value}
                        onChange={() => setRating(value)}
                        className="peer sr-only"
                        aria-label={`${value} star${value > 1 ? "s" : ""}`}
                      />
                      <Star
                        className={`h-7 w-7 rounded transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-brand-green ${
                          value <= shown ? "fill-brand-saffron text-brand-saffron" : "text-brand-border-dark"
                        }`}
                      />
                    </label>
                  ))}
                </div>
                <span className="text-sm text-brand-muted" aria-live="polite">{RATING_LABELS[shown]}</span>
              </div>
            </fieldset>

            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-brand-dark">Headline <span className="font-normal text-brand-muted">(optional)</span></span>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={200}
                placeholder="Sum it up in a few words"
                className="w-full rounded-xl border border-brand-border bg-brand-cream px-3.5 py-2.5 text-sm outline-none focus:border-brand-green"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-brand-dark">Your review</span>
              <textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                maxLength={4000}
                rows={5}
                required
                placeholder="Taste, freshness, packaging… anything that would help us."
                className="w-full resize-y rounded-xl border border-brand-border bg-brand-cream px-3.5 py-2.5 text-sm outline-none focus:border-brand-green"
              />
              <span className="mt-1 block text-right text-xs text-brand-muted">{comment.length}/4000</span>
            </label>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-brand-muted">Posting as {user.name}</p>
              <div className="flex gap-2">
                <button type="button" onClick={() => setOpen(false)} className="rounded-xl px-4 py-2.5 text-sm font-medium text-brand-muted hover:text-brand-dark">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  className="inline-flex items-center gap-2 rounded-xl bg-brand-green px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-green-dark disabled:opacity-60"
                >
                  {sending && <Loader2 className="h-4 w-4 animate-spin" />} Send review
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
