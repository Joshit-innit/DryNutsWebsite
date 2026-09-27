import { PRODUCTS } from "@/data/mockData";
import ProductDetailClient from "./ProductDetailClient";

export function generateStaticParams() {
  return PRODUCTS.map((product) => ({ slug: product.slug }));
}

export default function ProductPage() {
  return <ProductDetailClient />;
}
