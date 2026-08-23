"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useStore } from "@/context/StoreContext";
import { orderService } from "@/services/orders";
import { Order } from "@/types";
import { formatPrice } from "@/lib/utils";
import {
  User,
  ShoppingBag,
  Heart,
  MapPin,
  Shield,
  LogOut,
  ChevronRight,
  Package,
  Clock,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export default function AccountDashboardPage() {
  const { user, wishlist } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await orderService.getOrders();
      setOrders(data);
      setLoading(false);
    }
    load();
  }, []);

  const latestOrder = orders[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Account Header */}
      <div className="bg-white rounded-3xl border border-brand-border p-6 sm:p-8 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-green text-white flex items-center justify-center font-serif font-black text-2xl shadow-sm">
            {user?.name?.charAt(0) || "C"}
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-brand-green">
              CONNOISSEUR MEMBER
            </span>
            <h1 className="font-serif font-black text-2xl sm:text-3xl text-brand-dark">
              Welcome back, {user?.name || "Chandu"}
            </h1>
            <p className="text-xs text-brand-muted mt-0.5">{user?.email || "chandu@nutrination.in"}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/account/orders"
            className="bg-brand-green hover:bg-brand-green-dark text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-colors"
          >
            My Orders
          </Link>
          <Link
            href="/account/wishlist"
            className="bg-brand-cream hover:bg-brand-beige text-brand-dark text-xs font-bold px-5 py-2.5 rounded-xl border border-brand-border transition-colors"
          >
            Wishlist ({wishlist.length})
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Sidebar Menu */}
        <aside className="lg:col-span-4 bg-white rounded-3xl border border-brand-border p-6 shadow-xs space-y-2">
          <Link
            href="/account"
            className="flex items-center justify-between p-3 rounded-xl bg-brand-green/10 text-brand-green font-bold text-xs"
          >
            <div className="flex items-center gap-2.5">
              <User className="w-4 h-4" />
              <span>Overview Dashboard</span>
            </div>
            <ChevronRight className="w-4 h-4" />
          </Link>

          <Link
            href="/account/orders"
            className="flex items-center justify-between p-3 rounded-xl text-brand-dark hover:bg-brand-cream font-semibold text-xs transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Package className="w-4 h-4 text-brand-muted" />
              <span>Order History & Tracking</span>
            </div>
            <ChevronRight className="w-4 h-4 text-brand-muted" />
          </Link>

          <Link
            href="/account/wishlist"
            className="flex items-center justify-between p-3 rounded-xl text-brand-dark hover:bg-brand-cream font-semibold text-xs transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Heart className="w-4 h-4 text-brand-muted" />
              <span>Saved Wishlist</span>
            </div>
            <span className="text-xs font-bold bg-brand-saffron/20 px-2 py-0.5 rounded-full text-brand-dark">
              {wishlist.length}
            </span>
          </Link>

          <div className="pt-4 border-t border-brand-border">
            <button className="flex items-center gap-2.5 p-3 rounded-xl text-red-500 hover:bg-red-50 font-bold text-xs w-full transition-colors">
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Right Dashboard Content */}
        <div className="lg:col-span-8 space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-brand-border shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-muted">Total Orders</span>
                <ShoppingBag className="w-4 h-4 text-brand-green" />
              </div>
              <span className="font-serif font-black text-2xl text-brand-dark">{orders.length + 2}</span>
              <p className="text-[11px] text-brand-muted mt-1">All fulfilled safely</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-brand-border shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-muted">Wishlist Items</span>
                <Heart className="w-4 h-4 text-brand-orange" />
              </div>
              <span className="font-serif font-black text-2xl text-brand-dark">{wishlist.length}</span>
              <p className="text-[11px] text-brand-muted mt-1">Saved dry fruits</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-brand-border shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-muted">Saved Addresses</span>
                <MapPin className="w-4 h-4 text-brand-saffron" />
              </div>
              <span className="font-serif font-black text-2xl text-brand-dark">2</span>
              <p className="text-[11px] text-brand-muted mt-1">Home & Office</p>
            </div>
          </div>

          {/* Active Order Card */}
          {latestOrder && (
            <div className="bg-white rounded-3xl border border-brand-border p-6 sm:p-8 shadow-card space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-brand-border">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-green">
                    ACTIVE HARVEST SHIPMENT
                  </span>
                  <h3 className="font-serif font-bold text-lg text-brand-dark">
                    Order #{latestOrder.orderNumber}
                  </h3>
                </div>
                <span className="bg-brand-saffron/20 text-brand-dark font-bold text-xs px-3 py-1 rounded-full">
                  {latestOrder.status}
                </span>
              </div>

              <div className="divide-y divide-brand-border">
                {latestOrder.items.map((it) => (
                  <div key={it.productId} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-brand-cream overflow-hidden border border-brand-border">
                        <img src={it.image} alt={it.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="font-serif font-bold text-xs text-brand-dark">{it.name}</h4>
                        <p className="text-[11px] text-brand-muted">{it.weight} • Qty: {it.quantity}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-brand-dark">{formatPrice(it.price * it.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex items-center justify-between text-xs">
                <span className="text-brand-muted">Total: <strong>{formatPrice(latestOrder.total)}</strong></span>
                <Link
                  href={`/account/orders/${latestOrder.id}`}
                  className="text-brand-green font-bold hover:underline flex items-center gap-1"
                >
                  <span>Track Live Delivery Status</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
