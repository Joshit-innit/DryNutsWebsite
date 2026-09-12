"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { adminService } from "@/services/admin";
import { PRODUCTS } from "@/data/mockData";
import { Product, CategorySlug } from "@/types";
import { ArrowLeft, Save, Trash2, CheckCircle2 } from "lucide-react";

const productEditSchema = z.object({
  name: z.string().min(3, "Product name is required"),
  tagline: z.string().min(5, "Tagline is required"),
  origin: z.string().min(3, "Origin is required"),
  price: z.coerce.number().min(1, "Price is required"),
  mrp: z.coerce.number().min(1, "MRP is required"),
  stock: z.coerce.number().min(0, "Stock is required"),
  status: z.enum(["published", "draft", "archived"]),
  shortDescription: z.string().min(10, "Short description required"),
});

type ProductEditFormData = z.infer<typeof productEditSchema>;

export default function AdminEditProductPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductEditFormData>({
    resolver: zodResolver(productEditSchema),
  });

  useEffect(() => {
    async function load() {
      const prod = await adminService.getProductById(id);
      if (prod) {
        setProduct(prod);
        reset({
          name: prod.name,
          tagline: prod.tagline,
          origin: prod.origin,
          price: prod.variants[0]?.price || 0,
          mrp: prod.variants[0]?.mrp || 0,
          stock: prod.variants[0]?.stock || 0,
          status: prod.status,
          shortDescription: prod.shortDescription,
        });
      }
      setLoading(false);
    }
    load();
  }, [id, reset]);

  const onSubmit = async (data: ProductEditFormData) => {
    if (!product) return;
    const updated: Product = {
      ...product,
      name: data.name,
      tagline: data.tagline,
      origin: data.origin,
      status: data.status,
      shortDescription: data.shortDescription,
      variants: [
        {
          ...product.variants[0],
          price: data.price,
          mrp: data.mrp,
          stock: data.stock,
        },
        ...product.variants.slice(1),
      ],
    };

    await adminService.saveProduct(updated);
    toast.success(`Product "${data.name}" updated successfully!`);
    router.push("/admin/products");
  };

  if (loading) {
    return <div className="p-8 text-xs text-brand-muted animate-pulse">Loading product record...</div>;
  }

  if (!product) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="font-serif font-bold text-xl text-brand-dark">Product Not Found</h2>
        <Link href="/admin/products" className="text-xs text-brand-green font-bold hover:underline">
          Back to Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between border-b border-brand-border pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="p-2 rounded-xl border border-brand-border bg-white text-brand-dark hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-brand-green">
              EDIT CATALOG PRODUCT
            </span>
            <h1 className="font-serif font-black text-2xl text-brand-dark">
              {product.name}
            </h1>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-3xl border border-brand-border p-6 sm:p-8 shadow-xs space-y-4">
          <h3 className="font-serif font-bold text-base text-brand-dark border-b border-brand-border pb-3">
            Core Details
          </h3>

          <div>
            <label className="block text-xs font-bold text-brand-dark mb-1">Product Title</label>
            <input
              {...register("name")}
              className="w-full text-xs p-3 bg-slate-50 border border-brand-border rounded-xl focus:outline-none focus:border-brand-green font-semibold"
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-brand-dark mb-1">Origin</label>
              <input
                {...register("origin")}
                className="w-full text-xs p-3 bg-slate-50 border border-brand-border rounded-xl focus:outline-none focus:border-brand-green"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-brand-dark mb-1">Catalog Status</label>
              <select
                {...register("status")}
                className="w-full text-xs p-3 bg-slate-50 border border-brand-border rounded-xl focus:outline-none focus:border-brand-green font-semibold cursor-pointer"
              >
                <option value="published">Published & Live</option>
                <option value="draft">Draft (Hidden)</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-dark mb-1">Tagline</label>
            <input
              {...register("tagline")}
              className="w-full text-xs p-3 bg-slate-50 border border-brand-border rounded-xl focus:outline-none focus:border-brand-green"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-dark mb-1">Short Description</label>
            <textarea
              {...register("shortDescription")}
              rows={3}
              className="w-full text-xs p-3 bg-slate-50 border border-brand-border rounded-xl focus:outline-none focus:border-brand-green"
            />
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-brand-border p-6 sm:p-8 shadow-xs space-y-4">
          <h3 className="font-serif font-bold text-base text-brand-dark border-b border-brand-border pb-3">
            Pricing & Stock
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-brand-dark mb-1">Selling Price (₹)</label>
              <input
                {...register("price")}
                type="number"
                className="w-full text-xs p-3 bg-slate-50 border border-brand-border rounded-xl focus:outline-none focus:border-brand-green font-bold text-brand-green"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-brand-dark mb-1">MRP (₹)</label>
              <input
                {...register("mrp")}
                type="number"
                className="w-full text-xs p-3 bg-slate-50 border border-brand-border rounded-xl focus:outline-none focus:border-brand-green"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-brand-dark mb-1">Stock Units</label>
              <input
                {...register("stock")}
                type="number"
                className="w-full text-xs p-3 bg-slate-50 border border-brand-border rounded-xl focus:outline-none focus:border-brand-green font-bold"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Link
            href="/admin/products"
            className="px-5 py-3 border border-brand-border bg-white hover:bg-slate-50 text-xs font-bold rounded-xl transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-brand-green hover:bg-brand-green-dark text-white text-xs font-bold px-8 py-3 rounded-xl shadow-sm transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? "Updating..." : "Save Product Changes"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
