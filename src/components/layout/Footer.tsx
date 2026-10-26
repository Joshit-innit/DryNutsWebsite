"use client";

import React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";
import { CATEGORIES } from "@/data/mockData";

const newsletterSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type NewsletterForm = z.infer<typeof newsletterSchema>;

export default function Footer() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NewsletterForm>({
    resolver: zodResolver(newsletterSchema),
  });

  const onSubmit = () => {
    toast.info("Newsletter sign-up is not connected yet.", {
      description: "Your email has not been submitted.",
    });
  };

  const coreCategories = CATEGORIES.filter(
    (c) => c.slug !== "combos" && c.slug !== "gift-boxes"
  );

  return (
    <footer className="bg-brand-dark py-12 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 border-b border-white/15 pb-12 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-brand-green flex items-center justify-center">
                <span className="font-casanova text-xl text-white pt-0.5">N</span>
              </div>
              <span className="font-casanova text-3xl tracking-[0.035em] text-[#FBF7F1]">NutriNation</span>
            </div>
            <p className="text-sm text-white/55 leading-relaxed max-w-sm font-light">
              A considered selection of dry fruits, everyday mixes, and gift boxes for Indian tables.
            </p>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-2 max-w-md">
              <p className="text-[11px] tracking-[0.22em] uppercase text-brand-saffron">Notes in your inbox</p>
              <div className="flex gap-2">
                <input
                  {...register("email")}
                  type="email"
                  placeholder="Email address"
                  className="flex-1 bg-white/8 border border-white/15 rounded-md px-4 py-2.5 text-sm text-white placeholder:text-white/35 focus:border-brand-saffron"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-md bg-brand-saffron text-brand-dark px-5 py-2.5 text-sm font-medium hover:bg-brand-saffron-light transition-colors"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
            </form>
          </div>

          <div>
            <h4 className="text-[11px] tracking-[0.22em] uppercase text-brand-saffron mb-4">Ingredients</h4>
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

        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-white/50 pt-8 gap-4">
          <p>© {new Date().getFullYear()} NutriNation Foods Pvt. Ltd.</p>
          <div className="flex items-center gap-6">
            <Link href="/contact" className="hover:text-white">Privacy</Link>
            <Link href="/contact" className="hover:text-white">Terms</Link>
            <Link href="/contact" className="hover:text-white">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
