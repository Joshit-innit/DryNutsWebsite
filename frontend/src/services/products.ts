import { Product, CategorySlug } from "@/types";
import { backendApi, unwrapData } from "@/lib/api/axios";

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

export const productService = {
  async getAllProducts(filters?: ProductFilterOptions): Promise<Product[]> {
    const params = new URLSearchParams();
    if (filters?.category && filters.category !== "all") params.set("category", filters.category);
    if (filters?.minPrice !== undefined) params.set("minPrice", String(filters.minPrice));
    if (filters?.maxPrice !== undefined) params.set("maxPrice", String(filters.maxPrice));
    if (filters?.rating !== undefined && filters.rating > 0) params.set("rating", String(filters.rating));
    if (filters?.inStockOnly) params.set("inStockOnly", "true");
    if (filters?.search) params.set("search", filters.search);
    if (filters?.sortBy) params.set("sortBy", filters.sortBy);

    try {
      const query = params.toString();
      const res = await backendApi.get(query ? `/products?${query}` : "/products");
      return unwrapData<Product[]>(res);
    } catch {
      return [];
    }
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    try {
      const res = await backendApi.get(`/products/${slug}`);
      return unwrapData<Product>(res);
    } catch {
      return null;
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
