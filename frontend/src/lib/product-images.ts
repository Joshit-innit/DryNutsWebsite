import { CategorySlug, Product } from "@/types";

/** Unsplash photo URL (free licence). Every ID below was checked by eye to show the named dry fruit. */
function img(id: string, width = 1200): string {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=80`;
}

export const CATEGORY_IMAGE_SETS: Record<CategorySlug, string[]> = {
  cashews: [
    img("1723466998040-78d7e2ef6d72"),
    img("1615485925873-7ecbbe90a866"),
    img("1729514256038-c489695f4d79"),
    img("1729796350013-ebb27f079c76"),
    img("1641718087616-859c6754efb9"),
  ],
  pistachios: [
    img("1598110996285-54523b72be93"),
    img("1704079662049-d00890d21a69"),
    img("1502825751399-28baa9b81efe"),
    img("1645291787167-d22b269a4a49"),
    img("1615485925933-379c8b6ad03c"),
  ],
  almonds: [
    img("1600188999986-331bec5f9a8d"),
    img("1608797178974-15b35a64ede9"),
    img("1583126379180-ec70bb3178b1"),
    img("1508061253366-f7da158b6d46"),
  ],
  walnuts: [
    img("1635843108103-9af0ea224a19"),
    img("1524593656068-fbac72624bb0"),
    img("1766186471458-840baf8bc04f"),
  ],
  raisins: [
    img("1634601288149-601f4b81ed7e"),
    img("1642102903918-b97c37955bbf"),
    img("1621597121291-fa650ac736e5"),
  ],
  dates: [
    img("1775453585199-7605c46d6da1"),
    img("1777891258071-45b4cee69360"),
    img("1777891258039-970dd7e6e14c"),
    img("1773038831316-a2f5e52a56e4"),
  ],
  "dried-apricots": [
    img("1723110565328-9dbeef603d19"),
    img("1784043436919-28fd8e17ff3c"),
    img("1595412017587-b7f3117dff54"),
  ],
  "dry-figs": [
    img("1524593313283-1e092f06b2f0"),
    img("1670775231064-a27ca2c0178d"),
    img("1556216583-cb1ac9559189"),
  ],
  prunes: [
    img("1715663760594-5250f3261fb7"),
    img("1715663760578-f3081f3c7105"),
    img("1715663760540-f1c719607218"),
  ],
  combos: [
    img("1543158181-1274e5362710"),
    img("1769255484233-94ece98f722d"),
    img("1695568179701-462c5ea05e41"),
  ],
  "gift-boxes": [
    img("1702043239331-da06c5c269e4"),
    img("1622498892202-abffaa9d9bed"),
    img("1615485737555-3643755b9b98"),
  ],
};

export const PRODUCT_IMAGE_PLACEHOLDER = CATEGORY_IMAGE_SETS.combos[0];

const CATEGORY_IMAGE_TREATMENT: Record<CategorySlug, { objectPosition: string; background: string }> = {
  cashews: { objectPosition: "50% 50%", background: "#F6EEE2" },
  pistachios: { objectPosition: "50% 50%", background: "#F6EEE2" },
  almonds: { objectPosition: "50% 50%", background: "#F6EEE2" },
  walnuts: { objectPosition: "50% 48%", background: "#F6EEE2" },
  raisins: { objectPosition: "50% 50%", background: "#FFFAF2" },
  dates: { objectPosition: "50% 50%", background: "#F6EEE2" },
  "dried-apricots": { objectPosition: "50% 50%", background: "#F6EEE2" },
  "dry-figs": { objectPosition: "50% 50%", background: "#F6EEE2" },
  prunes: { objectPosition: "50% 50%", background: "#FFFAF2" },
  combos: { objectPosition: "50% 50%", background: "#F6EEE2" },
  "gift-boxes": { objectPosition: "50% 50%", background: "#F6EEE2" },
};

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

export function getProductImageMeta(product: Pick<Product, "name" | "category" | "categoryName" | "images">) {
  const category = product.category as CategorySlug;
  const treatment = CATEGORY_IMAGE_TREATMENT[category] || {
    objectPosition: "50% 50%",
    background: "#F6EEE2",
  };

  return {
    src: getProductImage(product),
    alt: `Photograph of ${product.name}, ${product.categoryName}`,
    ...treatment,
  };
}
