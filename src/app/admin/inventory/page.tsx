"use client";

import React, { useState, useEffect } from "react";
import { adminService } from "@/services/admin";
import { Product } from "@/types";
import { toast } from "sonner";
import { Sliders, AlertTriangle, CheckCircle2, RefreshCw, Plus } from "lucide-react";

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await adminService.getAdminProducts();
      setProducts(data);
      setLoading(false);
    }
    load();
  }, []);

  const handleRestock = (productName: string, variantWeight: string) => {
    toast.success(`Restock batch allocated for ${productName} (${variantWeight})`, {
      description: "+50 units added to warehouse inventory.",
    });
  };

  const allVariants = products.flatMap((p) =>
    p.variants.map((v) => ({
      productId: p.id,
      productName: p.name,
      image: p.images[0],
      categoryName: p.categoryName,
      weight: v.weight,
      sku: v.sku,
      stock: v.stock,
      reserved: Math.floor(v.stock * 0.15),
      threshold: 25,
    }))
  );

  const lowStockCount = allVariants.filter((v) => v.stock < v.threshold).length;
  const totalUnits = allVariants.reduce((sum, v) => sum + v.stock, 0);

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-brand-green">
            WAREHOUSE & CLEAN-ROOM ALLOCATIONS
          </span>
          <h1 className="font-serif font-black text-2xl sm:text-3xl text-brand-dark">
            Inventory Stock & Thresholds
          </h1>
          <p className="text-xs text-brand-muted mt-0.5">
            Monitor real-time nitrogen-sealed packaging stock across all 9 dry fruit varieties.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-brand-border shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-muted block mb-1">
            Total Inventory on Hand
          </span>
          <span className="font-serif font-black text-2xl text-brand-dark block">{totalUnits} Units</span>
          <span className="text-xs text-brand-muted mt-1 block">Hermetically stored</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-brand-border shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-muted block mb-1">
            Low Stock Alerts
          </span>
          <span className="font-serif font-black text-2xl text-amber-700 block">{lowStockCount} SKUs</span>
          <span className="text-xs text-amber-600 mt-1 block">Below 25-unit safety threshold</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-brand-border shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-muted block mb-1">
            Reserved for Pending Orders
          </span>
          <span className="font-serif font-black text-2xl text-brand-green block">
            {allVariants.reduce((sum, v) => sum + v.reserved, 0)} Units
          </span>
          <span className="text-xs text-brand-muted mt-1 block">Packing in progress</span>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-3xl border border-brand-border shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[11px] uppercase font-bold text-brand-muted border-b border-brand-border">
              <tr>
                <th className="py-3 px-4">Harvest & Weight</th>
                <th className="py-3 px-3">SKU</th>
                <th className="py-3 px-3">Available</th>
                <th className="py-3 px-3">Reserved</th>
                <th className="py-3 px-3">Threshold</th>
                <th className="py-3 px-3">Health Status</th>
                <th className="py-3 px-4 text-right">Quick Restock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {allVariants.map((item, idx) => {
                const isLow = item.stock < item.threshold;

                return (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-cream overflow-hidden border border-brand-border flex-shrink-0">
                          <img src={item.image} alt={item.productName} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-serif font-bold text-xs text-brand-dark line-clamp-1">{item.productName}</p>
                          <span className="text-[10px] text-brand-green font-semibold">{item.weight} pack</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-brand-muted">{item.sku}</td>
                    <td className="py-3 px-3 font-bold text-brand-dark">{item.stock}</td>
                    <td className="py-3 px-3 text-brand-muted">{item.reserved}</td>
                    <td className="py-3 px-3 text-brand-muted">{item.threshold}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isLow ? "bg-amber-100 text-amber-800" : "bg-green-100 text-green-800"
                        }`}
                      >
                        {isLow ? "Low Stock Warning" : "Optimal"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleRestock(item.productName, item.weight)}
                        className="text-xs bg-slate-100 hover:bg-brand-green hover:text-white text-brand-dark font-bold px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+50 Units</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
