import { Category, CategorySlug } from "@/types";
import { backendApi, unwrapData } from "@/lib/api/axios";

const CORE_CATEGORY_SLUGS: CategorySlug[] = [
  "cashews", "pistachios", "almonds", "walnuts", "raisins",
  "dates", "dried-apricots", "dry-figs", "prunes",
];

export const categoryService = {
  async getAllCategories(): Promise<Category[]> {
    try {
      const res = await backendApi.get("/categories");
      return unwrapData<Category[]>(res);
    } catch {
      return [];
    }
  },

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    const cats = await categoryService.getAllCategories();
    return cats.find((c) => c.slug === slug) || null;
  },

  async getCoreHarvestCategories(): Promise<Category[]> {
    const all = await categoryService.getAllCategories();
    return all.filter((c) => CORE_CATEGORY_SLUGS.includes(c.slug as CategorySlug));
  },
};
