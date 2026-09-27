import { CategorySlug, Product } from "@/types";

export const CATEGORY_IMAGE_SETS: Record<CategorySlug, string[]> = {
  cashews: [
    "https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=1200&q=85",
  ],
  pistachios: [
    "https://images.unsplash.com/photo-1616684000067-36952fde56ec?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1524593166156-312f362cada0?auto=format&fit=crop&w=1200&q=85",
  ],
  almonds: [
    "https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1574570178142-c5044c1d0b66?auto=format&fit=crop&w=1200&q=85",
  ],
  walnuts: [
    "https://images.unsplash.com/photo-1568271679468-8e30ae044191?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1606313564200-e75d5e30476e?auto=format&fit=crop&w=1200&q=85",
  ],
  raisins: [
    "https://images.unsplash.com/photo-1595411425732-e69c1abe2763?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1595504763303-68f9f8d4d5d6?auto=format&fit=crop&w=1200&q=85",
  ],
  dates: [
    "https://images.unsplash.com/photo-1593105544559-ecb03bf76f82?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?auto=format&fit=crop&w=1200&q=85",
  ],
  "dried-apricots": [
    "https://images.unsplash.com/photo-1608797178974-15b35a65a363?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1596097635121-14b63b7a0c19?auto=format&fit=crop&w=1200&q=85",
  ],
  "dry-figs": [
    "https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?auto=format&fit=crop&w=1200&q=85",
  ],
  prunes: [
    "https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=1200&q=85",
  ],
  combos: [
    "https://images.unsplash.com/photo-1599785209707-a456fc1337bb?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1606923829579-0cb981a83e2e?auto=format&fit=crop&w=1200&q=85",
  ],
  "gift-boxes": [
    "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&w=1200&q=85",
  ],
};

export const PRODUCT_IMAGE_PLACEHOLDER = CATEGORY_IMAGE_SETS.combos[0];

export function getCategoryImages(category?: string): string[] {
  if (category && category in CATEGORY_IMAGE_SETS) {
    return CATEGORY_IMAGE_SETS[category as CategorySlug];
  }

  return [PRODUCT_IMAGE_PLACEHOLDER];
}

export function normalizeProductImages(product: Product): Product {
  const savedImages = Array.isArray(product.images)
    ? product.images.filter((image) => typeof image === "string" && image.trim().length > 0)
    : [];
  const fallbackImages = getCategoryImages(product.category);

  return {
    ...product,
    images: savedImages.length ? savedImages : fallbackImages,
  };
}

export function getProductImage(product: Pick<Product, "category" | "images">, index = 0): string {
  const images = normalizeProductImages(product as Product).images;
  return images[index] || images[0] || PRODUCT_IMAGE_PLACEHOLDER;
}
