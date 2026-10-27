"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { FileText, Save, CheckCircle2 } from "lucide-react";

export default function AdminContentPage() {
  const [heroHeadline, setHeroHeadline] = useState("NOURISH NATURALLY.");
  const [heroTagline, setHeroTagline] = useState("Premium dry fruits, carefully selected for everyday wellness.");
  const [editorialQuote, setEditorialQuote] = useState("Every box feels carefully selected, beautifully packed and genuinely premium.");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Homepage editorial content published live!");
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <span className="text-xs uppercase font-semibold tracking-[0.08em] text-brand-muted">
          BRAND VOICE & EDITORIAL CMS
        </span>
        <h1 className="font-semibold tracking-[-0.035em] text-2xl sm:text-3xl text-brand-dark">
          Editorial Story & Copywriting
        </h1>
        <p className="text-xs text-brand-muted mt-0.5">
          Update headline typography, seasonal hero messages, and editorial quotes.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white rounded-3xl border border-brand-border p-6 sm:p-8 shadow-xs space-y-4">
          <h3 className="font-semibold tracking-[-0.025em] text-base text-brand-dark border-b border-brand-border pb-3">
            Homepage Hero Copy
          </h3>

          <div>
            <label className="block text-xs font-bold text-brand-dark mb-1">Primary Display Headline</label>
            <input
              type="text"
              value={heroHeadline}
              onChange={(e) => setHeroHeadline(e.target.value)}
              className="w-full text-xs p-3 bg-brand-cream border border-brand-border rounded-xl font-semibold tracking-[-0.025em] text-brand-dark focus:outline-none focus:border-brand-green"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-dark mb-1">Supporting Hero Copy</label>
            <textarea
              rows={2}
              value={heroTagline}
              onChange={(e) => setHeroTagline(e.target.value)}
              className="w-full text-xs p-3 bg-brand-cream border border-brand-border rounded-xl focus:outline-none focus:border-brand-green"
            />
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-brand-border p-6 sm:p-8 shadow-xs space-y-4">
          <h3 className="font-semibold tracking-[-0.025em] text-base text-brand-dark border-b border-brand-border pb-3">
            Editorial Story Quote
          </h3>

          <div>
            <label className="block text-xs font-bold text-brand-dark mb-1">Connoisseur Review Quote</label>
            <textarea
              rows={3}
              value={editorialQuote}
              onChange={(e) => setEditorialQuote(e.target.value)}
              className="w-full text-xs p-3 bg-brand-cream border border-brand-border rounded-xl focus:outline-none focus:border-brand-green"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-brand-dark hover:bg-black text-white text-xs font-bold px-8 py-3 rounded-xl shadow-xs transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Publish Content Updates</span>
          </button>
        </div>
      </form>
    </div>
  );
}
