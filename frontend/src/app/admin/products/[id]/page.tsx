"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import ProductForm from "@/components/admin/ProductForm";
import { backendApi, unwrapData } from "@/lib/api/axios";
import { Product } from "@/types";

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
      <div className="flex items-center gap-2 p-8 text-xs text-brand-muted">
        <Loader2 className="h-4 w-4 animate-spin text-brand-green" /> Loading product...
      </div>
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
