"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { backendApi, unwrapData } from "@/lib/api/axios";
import { apiErrorMessage } from "@/lib/auth-session";
import { Product } from "@/types";
import { getProductImage } from "@/lib/product-images";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  CheckCircle2,
  EyeOff,
  Archive,
  ExternalLink,
  Loader2,
} from "lucide-react";

const STATUS_BADGE: Record<Product["status"], { label: string; className: string; icon: React.ElementType }> = {
  published: { label: "Published", className: "text-brand-green", icon: CheckCircle2 },
  draft: { label: "Draft", className: "text-amber-600", icon: EyeOff },
  archived: { label: "Archived", className: "text-brand-muted", icon: Archive },
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const [loadError, setLoadError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    backendApi
      .get("/products?scope=all")
      .then((res) => setProducts(unwrapData<Product[]>(res)))
      .catch((error) => setLoadError(apiErrorMessage(error, "Could not load products.")))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await backendApi.delete(`/products/${pendingDelete.id}`);
      setProducts((prev) => prev.filter((p) => p.id !== pendingDelete.id));
      toast.success(`"${pendingDelete.name}" deleted`);
      setPendingDelete(null);
    } catch (error) {
      toast.error("Could not delete product.", { description: apiErrorMessage(error, "Please try again.") });
    } finally {
      setDeleting(false);
    }
  };

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.categoryName.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === "ALL" || p.category === categoryFilter || p.categoryName === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-semibold tracking-[0.08em] text-brand-muted">
            CATALOG MANAGEMENT
          </span>
          <h1 className="font-semibold tracking-[-0.035em] text-2xl sm:text-3xl text-brand-dark">
            Products & Grade Inventory
          </h1>
          <p className="text-xs text-brand-muted mt-0.5">
            Manage dry fruit SKUs, weights, selling prices, and publish statuses.
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="bg-brand-dark hover:bg-black text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Dry Fruit</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-brand-border shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-brand-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by product name, category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-brand-cream border border-brand-border rounded-xl focus:outline-none focus:border-brand-green"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-brand-muted">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs p-2 bg-brand-cream border border-brand-border rounded-xl focus:outline-none focus:border-brand-green font-semibold cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            <option value="cashews">Cashews</option>
            <option value="pistachios">Pistachios</option>
            <option value="almonds">Almonds</option>
            <option value="walnuts">Walnuts</option>
            <option value="raisins">Raisins</option>
            <option value="dates">Dates</option>
            <option value="dried-apricots">Dried Apricots</option>
            <option value="dry-figs">Dry Figs</option>
            <option value="prunes">Prunes</option>
            <option value="combos">Combos</option>
            <option value="gift-boxes">Gift Boxes</option>
          </select>
        </div>
      </div>

      {/* Products Data Table */}
      <div className="bg-white rounded-3xl border border-brand-border shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-brand-cream text-[11px] uppercase font-bold text-brand-muted border-b border-brand-border">
              <tr>
                <th className="py-3 px-4">Harvest Product</th>
                <th className="py-3 px-3">Category & Grade</th>
                <th className="py-3 px-3">Primary SKU</th>
                <th className="py-3 px-3">Selling Price</th>
                <th className="py-3 px-3">Stock Level</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-brand-muted animate-pulse">
                    Loading product catalog...
                  </td>
                </tr>
              ) : loadError ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-red-600">
                    {loadError}
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-brand-muted">
                    No products found matching the query.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const mainVariant = p.variants[0];
                  const totalStock = p.variants.reduce((s, v) => s + v.stock, 0);
                  const badge = STATUS_BADGE[p.status] ?? STATUS_BADGE.published;
                  const BadgeIcon = badge.icon;

                  return (
                    <tr key={p.id} className="hover:bg-brand-cream/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-brand-cream overflow-hidden border border-brand-border flex-shrink-0">
                            <img
                              src={getProductImage(p)}
                              alt={p.name}
                              className="w-full h-full object-cover"
                              onError={(event) => {
                                event.currentTarget.src = getProductImage(p);
                              }}
                            />
                          </div>
                          <div>
                            <span className="font-semibold tracking-[-0.025em] text-xs text-brand-dark block line-clamp-1">
                              {p.name}
                            </span>
                            <span className="text-[10px] text-brand-muted">{p.variants.length} weight variants</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-brand-dark block">{p.categoryName}</span>
                        <span className="text-[10px] text-brand-muted">{p.grade || "Standard Reserve"}</span>
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-brand-muted">
                        {mainVariant?.sku || "NN-GEN-001"}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-brand-dark block">{formatPrice(mainVariant?.price || 0)}</span>
                        <span className="text-[10px] text-brand-muted line-through">{formatPrice(mainVariant?.mrp || 0)}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            totalStock > 30
                              ? "bg-green-100 text-green-800"
                              : totalStock > 0
                              ? "bg-amber-100 text-amber-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {totalStock > 0 ? `${totalStock} units available` : "Out of stock"}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${badge.className}`}>
                          <BadgeIcon className="w-3.5 h-3.5" /> {badge.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/products/${p.id}`}
                            className="p-1.5 rounded-lg text-brand-muted hover:text-brand-green hover:bg-brand-cream transition-colors"
                            title="Edit Product"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/products/${p.slug}`}
                            target="_blank"
                            className="p-1.5 rounded-lg text-brand-muted hover:text-brand-dark hover:bg-brand-cream transition-colors"
                            title="Preview on Storefront"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => setPendingDelete(p)}
                            className="p-1.5 rounded-lg text-brand-muted hover:text-red-500 hover:bg-red-50 transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      {pendingDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/40 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-title"
          onClick={() => !deleting && setPendingDelete(null)}
        >
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-hover" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-500">
              <Trash2 className="h-5 w-5" />
            </div>
            <h2 id="delete-title" className="font-serif text-lg text-brand-dark">Delete this product?</h2>
            <p className="mt-1 text-xs leading-relaxed text-brand-muted">
              <span className="font-semibold text-brand-dark">{pendingDelete.name}</span> will be removed from the
              catalog permanently. To hide it temporarily, set it to Draft instead.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setPendingDelete(null)}
                disabled={deleting}
                className="rounded-xl border border-brand-border px-4 py-2.5 text-xs font-bold text-brand-dark hover:bg-brand-cream"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-60"
              >
                {deleting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {deleting ? "Deleting..." : "Delete product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
