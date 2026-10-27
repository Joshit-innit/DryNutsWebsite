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

  const columns = [
    {
      title: "Harvests",
      links: coreCategories.map((c) => ({ label: c.name, href: `/category/${c.slug}` })),
    },
    {
      title: "Shop",
      links: [
        { label: "Wellness combos", href: "/category/combos" },
        { label: "Gift hampers", href: "/category/gift-boxes" },
        { label: "Best sellers", href: "/products?filter=bestseller" },
        { label: "Full catalogue", href: "/products" },
      ],
    },
    {
      title: "Care",
      links: [
        { label: "Contact", href: "/contact" },
        { label: "Track orders", href: "/account/orders" },
        { label: "Account", href: "/account" },
        { label: "Wishlist", href: "/account/wishlist" },
      ],
    },
  ];

  return (
    <footer className="overflow-hidden bg-brand-dark pt-20 text-white">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 gap-12 pb-16 md:grid-cols-2 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-5">
            <p className="text-sm text-white/50">Newsletter</p>
            <h2 className="max-w-md text-[2.4rem] font-semibold leading-[1.02] tracking-[-0.045em] text-white">
              Harvest notes, <span className="font-accent text-brand-saffron-light">once a month.</span>
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="max-w-md space-y-2">
              <div className="flex gap-2 rounded-2xl border border-white/15 bg-white/[0.04] p-1.5">
                <input
                  {...register("email")}
                  type="email"
                  placeholder="Email address"
                  aria-label="Email address"
                  className="min-w-0 flex-1 bg-transparent px-3 text-sm text-white placeholder:text-white/35 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-brand-dark transition-colors hover:bg-brand-beige"
                >
                  Subscribe <ArrowRight className="h-4 w-4" />
                </button>
              </div>
              {errors.email && <p className="text-xs text-red-300">{errors.email.message}</p>}
            </form>
          </div>

          {columns.map((column) => (
            <div key={column.title} className="lg:col-span-2 lg:col-start-auto">
              <p className="mb-5 text-sm text-white/45">{column.title}</p>
              <ul className="space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link href={link.href} className="text-[15px] text-white/80 transition-colors hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-4 border-t border-white/10 py-6 text-[13px] text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} NutriNation Foods Pvt. Ltd. · Hand-graded in India</p>
          <div className="flex items-center gap-6">
            <Link href="/contact" className="hover:text-white">Privacy</Link>
            <Link href="/contact" className="hover:text-white">Terms</Link>
            <Link href="/contact" className="hover:text-white">Contact</Link>
          </div>
        </div>
      </div>

      <div aria-hidden className="select-none px-2 pb-2 text-center text-[17.5vw] font-bold leading-[0.78] tracking-[-0.075em] text-white/[0.07]">
        NutriNation<span className="text-brand-green-light/25">.</span>
      </div>
    </footer>
  );
}
