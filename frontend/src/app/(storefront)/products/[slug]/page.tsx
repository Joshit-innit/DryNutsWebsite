import type { Metadata } from "next";
import { db } from "@/lib/server/db";
import { shortName } from "@/lib/landing";
import { getProductImage } from "@/lib/product-images";
import ProductDetailClient from "./ProductDetailClient";

/**
 * The page itself renders in the browser, so this is what search engines and link
 * previews see: the product's own name, description and photo.
 */
export async function generateMetadata({ params }: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await db.getProductBySlug(slug).catch(() => undefined);
  if (!product || product.status !== "published") {
    return { title: "Product not found | NutriNation", robots: { index: false } };
  }

  const name = shortName(product.name);
  const description = product.description.length > 160 ? `${product.description.slice(0, 157).trimEnd()}…` : product.description;
  return {
    title: `${name} | NutriNation`,
    description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title: name,
      description,
      url: `/products/${product.slug}`,
      images: [{ url: getProductImage(product), alt: name }],
      type: "website",
    },
  };
}

export default function ProductPage() {
  return <ProductDetailClient />;
}
