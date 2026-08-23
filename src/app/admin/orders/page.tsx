"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { orderService } from "@/services/orders";
import { Order, OrderStatus } from "@/types";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";
import { ShoppingBag, Search, Filter, ExternalLink, ChevronRight } from "lucide-react";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      const data = await orderService.getOrders();
      setOrders(data);
      setLoading(false);
    }
    load();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    await orderService.updateOrderStatus(orderId, newStatus);
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    toast.success(`Order status updated to ${newStatus}`);
  };

  const filtered = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.shippingAddress.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-brand-green">
            FULFILLMENT PIPELINE
          </span>
          <h1 className="font-serif font-black text-2xl sm:text-3xl text-brand-dark">
            Customer Orders & Shipments
          </h1>
          <p className="text-xs text-brand-muted mt-0.5">
            Track order stages from harvest packing to final-mile air logistics.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-brand-border shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-brand-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search order number, customer name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-brand-border rounded-xl focus:outline-none focus:border-brand-green"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-brand-muted">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs p-2 bg-slate-50 border border-brand-border rounded-xl focus:outline-none focus:border-brand-green font-semibold cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Packed">Packed</option>
            <option value="Shipped">Shipped</option>
            <option value="Out for Delivery">Out for Delivery</option>
            <option value="Delivered">Delivered</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-brand-border shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[11px] uppercase font-bold text-brand-muted border-b border-brand-border">
              <tr>
                <th className="py-3 px-4">Order ID & Date</th>
                <th className="py-3 px-3">Customer & Contact</th>
                <th className="py-3 px-3">Harvest Items</th>
                <th className="py-3 px-3">Order Total</th>
                <th className="py-3 px-3">Payment</th>
                <th className="py-3 px-3">Fulfillment Stage</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {filtered.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-xs text-brand-dark block">
                      {ord.orderNumber}
                    </span>
                    <span className="text-[10px] text-brand-muted">{ord.date}</span>
                  </td>
                  <td className="py-3 px-3">
                    <p className="font-bold text-brand-dark">{ord.shippingAddress.name}</p>
                    <p className="text-[10px] text-brand-muted">{ord.shippingAddress.city}, {ord.shippingAddress.state}</p>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-medium text-brand-dark block">{ord.items.length} items</span>
                    <span className="text-[10px] text-brand-muted line-clamp-1">{ord.items[0]?.name}</span>
                  </td>
                  <td className="py-3 px-3 font-bold text-brand-dark">
                    {formatPrice(ord.total)}
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-medium text-brand-dark block">{ord.paymentMethod}</span>
                    <span className="text-[10px] text-brand-green font-bold bg-brand-green/10 px-1.5 py-0.5 rounded">
                      {ord.paymentStatus}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <select
                      value={ord.status}
                      onChange={(e) => handleStatusChange(ord.id, e.target.value as OrderStatus)}
                      className="text-xs p-1.5 bg-slate-100 border border-brand-border rounded-lg font-bold text-brand-dark focus:outline-none focus:border-brand-green cursor-pointer"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Packed">Packed</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Out for Delivery">Out for Delivery</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      href={`/admin/orders/${ord.id}`}
                      className="text-brand-green font-bold hover:underline inline-flex items-center gap-1"
                    >
                      <span>Inspect</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
