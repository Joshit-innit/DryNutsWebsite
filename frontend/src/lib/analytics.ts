import { Order, OrderStatus } from "@/types";

/**
 * Revenue analytics derived only from real orders in the database.
 * Revenue is recognised when an order reaches "Delivered" — orders that are
 * still in transit, cancelled or refunded do not count.
 */

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const CATEGORY_COLORS = ["#2D4A33", "#6F8F4E", "#B9853C", "#9C5B33", "#D2A866", "#1D1C1A", "#7A8B99"];

export const STATUS_ORDER: OrderStatus[] = [
  "Pending",
  "Confirmed",
  "Packed",
  "Shipped",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
  "Refunded",
];

export interface MonthlyRevenuePoint {
  key: string; // YYYY-MM
  month: string; // "Nov 26"
  revenue: number;
  orders: number;
}

export interface CategoryRevenue {
  name: string;
  revenue: number;
  units: number;
  share: number; // 0-100
  fill: string;
}

export interface RevenueAnalytics {
  deliveredRevenue: number;
  deliveredOrders: number;
  averageOrderValue: number;
  totalOrders: number;
  pipelineRevenue: number; // placed but not yet delivered
  pipelineOrders: number;
  refundedAmount: number;
  refundedOrders: number;
  cancelledOrders: number;
  repeatCustomerRate: number | null; // % of delivered customers with 2+ delivered orders
  currentMonthRevenue: number;
  previousMonthRevenue: number;
  monthOverMonth: number | null; // % change, null when no previous-month baseline
  monthly: MonthlyRevenuePoint[];
  categories: CategoryRevenue[];
  statusBreakdown: { status: OrderStatus; count: number }[];
}

function monthKey(date: string): string | null {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function labelFor(key: string): string {
  const [y, m] = key.split("-").map(Number);
  return `${MONTH_LABELS[m - 1]} ${String(y).slice(2)}`;
}

/** Last `count` calendar months ending at `now`, oldest first. */
function recentMonthKeys(now: Date, count: number): string[] {
  const keys: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return keys;
}

function customerKey(order: Order): string {
  const a = order.shippingAddress;
  return (a?.phone || a?.name || order.id).replace(/\s+/g, "").toLowerCase();
}

export function computeRevenueAnalytics(orders: Order[], now = new Date(), months = 6): RevenueAnalytics {
  const delivered = orders.filter((o) => o.status === "Delivered");
  const pipeline = orders.filter((o) => !["Delivered", "Cancelled", "Refunded"].includes(o.status));
  const refunded = orders.filter((o) => o.status === "Refunded" || o.paymentStatus === "Refunded");

  const deliveredRevenue = delivered.reduce((s, o) => s + (Number(o.total) || 0), 0);

  // Monthly buckets: always show the recent window, plus any older month that has deliveries.
  const byMonth = new Map<string, MonthlyRevenuePoint>();
  for (const key of recentMonthKeys(now, months)) {
    byMonth.set(key, { key, month: labelFor(key), revenue: 0, orders: 0 });
  }
  for (const o of delivered) {
    const key = monthKey(o.date);
    if (!key) continue;
    const point = byMonth.get(key) ?? { key, month: labelFor(key), revenue: 0, orders: 0 };
    point.revenue += Number(o.total) || 0;
    point.orders += 1;
    byMonth.set(key, point);
  }
  const monthly = [...byMonth.values()].sort((a, b) => a.key.localeCompare(b.key));

  const [prevKey, currKey] = recentMonthKeys(now, 2);
  const currentMonthRevenue = byMonth.get(currKey)?.revenue ?? 0;
  const previousMonthRevenue = byMonth.get(prevKey)?.revenue ?? 0;
  const monthOverMonth =
    previousMonthRevenue > 0
      ? Math.round(((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 1000) / 10
      : null;

  // Category revenue from delivered line items (pre-discount item value).
  const catMap = new Map<string, { revenue: number; units: number }>();
  for (const o of delivered) {
    for (const item of o.items ?? []) {
      const name = item.category || "Uncategorised";
      const entry = catMap.get(name) ?? { revenue: 0, units: 0 };
      entry.revenue += (Number(item.price) || 0) * (Number(item.quantity) || 0);
      entry.units += Number(item.quantity) || 0;
      catMap.set(name, entry);
    }
  }
  const catTotal = [...catMap.values()].reduce((s, c) => s + c.revenue, 0);
  const categories = [...catMap.entries()]
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .map(([name, c], i) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, " "),
      revenue: c.revenue,
      units: c.units,
      share: catTotal ? Math.round((c.revenue / catTotal) * 1000) / 10 : 0,
      fill: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
    }));

  const perCustomer = new Map<string, number>();
  for (const o of delivered) perCustomer.set(customerKey(o), (perCustomer.get(customerKey(o)) ?? 0) + 1);
  const repeatCustomerRate = perCustomer.size
    ? Math.round(([...perCustomer.values()].filter((n) => n > 1).length / perCustomer.size) * 1000) / 10
    : null;

  const statusBreakdown = STATUS_ORDER.map((status) => ({
    status,
    count: orders.filter((o) => o.status === status).length,
  })).filter((s) => s.count > 0);

  return {
    deliveredRevenue,
    deliveredOrders: delivered.length,
    averageOrderValue: delivered.length ? Math.round(deliveredRevenue / delivered.length) : 0,
    totalOrders: orders.length,
    pipelineRevenue: pipeline.reduce((s, o) => s + (Number(o.total) || 0), 0),
    pipelineOrders: pipeline.length,
    refundedAmount: refunded.reduce((s, o) => s + (Number(o.total) || 0), 0),
    refundedOrders: refunded.length,
    cancelledOrders: orders.filter((o) => o.status === "Cancelled").length,
    repeatCustomerRate,
    currentMonthRevenue,
    previousMonthRevenue,
    monthOverMonth,
    monthly,
    categories,
    statusBreakdown,
  };
}
