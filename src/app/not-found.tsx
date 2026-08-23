"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Home, Search, Leaf } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4 sm:p-6 text-center">
      <div className="bg-white rounded-3xl border border-brand-border p-8 sm:p-14 shadow-card max-w-lg w-full space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-brand-green/10 text-brand-green flex items-center justify-center mx-auto">
          <Leaf className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-xs uppercase font-bold tracking-widest text-brand-orange">
            PAGE NOT FOUND (404)
          </span>
          <h1 className="font-serif font-black text-3xl sm:text-4xl text-brand-dark">
            Lost in the Orchard?
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted max-w-sm mx-auto leading-relaxed">
            The dry fruit page or product you are looking for has been harvested or moved to another grove.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="w-full sm:w-auto bg-brand-green hover:bg-brand-green-dark text-white font-bold text-xs px-6 py-3.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Home className="w-4 h-4" />
            <span>Return to Storefront</span>
          </Link>
          <Link
            href="/products"
            className="w-full sm:w-auto bg-brand-cream hover:bg-brand-beige text-brand-dark border border-brand-border font-bold text-xs px-6 py-3.5 rounded-xl transition-colors flex items-center justify-center gap-1.5"
          >
            <Search className="w-4 h-4" />
            <span>Browse All Harvests</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
