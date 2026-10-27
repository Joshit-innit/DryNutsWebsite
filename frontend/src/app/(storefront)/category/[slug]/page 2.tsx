import { CATEGORIES } from "@/data/mockData";
import CategoryClient from "./CategoryClient";

export function generateStaticParams() {
  return CATEGORIES.map((category) => ({ slug: category.slug }));
}

export default function CategoryPage() {
  return <CategoryClient />;
}
