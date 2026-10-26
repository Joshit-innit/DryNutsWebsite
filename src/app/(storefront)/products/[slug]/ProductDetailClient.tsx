"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowRight, ChevronRight, Heart, Minus, PackageOpen, Plus, ShoppingBag } from "lucide-react";
import { productService } from "@/services/products";
import { Product } from "@/types";
import { useStore } from "@/context/StoreContext";
import { formatPrice } from "@/lib/utils";
import { getProductImageMeta } from "@/lib/product-images";
import ProductCard from "@/components/products/ProductCard";

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
      if (foundProduct) {
        setProduct(foundProduct);
        const related = await productService.getRelatedProducts(foundProduct.category, foundProduct.slug);
        setRelatedProducts(related);
      }
      setLoading(false);
    }

    loadProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
        <div className="grid animate-pulse grid-cols-1 gap-10 lg:grid-cols-2">
          <div className="aspect-square bg-brand-beige" />
          <div className="space-y-5 pt-4">
            <div className="h-3 w-24 bg-brand-beige" />
            <div className="h-14 w-3/4 bg-brand-beige" />
            <div className="h-20 w-full bg-brand-beige" />
            <div className="h-12 w-1/2 bg-brand-beige" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-4xl px-5 py-24 sm:px-8">
        <div className="border-l-2 border-brand-saffron pl-6">
          <h1 className="text-3xl">Product not found.</h1>
          <p className="mt-3 text-sm text-brand-muted">The product you requested is not currently in the collection.</p>
          <Link href="/products" className="btn-primary mt-6">Browse the collection</Link>
        </div>
      </div>
    );
  }

  const currentVariant = product.variants[selectedVariantIndex] || product.variants[0];
  const image = getProductImageMeta(product);
  const wishlisted = isInWishlist(product.id);

  const addItem = (openCart = false) => {
    addToCart(product, currentVariant, quantity);
    setIsAdded(true);
    window.setTimeout(() => setIsAdded(false), 1300);
    if (openCart) setIsCartOpen(true);
  };

  const tabs: { id: DetailTab; label: string }[] = [
    { id: "details", label: "Details" },
    { id: "nutrition", label: "Nutrition" },
    { id: "storage", label: "Storage" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12 lg:px-10">
      <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-1.5 overflow-hidden text-xs text-brand-muted">
        <Link href="/" className="hover:text-brand-green">Home</Link>
        <ChevronRight className="h-3 w-3 shrink-0" />
        <Link href="/products" className="hover:text-brand-green">Collection</Link>
        <ChevronRight className="h-3 w-3 shrink-0" />
        <Link href={`/category/${product.category}`} className="hover:text-brand-green">{product.categoryName}</Link>
      </nav>

      <section className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-7">
          <div className="relative aspect-square overflow-hidden" style={{ backgroundColor: image.background }}>
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
          <p className="eyebrow text-brand-green">{product.categoryName}</p>
          <h1 className="mt-4 text-4xl leading-[1.12] sm:text-5xl">{product.name}</h1>
          <p className="mt-5 text-base leading-relaxed text-brand-muted">{product.shortDescription}</p>

          <div className="mt-8 border-y border-brand-border py-5">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-semibold text-brand-dark">{formatPrice(currentVariant.price)}</span>
              {currentVariant.mrp > currentVariant.price && (
                <span className="text-sm text-brand-muted line-through">{formatPrice(currentVariant.mrp)}</span>
              )}
            </div>
          </div>

          <fieldset className="mt-7">
            <legend className="text-sm font-semibold text-brand-dark">Choose a size</legend>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {product.variants.map((variant, index) => (
                <button
                  key={variant.id}
                  type="button"
                  onClick={() => setSelectedVariantIndex(index)}
                  aria-pressed={selectedVariantIndex === index}
                  className={`border px-3 py-3 text-left text-sm transition-colors ${selectedVariantIndex === index ? "border-brand-green bg-brand-green text-white" : "border-brand-border bg-white text-brand-dark hover:border-brand-green"}`}
                >
                  <span className="block font-semibold">{variant.weight}</span>
                  <span className={`mt-1 block text-xs ${selectedVariantIndex === index ? "text-white/75" : "text-brand-muted"}`}>{formatPrice(variant.price)}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <div className="mt-7 flex items-center gap-3">
            <div className="flex h-12 items-center border border-brand-border bg-white">
              <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="grid h-full w-11 place-items-center hover:bg-brand-cream" aria-label="Decrease quantity">
                <Minus className="h-4 w-4" />
              </button>
              <span className="grid h-full w-10 place-items-center text-sm font-semibold" aria-live="polite">{quantity}</span>
              <button type="button" onClick={() => setQuantity((value) => value + 1)} className="grid h-full w-11 place-items-center hover:bg-brand-cream" aria-label="Increase quantity">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <button
              type="button"
              onClick={() => addItem(true)}
              disabled={currentVariant.stock <= 0}
              className="btn-primary min-h-12 flex-1 px-4 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ShoppingBag className="h-4 w-4" />
              {isAdded ? "Added to bag" : `Add ${formatPrice(currentVariant.price * quantity)}`}
            </button>
            <button
              type="button"
              onClick={() => toggleWishlist(product)}
              aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
              aria-pressed={wishlisted}
              className={`grid h-12 w-12 place-items-center border transition-colors ${wishlisted ? "border-red-200 bg-red-50 text-red-600" : "border-brand-border bg-white text-brand-dark hover:border-brand-green"}`}
            >
              <Heart className={`h-5 w-5 ${wishlisted ? "fill-current" : ""}`} />
            </button>
          </div>

          <button type="button" onClick={() => { addItem(); router.push("/checkout"); }} className="mt-3 w-full border border-brand-dark px-4 py-3 text-sm font-semibold text-brand-dark transition-colors hover:bg-brand-dark hover:text-white">
            Continue to checkout
          </button>
          <p className="mt-4 text-xs leading-relaxed text-brand-muted">Delivery choices and final order details are confirmed during checkout.</p>
        </div>
      </section>

      <section className="mt-16 border-t border-brand-border pt-8 sm:mt-24 sm:pt-10">
        <div className="flex gap-6 overflow-x-auto border-b border-brand-border" role="tablist" aria-label="Product information">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 border-b-2 pb-3 text-sm font-semibold ${activeTab === tab.id ? "border-brand-green text-brand-green" : "border-transparent text-brand-muted hover:text-brand-dark"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="max-w-3xl py-8">
          {activeTab === "details" && (
            <div className="space-y-6">
              <p className="text-base leading-relaxed text-brand-muted">{product.description}</p>
              <div className="border-l-2 border-brand-saffron pl-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-dark">Ingredients</p>
                <p className="mt-2 text-sm leading-relaxed text-brand-muted">{product.ingredients}</p>
              </div>
            </div>
          )}
          {activeTab === "nutrition" && (
            <div>
              <p className="mb-5 text-sm text-brand-muted">Serving size: {product.nutrition.servingSize}</p>
              <dl className="divide-y divide-brand-border border-y border-brand-border text-sm">
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
                    <dt className="text-brand-muted">{label}</dt><dd className="font-semibold text-brand-dark">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
          {activeTab === "storage" && (
            <div className="border-l-2 border-brand-green pl-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-dark">Storage guidance</p>
              <p className="mt-3 text-sm leading-relaxed text-brand-muted">{product.storageInfo}</p>
            </div>
          )}
        </div>
      </section>

      {relatedProducts.length > 0 && (
        <section className="border-t border-brand-border py-16 sm:py-20">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow mb-3 text-brand-green">More to explore</p>
              <h2 className="text-3xl">From the same category.</h2>
            </div>
            <Link href={`/category/${product.category}`} className="inline-flex items-center gap-2 text-sm font-semibold text-brand-dark hover:text-brand-green">
              View category <ArrowRight className="h-4 w-4" />
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
