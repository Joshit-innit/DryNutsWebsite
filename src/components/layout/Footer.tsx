"use client";

import React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { ShieldCheck, Leaf, Truck, ArrowRight, Award } from "lucide-react";
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

  const onSubmit = async () => {
    await new Promise((res) => setTimeout(res, 500));
    toast.success("Welcome to the NutriNation family!", {
      description: "Harvest notes and private drops, never spam.",
    });
    reset();
  };

  const coreCategories = CATEGORIES.filter(
    (c) => c.slug !== "combos" && c.slug !== "gift-boxes"
  );

  return (
    <footer className="bg-brand-dark text-[#F7F1E8] pt-16 pb-10 relative overflow-hidden">
      <div className="absolute -top-24 right-0 w-80 h-80 bg-brand-saffron/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-12 border-b border-white/10">
          {[
            { icon: Leaf, title: "100% natural", body: "No oils, dyes, or syrups" },
            { icon: Award, title: "Top 1% grade", body: "W-180 & Mamra lots" },
            { icon: ShieldCheck, title: "Nitrogen sealed", body: "Crunch locked in" },
            { icon: Truck, title: "Express India", body: "Insured doorstep" },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex items-start gap-3">
              <Icon className="w-5 h-5 text-brand-saffron shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium">{title}</h4>
                <p className="text-xs text-white/45 mt-0.5">{body}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 py-14 border-b border-white/10">
          <div className="lg:col-span-2 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/10 border border-white/10 flex items-center justify-center">
                <span className="font-display text-sm font-bold text-brand-saffron">N</span>
              </div>
              <span className="font-display text-lg font-bold tracking-[0.1em] uppercase text-white">NutriNation</span>
            </div>
            <p className="text-sm text-white/55 leading-relaxed max-w-sm font-light">
              Dry fruit from the highest orchards of Kashmir, Mangalore, Jordan, and Malatya — packed
              for taste, not for bulk.
            </p>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-2 max-w-md">
              <p className="text-[11px] tracking-[0.22em] uppercase text-brand-saffron">Notes in your inbox</p>
              <div className="flex gap-2">
                <input
                  {...register("email")}
                  type="email"
                  placeholder="Email address"
                  className="flex-1 bg-white/8 border border-white/15 rounded-full px-4 py-2.5 text-sm text-white placeholder:text-white/35 focus:border-brand-saffron"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-full bg-brand-saffron text-brand-dark px-5 py-2.5 text-sm font-medium hover:bg-[#d4b688] transition-colors"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
            </form>
          </div>

          <div>
            <h4 className="text-[11px] tracking-[0.22em] uppercase text-brand-saffron mb-4">Harvests</h4>
            <ul className="space-y-2 text-sm text-white/55">
              {coreCategories.map((c) => (
                <li key={c.id}>
                  <Link href={`/category/${c.slug}`} className="hover:text-white transition-colors">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[11px] tracking-[0.22em] uppercase text-brand-saffron mb-4">Shop</h4>
            <ul className="space-y-2 text-sm text-white/55">
              <li><Link href="/category/combos" className="hover:text-white">Wellness combos</Link></li>
              <li><Link href="/category/gift-boxes" className="hover:text-white">Gift hampers</Link></li>
              <li><Link href="/products?filter=bestseller" className="hover:text-white">Best sellers</Link></li>
              <li><Link href="/products" className="hover:text-white">Full catalog</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[11px] tracking-[0.22em] uppercase text-brand-saffron mb-4">Care</h4>
            <ul className="space-y-2 text-sm text-white/55">
              <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
              <li><Link href="/account/orders" className="hover:text-white">Track orders</Link></li>
              <li><Link href="/account" className="hover:text-white">Account</Link></li>
              <li><Link href="/account/wishlist" className="hover:text-white">Wishlist</Link></li>
            </ul>
          </div>
        </div>

        <p className="py-12 text-center font-serif italic text-4xl sm:text-6xl md:text-7xl text-white/[0.07] select-none">
          Nourish naturally
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-white/35 pt-4 border-t border-white/10 gap-4">
          <p>© {new Date().getFullYear()} NutriNation Foods Pvt. Ltd.</p>
          <div className="flex items-center gap-6">
            <Link href="/contact" className="hover:text-white">Privacy</Link>
            <Link href="/contact" className="hover:text-white">Terms</Link>
            <span>FSSAI #10020021004829</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
