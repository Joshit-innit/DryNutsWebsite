"use client";

import React, { useState } from "react";
import { CATEGORIES } from "@/data/mockData";
import { Category } from "@/types";
import { toast } from "sonner";
import { Boxes, Plus, Edit2, CheckCircle2, Layers } from "lucide-react";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(CATEGORIES);

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-brand-green">
            TAXONOMY & HARVEST GROVES
          </span>
          <h1 className="font-serif font-black text-2xl sm:text-3xl text-brand-dark">
            Category Management ({categories.length})
          </h1>
          <p className="text-xs text-brand-muted mt-0.5">
            Strictly maintains the 9 core dry fruit pillars plus curated combos and festive gift lines.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white rounded-3xl border border-brand-border p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-brand-green/40 transition-colors"
          >
            <div className="space-y-3">
              <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-brand-cream border border-brand-border relative">
                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                <span className="absolute top-2 right-2 bg-brand-dark/80 text-brand-saffron text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {cat.itemCount} SKUs
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-brand-green tracking-wider">
                  Origin: {cat.originHighlight.split(",")[0]}
                </span>
                <h3 className="font-serif font-bold text-lg text-brand-dark">{cat.name}</h3>
                <p className="text-xs text-brand-muted line-clamp-2 mt-1">{cat.description}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-brand-border flex items-center justify-between text-xs">
              <span className="text-[11px] font-mono text-brand-muted">/category/{cat.slug}</span>
              <button
                onClick={() => toast.info(`Category "${cat.name}" is locked to ensure 9-pillar brand purity.`)}
                className="text-brand-green font-bold hover:underline flex items-center gap-1"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Configure</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
