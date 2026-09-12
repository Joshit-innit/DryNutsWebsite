import { PRODUCTS } from "@/data/mockData";
import AdminEditProductClient from "./AdminEditProductClient";

export function generateStaticParams() {
  return PRODUCTS.map((product) => ({ id: product.id }));
}

export default function AdminEditProductPage() {
  return <AdminEditProductClient />;
}
