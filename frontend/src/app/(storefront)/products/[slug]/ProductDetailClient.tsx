"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowRight, Heart, Minus, PackageOpen, Plus, ShoppingBag } from "lucide-react";
import { productService } from "@/services/products";
import { Product } from "@/types";
import { useStore } from "@/context/StoreContext";
import { shortName } from "@/lib/landing";
import { formatPrice } from "@/lib/utils";
import { getProductImageMeta } from "@/lib/product-images";
import ProductCard from "@/components/products/ProductCard";
import ReviewForm from "@/components/products/ReviewForm";
import { ProductDetailSkeleton } from "@/components/ui/Skeleton";

type DetailTab = "details" | "nutrition" | "storage";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const { addToCart, isInWishlist, setIsCartOpen, toggleWishlist } = useStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<DetailTab>("details");
  const [isAdded, setIsAdded] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      setImageFailed(false);
      const foundProduct = await productService.getProductBySlug(slug);
      // Each product starts fresh: first size in stock, one pack, Details tab.
      setQuantity(1);
      setActiveTab("details");
      setIsAdded(false);
      if (foundProduct) {
        setSelectedVariantIndex(Math.max(0, foundProduct.variants.findIndex((v) => v.stock > 0)));
        setProduct(foundProduct);
        const related = await productService.getRelatedProducts(foundProduct.category, foundProduct.slug);
        setRelatedProducts(related);
      }
      setLoading(false);
    }

    loadProduct();
  }, [slug]);

  // Name the browser tab after the product, so tabs and history are distinguishable.
  useEffect(() => {
    if (product) document.title = `${shortName(product.name)} | NutriNation`;
  }, [product]);

  if (loading) {
    return <ProductDetailSkeleton />;
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-4xl px-5 py-24 sm:px-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-[-0.035em]">Product not found.</h1>
          <p className="mt-3 text-[15px] text-brand-muted">The product you requested is not currently in the collection.</p>
          <Link href="/products" className="btn-primary mt-6">Browse the collection</Link>
        </div>
      </div>
    );
  }

  const currentVariant = product.variants[selectedVariantIndex] || product.variants[0];
  const image = getProductImageMeta(product);
  const wishlisted = isInWishlist(product.id);
  // "(King Size)" and similar notes are set as a quieter line under the name.
  const nameNote = product.name.match(/\(([^)]+)\)/)?.[1];
  const saving = currentVariant.mrp > currentVariant.price ? Math.round(((currentVariant.mrp - currentVariant.price) / currentVariant.mrp) * 100) : 0;

  const soldOut = currentVariant.stock <= 0;
  const maxQuantity = Math.max(1, currentVariant.stock);

  const addItem = (openCart = false) => {
    if (soldOut) return false;
    addToCart(product, currentVariant, Math.min(quantity, maxQuantity));
    setIsAdded(true);
    window.setTimeout(() => setIsAdded(false), 1300);
    if (openCart) setIsCartOpen(true);
    return true;
  };

  const selectVariant = (index: number) => {
    setSelectedVariantIndex(index);
    setQuantity((q) => Math.min(q, Math.max(1, product.variants[index].stock)));
  };

  const focusTab = (index: number) => {
    const next = tabs[(index + tabs.length) % tabs.length];
    setActiveTab(next.id);
    document.getElementById(`tab-${next.id}`)?.focus();
  };

  const tabs: { id: DetailTab; label: string }[] = [
    { id: "details", label: "Details" },
    { id: "nutrition", label: "Nutrition" },
    { id: "storage", label: "Storage" },
  ];

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 sm:py-12 lg:px-12">
      <section className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-7">
          <div className="relative aspect-square overflow-hidden rounded-[20px]" style={{ backgroundColor: image.background }}>
            {imageFailed ? (
              <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-brand-muted" role="img" aria-label={`Image unavailable for ${product.name}`}>
                <PackageOpen className="h-8 w-8 text-brand-green" aria-hidden="true" />
                <span className="text-sm">Product photograph unavailable</span>
              </div>
            ) : (
              <Image
                src={image.src}
                alt={image.alt}
                fill
                priority
                sizes="(max-width: 1023px) 100vw, 58vw"
                className="object-cover"
                style={{ objectPosition: image.objectPosition }}
                onError={() => setImageFailed(true)}
              />
            )}
          </div>
        </div>

        <div className="lg:col-span-5 lg:pt-4">
          <Link href={`/category/${product.category}`} className="section-label link-rule">
            {product.categoryName}
          </Link>
          <h1 className="mt-4 text-[clamp(2.25rem,3.8vw,3.25rem)] font-semibold leading-[1.02] tracking-[-0.04em] text-brand-dark">
            {shortName(product.name)}
            {nameNote && (
              <span className="mt-2 block text-[clamp(1.125rem,1.6vw,1.375rem)] font-medium leading-tight tracking-[-0.02em] text-brand-muted">
                {nameNote}
              </span>
            )}
          </h1>
          <p className="mt-5 max-w-[46ch] text-[17px] leading-[1.6] text-brand-dark/80">{product.shortDescription}</p>

          <div className="mt-8 border-y border-brand-border py-5">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-[2rem] font-semibold leading-none tabular-nums tracking-[-0.03em] text-brand-dark">{formatPrice(currentVariant.price)}</span>
              {saving > 0 && (
                <>
                  <span className="text-[15px] tabular-nums text-brand-muted line-through">
                    <span className="sr-only">MRP </span>
                    {formatPrice(currentVariant.mrp)}
                  </span>
                  <span className="text-[15px] font-semibold tabular-nums text-brand-green">{saving}% off</span>
                </>
              )}
            </div>
          </div>

          <fieldset className="mt-7">
            <legend className="text-[15px] font-semibold text-brand-dark">Choose a size</legend>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {product.variants.map((variant, index) => {
                const selected = selectedVariantIndex === index;
                const out = variant.stock <= 0;
                return (
                  <button
                    key={variant.id}
                    type="button"
                    onClick={() => selectVariant(index)}
                    aria-pressed={selected}
                    className={`rounded-xl border px-3.5 py-3 text-left transition-colors ${
                      selected
                        ? out
                          ? "border-brand-dark bg-brand-cream text-brand-dark"
                          : "border-brand-green bg-brand-green text-white"
                        : out
                          ? "border-brand-border bg-brand-cream text-brand-muted hover:border-brand-border-dark"
                          : "border-brand-border bg-white text-brand-dark hover:border-brand-green"
                    }`}
                  >
                    <span className="block text-[15px] font-semibold tracking-[-0.01em]">{variant.weight}</span>
                    <span className={`mt-0.5 block text-[13px] tabular-nums ${selected && !out ? "text-white/80" : "text-brand-muted"}`}>
                      {out ? "Sold out" : formatPrice(variant.price)}
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="mt-7 flex items-center gap-3">
            <div className="flex h-12 items-center overflow-hidden rounded-xl border border-brand-border bg-white">
              <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} disabled={soldOut || quantity <= 1} className="grid h-full w-11 place-items-center hover:bg-brand-cream disabled:cursor-not-allowed disabled:text-brand-muted-light disabled:hover:bg-transparent" aria-label="Decrease quantity">
                <Minus className="h-4 w-4" />
              </button>
              <span className="grid h-full w-10 place-items-center text-[15px] font-semibold tabular-nums" aria-live="polite">{quantity}</span>
              <button type="button" onClick={() => setQuantity((value) => Math.min(maxQuantity, value + 1))} disabled={soldOut || quantity >= maxQuantity} className="grid h-full w-11 place-items-center hover:bg-brand-cream disabled:cursor-not-allowed disabled:text-brand-muted-light disabled:hover:bg-transparent" aria-label={quantity >= maxQuantity && !soldOut ? `Only ${maxQuantity} in stock` : "Increase quantity"}>
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <button
              type="button"
              onClick={() => addItem(true)}
              disabled={soldOut}
              className="btn-primary min-h-12 min-w-0 flex-1 !rounded-xl whitespace-nowrap px-4 tabular-nums disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ShoppingBag className="h-4 w-4 shrink-0" />
              {soldOut ? "Sold out" : isAdded ? "Added to bag" : `Add ${formatPrice(currentVariant.price * quantity)}`}
            </button>
            <button
              type="button"
              onClick={() => toggleWishlist(product)}
              aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
              aria-pressed={wishlisted}
              className={`grid h-12 w-12 place-items-center rounded-xl border transition-colors ${wishlisted ? "border-red-200 bg-red-50 text-red-600" : "border-brand-border bg-white text-brand-dark hover:border-brand-green"}`}
            >
              <Heart className={`h-5 w-5 ${wishlisted ? "fill-current" : ""}`} />
            </button>
          </div>

          <button type="button" onClick={() => { if (addItem()) router.push("/checkout"); }} disabled={soldOut} className="mt-3 h-12 w-full rounded-xl border border-brand-dark px-4 text-[15px] font-medium text-brand-dark transition-colors hover:bg-brand-dark hover:text-white disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-transparent disabled:hover:text-brand-dark">
            Continue to checkout
          </button>
          <p className="mt-4 text-[13px] leading-relaxed text-brand-muted">Delivery choices and final order details are confirmed during checkout.</p>
        </div>
      </section>

      <section className="mt-16 border-t border-brand-border pt-8 sm:mt-24 sm:pt-10">
        <div className="flex gap-6 overflow-x-auto border-b border-brand-border" role="tablist" aria-label="Product information">
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls="product-tabpanel"
              tabIndex={activeTab === tab.id ? 0 : -1}
              onClick={() => setActiveTab(tab.id)}
              onKeyDown={(event) => {
                if (event.key === "ArrowRight") { event.preventDefault(); focusTab(index + 1); }
                if (event.key === "ArrowLeft") { event.preventDefault(); focusTab(index - 1); }
                if (event.key === "Home") { event.preventDefault(); focusTab(0); }
                if (event.key === "End") { event.preventDefault(); focusTab(tabs.length - 1); }
              }}
              className={`shrink-0 border-b-2 pb-3 text-[15px] font-medium ${activeTab === tab.id ? "border-brand-green text-brand-green" : "border-transparent text-brand-muted hover:text-brand-dark"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div id="product-tabpanel" className="max-w-[68ch] py-8" role="tabpanel" aria-labelledby={`tab-${activeTab}`} tabIndex={0}>
          {activeTab === "details" && (
            <div className="space-y-8">
              <p className="text-base leading-[1.65] text-brand-dark/80">{product.description}</p>
              <dl className="border-t border-brand-border pt-5">
                <dt className="text-[14px] font-semibold text-brand-dark">Ingredients</dt>
                <dd className="mt-1.5 text-[15px] leading-relaxed text-brand-dark/80">{product.ingredients}</dd>
              </dl>
            </div>
          )}
          {activeTab === "nutrition" && (
            <div>
              <p className="mb-5 text-[15px] text-brand-muted">Per serving of <span className="font-medium text-brand-dark">{product.nutrition.servingSize}</span></p>
              <dl className="divide-y divide-brand-border border-y border-brand-border text-[15px]">
                {[
                  ["Calories", product.nutrition.calories],
                  ["Protein", product.nutrition.protein],
                  ["Fats", product.nutrition.healthyFats],
                  ["Carbohydrates", product.nutrition.carbs],
                  ["Fiber", product.nutrition.fiber],
                  ...(product.nutrition.calcium ? [["Calcium", product.nutrition.calcium]] : []),
                  ...(product.nutrition.iron ? [["Iron", product.nutrition.iron]] : []),
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between py-3">
                    <dt className="text-brand-muted">{label}</dt><dd className="font-semibold tabular-nums text-brand-dark">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
          {activeTab === "storage" && (
            <dl>
              <dt className="text-[14px] font-semibold text-brand-dark">Storage guidance</dt>
              <dd className="mt-1.5 text-base leading-[1.65] text-brand-dark/80">{product.storageInfo}</dd>
            </dl>
          )}
        </div>
      </section>

      <ReviewForm productId={product.id} productName={product.name} slug={product.slug} />

      {relatedProducts.length > 0 && (
        <section className="border-t border-brand-border py-16 sm:py-20">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="section-label mb-3">More to explore</p>
              <h2 className="text-3xl font-semibold tracking-[-0.035em]">From the same category.</h2>
            </div>
            <Link href={`/category/${product.category}`} className="group inline-flex shrink-0 items-center gap-2 text-[15px] font-medium text-brand-dark">
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              <span className="link-rule">View category</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((related) => <ProductCard key={related.id} product={related} />)}
          </div>
        </section>
      )}
    </div>
  );
}
