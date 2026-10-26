"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, PackageOpen, ShoppingBag, Check } from "lucide-react";
import { Product, WeightVariant } from "@/types";
import { formatPrice } from "@/lib/utils";
import { getProductImageMeta } from "@/lib/product-images";
import { useStore } from "@/context/StoreContext";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const { addToCart, toggleWishlist, isInWishlist } = useStore();
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [isAdded, setIsAdded] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  const currentVariant: WeightVariant = product.variants[selectedVariantIndex] || product.variants[0];
  const image = getProductImageMeta(product);
  const wishlisted = isInWishlist(product.id);

  const addItem = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    addToCart(product, currentVariant, 1);
    setIsAdded(true);
    window.setTimeout(() => setIsAdded(false), 1300);
  };

  return (
    <article className="flex h-full min-w-0 flex-col">
      <div className="relative aspect-[4/5] overflow-hidden rounded-md" style={{ backgroundColor: image.background }}>
        <Link href={`/products/${product.slug}`} className="absolute inset-0 block" aria-label={`View ${product.name}`}>
          {imageFailed ? (
            <div className="flex h-full w-full flex-col items-center justify-center gap-3 px-6 text-center text-brand-muted" role="img" aria-label={`Image unavailable for ${product.name}`}>
              <PackageOpen className="h-7 w-7 text-brand-green" aria-hidden="true" />
              <span className="text-xs leading-relaxed">Product photograph unavailable</span>
            </div>
          ) : (
            <Image
              src={image.src}
              alt={image.alt}
              fill
              priority={priority}
              sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 25vw"
              className="object-cover transition-transform duration-500 hover:scale-[1.025]"
              style={{ objectPosition: image.objectPosition }}
              onError={() => setImageFailed(true)}
            />
          )}
        </Link>
        <button
          type="button"
          onClick={() => toggleWishlist(product)}
          aria-label={wishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          aria-pressed={wishlisted}
          className={`absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-md transition-colors ${wishlisted ? "bg-white text-red-600" : "bg-white/90 text-brand-dark hover:bg-white"}`}
        >
          <Heart className={`h-4 w-4 ${wishlisted ? "fill-current" : ""}`} />
        </button>
      </div>

      <div className="flex flex-1 flex-col pt-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-muted">{product.categoryName}</p>
        <Link href={`/products/${product.slug}`} className="mt-1.5 block">
          <h3 className="min-h-[3rem] font-marcellus text-xl leading-6 text-brand-dark transition-colors hover:text-brand-green">
            {product.name}
          </h3>
        </Link>

        {product.variants.length > 1 && (
          <div className="mt-4 flex flex-wrap gap-1.5" aria-label="Select package weight">
            {product.variants.map((variant, index) => (
              <button
                key={variant.id}
                type="button"
                onClick={() => setSelectedVariantIndex(index)}
                aria-pressed={selectedVariantIndex === index}
                className={`min-w-12 border px-2.5 py-1 text-[11px] font-medium transition-colors ${selectedVariantIndex === index ? "border-brand-green bg-brand-green text-white" : "border-brand-border bg-white text-brand-muted hover:border-brand-green hover:text-brand-dark"}`}
              >
                {variant.weight}
              </button>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-brand-border pt-4">
          <div className="min-w-0">
            <p className="text-xs text-brand-muted">{currentVariant.weight}</p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-lg font-semibold text-brand-dark">{formatPrice(currentVariant.price)}</span>
              {currentVariant.mrp > currentVariant.price && (
                <span className="text-xs text-brand-muted line-through">{formatPrice(currentVariant.mrp)}</span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={addItem}
            disabled={currentVariant.stock <= 0}
            className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-md bg-brand-green px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-green-dark disabled:cursor-not-allowed disabled:opacity-45"
          >
            {isAdded ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
            {isAdded ? "Added" : "Add"}
          </button>
        </div>
      </div>
    </article>
  );
}
