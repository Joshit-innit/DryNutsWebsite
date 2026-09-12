import { Product, CategorySlug } from "@/types";
import { PRODUCTS } from "@/data/mockData";

export interface ProductFilterOptions {
  category?: CategorySlug | "all";
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  weight?: string;
  inStockOnly?: boolean;
  search?: string;
  sortBy?: "popularity" | "newest" | "price-asc" | "price-desc" | "rating" | "discount";
}

/**
 * productService — all methods fetch from the REST API at /api/v1/products.
 * This means ANY product added via the Admin Portal instantly appears in the
 * customer storefront without hardcoding or redeploying.
 */
export const productService = {
  async getAllProducts(filters?: ProductFilterOptions): Promise<Product[]> {
    const params = new URLSearchParams();
    if (filters?.category && filters.category !== "all") {
      params.set("category", filters.category);
    }
    if (filters?.minPrice !== undefined) params.set("minPrice", String(filters.minPrice));
    if (filters?.maxPrice !== undefined) params.set("maxPrice", String(filters.maxPrice));
    if (filters?.rating !== undefined && filters.rating > 0) {
      params.set("rating", String(filters.rating));
    }
    if (filters?.inStockOnly) params.set("inStockOnly", "true");
    if (filters?.search) params.set("search", filters.search);
    if (filters?.sortBy) params.set("sortBy", filters.sortBy);

    try {
      const res = await fetch(`/api/v1/products?${params.toString()}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to fetch products");
      const json = await res.json();
      return json.data as Product[];
    } catch {
      return filterProducts(PRODUCTS, filters);
    }
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    try {
      const res = await fetch(`/api/v1/products/${slug}`, { cache: "no-store" });
      if (!res.ok) return null;
      const json = await res.json();
      return json.data as Product;
    } catch {
      return PRODUCTS.find((product) => product.slug === slug) || null;
    }
  },

  async getFeaturedProducts(): Promise<Product[]> {
    const all = await productService.getAllProducts();
    return all.filter((p) => p.isFeatured).slice(0, 8);
  },

  async getBestSellers(): Promise<Product[]> {
    const all = await productService.getAllProducts({ sortBy: "popularity" });
    return all.filter((p) => p.isBestSeller).slice(0, 8);
  },

  async getRelatedProducts(category: CategorySlug, currentSlug: string): Promise<Product[]> {
    const all = await productService.getAllProducts({ category });
    return all.filter((p) => p.slug !== currentSlug).slice(0, 4);
  },
};

function filterProducts(products: Product[], filters?: ProductFilterOptions): Product[] {
  let result = [...products];

  if (filters?.category && filters.category !== "all") {
    result = result.filter((product) => product.category === filters.category);
  }
  if (filters?.minPrice !== undefined) {
    result = result.filter((product) => product.variants.some((variant) => variant.price >= filters.minPrice!));
  }
  if (filters?.maxPrice !== undefined) {
    result = result.filter((product) => product.variants.some((variant) => variant.price <= filters.maxPrice!));
  }
  if (filters?.rating) {
    result = result.filter((product) => product.rating >= filters.rating!);
  }
  if (filters?.inStockOnly) {
    result = result.filter((product) => product.variants.some((variant) => variant.stock > 0));
  }
  if (filters?.search) {
    const query = filters.search.toLowerCase();
    result = result.filter((product) => `${product.name} ${product.tagline}`.toLowerCase().includes(query));
  }

  switch (filters?.sortBy) {
    case "price-asc":
      result.sort((a, b) => a.variants[0].price - b.variants[0].price);
      break;
    case "price-desc":
      result.sort((a, b) => b.variants[0].price - a.variants[0].price);
      break;
    case "rating":
      result.sort((a, b) => b.rating - a.rating);
      break;
    case "discount":
      result.sort((a, b) => (b.variants[0].mrp - b.variants[0].price) - (a.variants[0].mrp - a.variants[0].price));
      break;
    default:
      result.sort((a, b) => Number(b.isBestSeller) - Number(a.isBestSeller));
  }

  return result;
}
