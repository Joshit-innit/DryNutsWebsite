"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { adminService } from "@/services/admin";
import { orderService } from "@/services/orders";
import { productService } from "@/services/products";
import { formatPrice } from "@/lib/utils";
import { Order, Product } from "@/types";
import {
  DollarSign,
  ShoppingBag,
  Users,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Package,
  Plus,
  ChevronRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [topProducts, setTopProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const m = await adminService.getDashboardMetrics();
      const c = await adminService.getRevenueChartData();
      const cat = await adminService.getCategoryShareData();
      const ord = await orderService.getOrders();
      const prods = await productService.getBestSellers();

      setMetrics(m);
      setChartData(c);
      setCategoryData(cat);
      setRecentOrders(ord.slice(0, 5));
      setTopProducts(prods.slice(0, 4));
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return <div className="p-8 text-xs text-brand-muted animate-pulse">Loading business intelligence...</div>;
  }

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-brand-green">
            STORE OPERATIONS
          </span>
          <h1 className="font-serif font-black text-2xl sm:text-3xl text-brand-dark">
            Executive Business Dashboard
          </h1>
          <p className="text-xs text-brand-muted mt-0.5">
            Real-time revenue, order fulfillment pipelines, and harvest inventory metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products/new"
            className="bg-brand-green hover:bg-brand-green-dark text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-brand-border shadow-xs">
          <div className="flex items-center justify-between text-brand-muted mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Gross Revenue (MTD)</span>
            <div className="w-8 h-8 rounded-lg bg-brand-green/10 text-brand-green flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <span className="font-serif font-black text-2xl text-brand-dark block">
            {formatPrice(metrics.totalRevenue)}
          </span>
          <span className="text-xs font-semibold text-brand-green flex items-center gap-1 mt-1">
            <TrendingUp className="w-3.5 h-3.5" /> {metrics.revenueGrowth}
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-brand-border shadow-xs">
          <div className="flex items-center justify-between text-brand-muted mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Orders</span>
            <div className="w-8 h-8 rounded-lg bg-brand-saffron/20 text-brand-dark flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <span className="font-serif font-black text-2xl text-brand-dark block">
            {metrics.totalOrders}
          </span>
          <span className="text-xs font-semibold text-brand-green flex items-center gap-1 mt-1">
            <TrendingUp className="w-3.5 h-3.5" /> {metrics.ordersGrowth}
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-brand-border shadow-xs">
          <div className="flex items-center justify-between text-brand-muted mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Customers</span>
            <div className="w-8 h-8 rounded-lg bg-brand-orange/10 text-brand-orange flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <span className="font-serif font-black text-2xl text-brand-dark block">
            {metrics.totalCustomers}
          </span>
          <span className="text-xs font-semibold text-brand-green flex items-center gap-1 mt-1">
            <TrendingUp className="w-3.5 h-3.5" /> {metrics.customersGrowth}
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-brand-border shadow-xs">
          <div className="flex items-center justify-between text-brand-muted mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Low Stock Warnings</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <span className="font-serif font-black text-2xl text-amber-700 block">
            {metrics.lowStockCount} Items
          </span>
          <Link href="/admin/inventory" className="text-xs text-brand-green hover:underline font-bold mt-1 inline-block">
            Review Stock Thresholds →
          </Link>
        </div>
      </div>

      {/* Recharts Data Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Revenue Performance Area Chart */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-brand-border p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-brand-border pb-3">
            <div>
              <h3 className="font-serif font-bold text-base text-brand-dark">
                Monthly Revenue & Demand Trends
              </h3>
              <p className="text-xs text-brand-muted">FY 2026 Sales Run Rate (in ₹ INR)</p>
            </div>
            <span className="text-xs font-bold text-brand-green bg-brand-green/10 px-2.5 py-1 rounded-full">
              Avg Order Value: ₹1,840
            </span>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4B8F27" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#4B8F27" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString("en-IN")}`, "Gross Sales"]}
                  contentStyle={{ borderRadius: "12px", border: "1px solid #E2E8F0", fontSize: "12px" }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#4B8F27"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#revenueGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Share Donut Chart */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-brand-border p-6 shadow-xs space-y-4">
          <div className="border-b border-brand-border pb-3">
            <h3 className="font-serif font-bold text-base text-brand-dark">
              Category Sales Volume
            </h3>
            <p className="text-xs text-brand-muted">By total kilogram weight sold</p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="45%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => [`${val}%`, "Share"]} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Lower Row: Recent Orders Table & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-brand-border p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-brand-border pb-3">
            <h3 className="font-serif font-bold text-base text-brand-dark">
              Recent Fulfillment Orders
            </h3>
            <Link href="/admin/orders" className="text-xs text-brand-green hover:underline font-bold">
              View All Orders →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] uppercase font-bold text-brand-muted border-b border-brand-border pb-2">
                <tr>
                  <th className="py-2">Order</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 font-mono font-bold text-brand-dark">{ord.orderNumber}</td>
                    <td>
                      <p className="font-bold text-brand-dark">{ord.shippingAddress.name}</p>
                      <p className="text-[10px] text-brand-muted">{ord.shippingAddress.city}</p>
                    </td>
                    <td>{ord.items.length} items</td>
                    <td className="font-bold text-brand-dark">{formatPrice(ord.total)}</td>
                    <td>
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-green/10 text-brand-green">
                        {ord.status}
                      </span>
                    </td>
                    <td>
                      <Link
                        href={`/admin/orders/${ord.id}`}
                        className="text-brand-green font-bold hover:underline"
                      >
                        Inspect
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Performing Harvests */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-brand-border p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-brand-border pb-3">
            <h3 className="font-serif font-bold text-base text-brand-dark">
              Top Selling Harvests
            </h3>
            <Link href="/admin/products" className="text-xs text-brand-green hover:underline font-bold">
              Catalog
            </Link>
          </div>

          <div className="space-y-3">
            {topProducts.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-50 border border-brand-border">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-brand-cream border border-brand-border flex-shrink-0">
                    <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-xs text-brand-dark line-clamp-1">{p.name}</h4>
                    <p className="text-[10px] text-brand-muted">{p.categoryName} • {p.variants[0].stock} in stock</p>
                  </div>
                </div>
                <span className="font-bold text-xs text-brand-dark">{formatPrice(p.variants[0].price)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
