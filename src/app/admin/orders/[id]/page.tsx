"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { orderService } from "@/services/orders";
import { Order, OrderStatus } from "@/types";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, Truck, Package, MapPin, Printer } from "lucide-react";

export default function AdminOrderInspectPage() {
  const params = useParams();
  const id = params?.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await orderService.getOrderById(id);
      setOrder(data);
      setLoading(false);
    }
    load();
  }, [id]);

  const handleUpdateStatus = async (st: OrderStatus) => {
    if (!order) return;
    const updated = await orderService.updateOrderStatus(order.id, st);
    if (updated) {
      setOrder(updated);
      toast.success(`Fulfillment stage updated to: ${st}`);
    }
  };

  if (loading) return <div className="p-8 text-xs text-brand-muted">Loading order manifest...</div>;
  if (!order) return <div className="p-8 text-center">Order not found</div>;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between border-b border-brand-border pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="p-2 rounded-xl border border-brand-border bg-white text-brand-dark hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-brand-green">
              ORDER FULFILLMENT MANIFEST
            </span>
            <h1 className="font-serif font-black text-2xl text-brand-dark">
              Order #{order.orderNumber}
            </h1>
          </div>
        </div>

        <button
          onClick={() => toast.success("Printing warehouse packing slip...")}
          className="bg-white hover:bg-slate-50 border border-brand-border text-brand-dark text-xs font-bold px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5"
        >
          <Printer className="w-4 h-4" />
          <span>Print Packing Slip</span>
        </button>
      </div>

      {/* Stage Control Bar */}
      <div className="bg-white rounded-3xl border border-brand-border p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-brand-muted uppercase tracking-wider block mb-1">
            Current Stage
          </span>
          <span className="font-serif font-black text-xl text-brand-green">{order.status}</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {["Pending", "Confirmed", "Packed", "Shipped", "Out for Delivery", "Delivered"].map((st) => (
            <button
              key={st}
              onClick={() => handleUpdateStatus(st as OrderStatus)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                order.status === st
                  ? "bg-brand-green text-white shadow-xs"
                  : "bg-slate-100 hover:bg-slate-200 text-brand-dark"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Order Manifest Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-8 bg-white rounded-3xl border border-brand-border p-6 shadow-xs space-y-4">
          <h3 className="font-serif font-bold text-base text-brand-dark border-b border-brand-border pb-3">
            Reserved Items ({order.items.length})
          </h3>
          <div className="divide-y divide-brand-border">
            {order.items.map((item) => (
              <div key={item.productId} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-brand-cream overflow-hidden border border-brand-border flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-xs text-brand-dark">{item.name}</h4>
                    <p className="text-[10px] text-brand-muted">Weight: {item.weight} • SKU: {item.sku}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-brand-dark">{formatPrice(item.price * item.quantity)}</span>
                  <span className="text-[10px] text-brand-muted block">Qty: {item.quantity}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-brand-border space-y-1.5 text-xs text-brand-muted">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="text-brand-dark font-semibold">{formatPrice(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-brand-green">
                <span>Discount</span>
                <span>-{formatPrice(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold text-brand-dark pt-2 border-t border-brand-border">
              <span>Order Total</span>
              <span className="text-brand-green">{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        <div className="md:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl border border-brand-border p-6 shadow-xs space-y-3 text-xs">
            <h3 className="font-serif font-bold text-base text-brand-dark border-b border-brand-border pb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-green" />
              <span>Customer Shipping</span>
            </h3>
            <p className="font-bold text-brand-dark">{order.shippingAddress.name}</p>
            <p className="text-brand-muted leading-relaxed">
              {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
            </p>
            <p className="text-brand-dark font-medium">Phone: {order.shippingAddress.phone}</p>
          </div>

          <div className="bg-white rounded-3xl border border-brand-border p-6 shadow-xs space-y-2 text-xs">
            <h3 className="font-serif font-bold text-base text-brand-dark border-b border-brand-border pb-3">
              Logistics Waybill
            </h3>
            <p className="text-brand-muted">Courier: BlueDart Air Express</p>
            <p className="font-mono font-bold text-brand-dark">AWB: {order.trackingNumber}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
