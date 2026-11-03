"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import { backendApi, unwrapData } from "@/lib/api/axios";
import { Product } from "@/types";
import { HeadingSkeleton, LoadingRegion, Skeleton } from "@/components/ui/Skeleton";

export default function AdminEditProductPage() {
  const params = useParams();
  const id = params?.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    backendApi
      .get(`/products/${id}`)
      .then((res) => !cancelled && setProduct(unwrapData<Product>(res)))
      .catch(() => !cancelled && setProduct(null))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <LoadingRegion label="Loading product" className="max-w-5xl space-y-6">
        <HeadingSkeleton />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-5 rounded-3xl border border-brand-border bg-white p-6 lg:col-span-2">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className={i === 2 ? "h-24 w-full rounded-xl" : "h-11 w-full rounded-xl"} />
              </div>
            ))}
          </div>
          <div className="space-y-4 rounded-3xl border border-brand-border bg-white p-6">
            <Skeleton className="aspect-square w-full rounded-2xl" />
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>
        </div>
      </LoadingRegion>
    );
  }

  if (!product) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="font-serif text-xl text-brand-dark">Product not found</h2>
        <Link href="/admin/products" className="text-xs text-brand-green font-bold hover:underline">
          Back to products
        </Link>
      </div>
    );
  }

  return <ProductForm key={product.id} product={product} />;
}
