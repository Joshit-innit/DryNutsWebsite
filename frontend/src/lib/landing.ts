import { LandingImage, Product } from "@/types";
import { getCategoryImages, getProductImage } from "@/lib/product-images";
import { formatPrice } from "@/lib/utils";
import type { CarouselSlide } from "@/components/home/HarvestCarousel";

/** Bestsellers first, then featured picks, then the rest of the catalogue. */
export function topProducts(products: Product[], limit = 10) {
  const rank = (p: Product) => (p.isBestSeller ? 2 : 0) + (p.isFeatured ? 1 : 0);
  return [...products].sort((a, b) => rank(b) - rank(a) || b.reviewCount - a.reviewCount).slice(0, limit);
}

export function shortName(name: string) {
  return name.replace(/\s*\(.*?\)\s*/g, " ").replace(/\s+/g, " ").trim();
}

export function lowestPrice(product: Product) {
  return Math.min(...product.variants.map((v) => v.price));
}

export function productSlide(product: Product): CarouselSlide {
  return {
    id: product.id,
    image: getProductImage(product),
    title: shortName(product.name),
    caption: `from ${formatPrice(lowestPrice(product))}`,
    href: `/products/${product.slug}`,
  };
}

/** Admin hero slides when any exist, otherwise the top products. */
export function heroSlides(landing: LandingImage[], ranked: Product[]): CarouselSlide[] {
  const custom = landing
    .filter((image) => image.section === "hero")
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((image) => ({
      id: image.id,
      image: image.imageUrl,
      title: image.title,
      caption: image.caption || undefined,
      href: image.linkUrl || "/products",
    }));
  return custom.length ? custom : ranked.map(productSlide);
}

/** Resize Unsplash URLs; uploaded photos are served as they are. */
export function sized(url: string, width: number) {
  return url.includes("images.unsplash.com") ? url.replace(/([?&])w=\d+/, `$1w=${width}`) : url;
}

export function categoryPhoto(landing: LandingImage[], slug: string): string {
  return landing.find((image) => image.section === "category" && image.slot === slug)?.imageUrl || getCategoryImages(slug)[0];
}

export function featuredPhoto(landing: LandingImage[], product: Product): string {
  return landing.find((image) => image.section === "featured")?.imageUrl || getProductImage(product);
}
