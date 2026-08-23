import { Category, CategorySlug } from "@/types";

const CORE_CATEGORY_SLUGS: CategorySlug[] = [
  "cashews", "pistachios", "almonds", "walnuts", "raisins",
  "dates", "dried-apricots", "dry-figs", "prunes",
];

export const categoryService = {
  async getAllCategories(): Promise<Category[]> {
    try {
      const res = await fetch("/api/v1/categories", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed");
      const json = await res.json();
      return json.data as Category[];
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
