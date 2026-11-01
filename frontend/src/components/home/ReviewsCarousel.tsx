"use client";

/**
 * Adapted from the Watermelon UI "testimonials-1" block (ui.watermelon.sh/block/testimonials-1).
 * Uses a native scroll-snap track instead of shadcn's Embla carousel, so no new dependencies.
 */
import React from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BadgeCheck, Star } from "lucide-react";
import { Review, Product } from "@/types";
import { cn } from "@/lib/utils";

function initials(name: string) {
  return name
    .replace(/^(Dr|Mr|Mrs|Ms)\.?\s+/i, "")
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
}

export default function ReviewsCarousel({ reviews, products }: { reviews: Review[]; products: Product[] }) {
  const trackRef = React.useRef<HTMLDivElement>(null);
  const [edges, setEdges] = React.useState({ start: true, end: false });

  const updateEdges = React.useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setEdges({
      start: el.scrollLeft <= 4,
      end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4,
    });
  }, []);

  React.useEffect(() => {
    updateEdges();
    window.addEventListener("resize", updateEdges);
    return () => window.removeEventListener("resize", updateEdges);
  }, [updateEdges]);

  const scrollBy = (direction: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-review-card]");
    const step = card ? card.offsetWidth + 16 : el.clientWidth * 0.8;
    el.scrollBy({ left: step * direction, behavior: "smooth" });
  };

  const productFor = (id: string) => products.find((p) => p.id === id);
  const average = reviews.reduce((sum, r) => sum + r.rating, 0) / Math.max(reviews.length, 1);

  return (
    <section className="border-t border-brand-border bg-[#F9F8F5]">
      <div className="mx-auto max-w-[1440px] px-4 py-24 sm:px-6 sm:py-32 lg:px-12">
        <div className="mb-12 flex flex-col items-center text-center sm:mb-16">
          <p className="section-label mb-4">From our customers</p>
          <h2 className="section-title max-w-3xl">
            Loved in kitchens
            <br />
            <span className="font-accent text-brand-green">across India.</span>
          </h2>
          <p className="mt-5 inline-flex items-center gap-2 text-[15px] text-brand-muted">
            <span className="inline-flex text-brand-gold">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-current" />
              ))}
            </span>
            <span>
              <span className="font-semibold text-brand-dark">{average.toFixed(1)}</span> average from verified buyers
            </span>
          </p>
        </div>

        <div
          ref={trackRef}
          onScroll={updateEdges}
          className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 py-2 sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:mx-0 lg:scroll-px-0 lg:px-0"
          aria-label="Customer reviews"
        >
          {reviews.map((review) => {
            const product = productFor(review.productId);
            return (
              <article
                key={review.id}
                data-review-card
                className="flex min-h-[340px] w-[86%] shrink-0 snap-start flex-col justify-between rounded-3xl border border-brand-border bg-white p-6 sm:w-[calc(50%-8px)] sm:p-8 lg:w-[calc(33.333%-11px)]"
              >
                <div>
                  <div className="mb-5 flex text-brand-gold" aria-label={`${review.rating} out of 5 stars`}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={cn("h-4 w-4", i < review.rating ? "fill-current" : "text-brand-border-dark")} />
                    ))}
                  </div>
                  <h3 className="mb-3 text-[22px] font-semibold leading-[1.15] tracking-[-0.035em]">
                    &ldquo;{review.title}&rdquo;
                  </h3>
                  <p className="mb-8 text-[15px] leading-relaxed text-brand-muted">{review.comment}</p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand-beige text-sm font-semibold text-brand-dark">
                    {initials(review.customerName)}
                  </span>
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 font-medium text-brand-dark">
                      {review.customerName}
                      {review.verifiedPurchase && <BadgeCheck className="h-4 w-4 text-brand-green" aria-label="Verified purchase" />}
                    </p>
                    <p className="mt-0.5 truncate text-sm text-brand-muted">
                      {review.location}
                      {product && (
                        <>
                          {" · "}
                          <Link href={`/products/${product.slug}`} className="link-rule text-brand-green">
                            {product.categoryName}
                          </Link>
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-10 flex justify-center gap-2">
          {([-1, 1] as const).map((dir) => (
            <button
              key={dir}
              type="button"
              onClick={() => scrollBy(dir)}
              disabled={dir === -1 ? edges.start : edges.end}
              aria-label={dir === -1 ? "Previous reviews" : "Next reviews"}
              className="grid h-11 w-11 place-items-center rounded-xl border border-brand-border-dark bg-white text-brand-dark transition-colors hover:border-brand-dark hover:bg-brand-dark hover:text-white disabled:pointer-events-none disabled:opacity-35"
            >
              {dir === -1 ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
