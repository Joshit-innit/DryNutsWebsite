import { SAMPLE_ORDERS } from "@/data/mockData";
import AdminOrderInspectClient from "./AdminOrderInspectClient";

export function generateStaticParams() {
  return SAMPLE_ORDERS.map((order) => ({ id: order.id }));
}

export default function AdminOrderInspectPage() {
  return <AdminOrderInspectClient />;
}
