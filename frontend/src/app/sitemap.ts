import type { MetadataRoute } from "next";
import { db } from "@/lib/server/db";
import { SITE_URL } from "@/lib/site";

// Rebuilt on each request so new and retired products show up straight away.
export const dynamic = "force-dynamic";

const PAGES = ["", "/products", "/best-sellers", "/contact", "/privacy-policy", "/refund-policy", "/return-policy"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([
    db.getProducts().catch(() => []),
    db.getCategories().catch(() => []),
  ]);

  return [
    ...PAGES.map((path) => ({ url: `${SITE_URL}${path}` })),
    ...categories.map((category) => ({ url: `${SITE_URL}/category/${category.slug}` })),
    ...products
      .filter((product) => product.status === "published")
      .map((product) => ({ url: `${SITE_URL}/products/${product.slug}` })),
  ];
}
