"use client";

import React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  ShieldCheck,
  Leaf,
  Sparkles,
  Truck,
  ArrowRight,
  Heart,
  Award,
} from "lucide-react";
import { CATEGORIES } from "@/data/mockData";

const newsletterSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type NewsletterForm = z.infer<typeof newsletterSchema>;

export default function Footer() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NewsletterForm>({
    resolver: zodResolver(newsletterSchema),
  });

  const onSubmit = async (data: NewsletterForm) => {
    await new Promise((res) => setTimeout(res, 500));
    toast.success("Welcome to the NutriNation family!", {
      description: "You will receive harvest updates and private subscriber discounts in your inbox.",
    });
    reset();
  };

  const coreCategories = CATEGORIES.filter(
    (c) => c.slug !== "combos" && c.slug !== "gift-boxes"
  );

  return (
    <footer className="bg-brand-dark text-white pt-16 pb-12 border-t border-brand-dark-light relative overflow-hidden">
      {/* Subtle Background Glow Accents */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-green/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-brand-saffron/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Trust Badges Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-14 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-green/20 text-brand-green-light flex items-center justify-center flex-shrink-0">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">100% Natural Harvest</h4>
              <p className="text-xs text-brand-muted">Zero artificial additives</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-saffron/20 text-brand-saffron flex items-center justify-center flex-shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Top 1% Grade Selection</h4>
              <p className="text-xs text-brand-muted">Authentic W-180 & Mamra</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-orange/20 text-brand-orange flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Nitrogen Fresh Seal</h4>
              <p className="text-xs text-brand-muted">Seals crunch and aroma</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-green/20 text-brand-green-light flex items-center justify-center flex-shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Express Delivery</h4>
              <p className="text-xs text-brand-muted">Insured doorstep transit</p>
            </div>
          </div>
        </div>

        {/* Main Footer Links & Newsletter */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 py-12 border-b border-white/10">
          {/* Brand Intro & Newsletter */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-brand-green flex items-center justify-center text-white">
                <span className="font-serif font-black text-lg text-brand-saffron">N</span>
              </div>
              <span className="font-serif font-bold text-xl tracking-wider text-white">
                NUTRI<span className="text-brand-green-light">NATION</span>
              </span>
            </div>

            <p className="text-sm text-white/70 leading-relaxed max-w-sm">
              We curate the purest dry fruits from the highest orchards of Kashmir, Mangalore, Jordan, and Malatya. Selected for taste, packed for wellness.
            </p>

            {/* Newsletter Input Form */}
            <div className="pt-2">
              <h5 className="text-xs uppercase font-bold tracking-widest text-brand-saffron mb-2">
                FRESHNESS IN YOUR INBOX
              </h5>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
                <div className="flex gap-2 max-w-md">
                  <input
                    {...register("email")}
                    type="email"
                    placeholder="Enter your email address..."
                    className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-brand-green transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-brand-green hover:bg-brand-green-dark text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1 flex-shrink-0"
                  >
                    <span>Subscribe</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                {errors.email && (
                  <p className="text-xs text-red-400">{errors.email.message}</p>
                )}
              </form>
            </div>
          </div>

          {/* Column 1: 9 Core Harvest Categories */}
          <div>
            <h4 className="text-xs uppercase font-bold tracking-widest text-brand-saffron mb-4">
              9 CORE HARVESTS
            </h4>
            <ul className="space-y-2 text-sm text-white/70">
              {coreCategories.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/category/${c.slug}`}
                    className="hover:text-brand-green-light transition-colors"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Combos & Curations */}
          <div>
            <h4 className="text-xs uppercase font-bold tracking-widest text-brand-saffron mb-4">
              CURATIONS & GIFTS
            </h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li>
                <Link href="/category/combos" className="hover:text-brand-green-light transition-colors">
                  Daily Wellness Boxes
                </Link>
              </li>
              <li>
                <Link href="/category/gift-boxes" className="hover:text-brand-green-light transition-colors">
                  Festive Gift Hampers
                </Link>
              </li>
              <li>
                <Link href="/products?filter=bestseller" className="hover:text-brand-green-light transition-colors">
                  The NutriNation Bestsellers
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-brand-green-light transition-colors">
                  View Full Catalog
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Care & Info */}
          <div>
            <h4 className="text-xs uppercase font-bold tracking-widest text-brand-saffron mb-4">
              CUSTOMER CARE
            </h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li>
                <Link href="/contact" className="hover:text-brand-green-light transition-colors">
                  Contact Support
                </Link>
              </li>
              <li>
                <Link href="/account/orders" className="hover:text-brand-green-light transition-colors">
                  Track Live Orders
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-brand-green-light transition-colors">
                  My Account
                </Link>
              </li>
              <li>
                <Link href="/account/wishlist" className="hover:text-brand-green-light transition-colors">
                  Saved Wishlist
                </Link>
              </li>
              <li>
                <Link href="/contact#faqs" className="hover:text-brand-green-light transition-colors">
                  Harvest FAQs
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Large Grand Editorial Typography */}
        <div className="py-10 text-center">
          <h2 className="font-serif font-black text-4xl sm:text-6xl md:text-8xl tracking-tight text-white/10 select-none hover:text-white/20 transition-colors">
            NOURISH NATURALLY.
          </h2>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-white/50 pt-4 border-t border-white/10 gap-4">
          <p>© {new Date().getFullYear()} NutriNation Foods Pvt. Ltd. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/contact" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/contact" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link href="/contact" className="hover:text-white transition-colors">
              FSSAI Lic. #10020021004829
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
