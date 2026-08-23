"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { orderService } from "@/services/orders";
import { Order, OrderStatus } from "@/types";
import { formatPrice } from "@/lib/utils";
import { Package, ArrowRight, Clock, CheckCircle2, ChevronRight } from "lucide-react";

export default function AccountOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  useEffect(() => {
    async function load() {
      const data = await orderService.getOrders();
      setOrders(data);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = statusFilter === "ALL" ? orders : orders.filter((o) => o.status === statusFilter);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-brand-muted">
        <Link href="/account" className="hover:text-brand-green">My Account</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-brand-dark font-semibold">Order History & Tracking</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border pb-6">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-brand-green">
            YOUR PURCHASES
          </span>
          <h1 className="font-serif font-black text-3xl text-brand-dark">
            Order History & Tracking
          </h1>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2">
          {["ALL", "Out for Delivery", "Delivered"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                statusFilter === st
                  ? "bg-brand-green text-white border-brand-green shadow-xs"
                  : "bg-white text-brand-dark border-brand-border hover:border-brand-muted"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="h-40 bg-white rounded-3xl border border-brand-border" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-brand-border">
          <Package className="w-12 h-12 text-brand-green/60 mx-auto mb-2" />
          <h3 className="font-serif font-bold text-lg text-brand-dark">No orders found</h3>
          <p className="text-xs text-brand-muted mt-1 mb-4">You have no orders matching this filter.</p>
          <Link href="/products" className="bg-brand-green text-white text-xs font-bold px-6 py-2.5 rounded-xl">
            Explore Harvests
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {filtered.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-3xl border border-brand-border p-6 sm:p-8 shadow-card space-y-5"
            >
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-brand-border text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-green/10 text-brand-green flex items-center justify-center font-bold">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base text-brand-dark">
                      Order #{order.orderNumber}
                    </h3>
                    <span className="text-brand-muted">Placed on {order.date}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="bg-brand-saffron/20 text-brand-dark font-bold px-3 py-1 rounded-full text-xs">
                    {order.status}
                  </span>
                  <span className="font-black text-base text-brand-dark">{formatPrice(order.total)}</span>
                </div>
              </div>

              {/* Items List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {order.items.map((item) => (
                  <div key={item.productId} className="flex items-center gap-3 p-2 rounded-xl bg-brand-cream/30 border border-brand-border/60">
                    <div className="w-14 h-14 rounded-xl bg-white overflow-hidden border border-brand-border flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-serif font-bold text-xs text-brand-dark line-clamp-1">{item.name}</h4>
                      <p className="text-[11px] text-brand-muted">{item.weight} • Qty: {item.quantity}</p>
                      <p className="text-xs font-semibold text-brand-green mt-0.5">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-brand-border flex items-center justify-between text-xs">
                <span className="text-brand-muted">
                  Paid via <strong>{order.paymentMethod}</strong> ({order.paymentStatus})
                </span>
                <Link
                  href={`/account/orders/${order.id}`}
                  className="bg-brand-green hover:bg-brand-green-dark text-white font-bold px-5 py-2.5 rounded-xl transition-all flex items-center gap-1.5"
                >
                  <span>Track Live Delivery Timeline</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
