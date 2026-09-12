import { SAMPLE_ORDERS } from "@/data/mockData";
import OrderDetailsClient from "./OrderDetailsClient";

export function generateStaticParams() {
  return SAMPLE_ORDERS.map((order) => ({ id: order.id }));
}

export default function OrderDetailsPage() {
  return <OrderDetailsClient />;
}
