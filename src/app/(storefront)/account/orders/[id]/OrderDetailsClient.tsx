"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { orderService } from "@/services/orders";
import { Order } from "@/types";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";
import { SAMPLE_ORDERS } from "@/data/mockData";
import {
  Package,
  CheckCircle2,
  Clock,
  Truck,
  MapPin,
  Download,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export default function OrderDetailsPage() {
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

  const handleDownloadInvoice = () => {
    toast.success("Downloading Tax Invoice PDF...", {
      description: `Invoice for Order #${order?.orderNumber} generated.`,
    });
  };

  if (loading) {
    return <div className="max-w-4xl mx-auto py-20 text-center text-xs text-brand-muted">Loading order timeline...</div>;
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center space-y-4">
        <h2 className="font-serif font-bold text-2xl text-brand-dark">Order Not Found</h2>
        <Link href="/account/orders" className="text-xs font-bold text-brand-green hover:underline">
          Back to Order History
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-brand-muted">
        <Link href="/account" className="hover:text-brand-green">My Account</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/account/orders" className="hover:text-brand-green">Orders</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-brand-dark font-semibold">#{order.orderNumber}</span>
      </div>

      {/* Header */}
      <div className="bg-white rounded-3xl border border-brand-border p-6 sm:p-8 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-brand-green">
            SHIPMENT STATUS: {order.status.toUpperCase()}
          </span>
          <h1 className="font-serif font-black text-2xl sm:text-3xl text-brand-dark">
            Order #{order.orderNumber}
          </h1>
          <p className="text-xs text-brand-muted mt-1">
            Placed on {order.date} • Courier Airway Bill: <strong className="text-brand-dark">{order.trackingNumber}</strong>
          </p>
        </div>

        <button
          onClick={handleDownloadInvoice}
          className="bg-brand-cream hover:bg-brand-beige text-brand-dark border border-brand-border text-xs font-bold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          <span>Download Invoice</span>
        </button>
      </div>

      {/* Live 6-Stage Delivery Timeline */}
      <div className="bg-white rounded-3xl border border-brand-border p-6 sm:p-10 shadow-card space-y-8">
        <h2 className="font-serif font-bold text-lg text-brand-dark flex items-center gap-2">
          <Truck className="w-5 h-5 text-brand-green" />
          <span>Live Tracking & Transit Milestones</span>
        </h2>

        <div className="relative pl-6 sm:pl-8 border-l-2 border-brand-green/30 space-y-8 my-4">
          {order.timeline.map((step, idx) => (
            <div key={idx} className="relative">
              {/* Step Node Icon */}
              <div
                className={`absolute -left-[31px] sm:-left-[39px] top-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs transition-all ${
                  step.isCompleted
                    ? "bg-brand-green text-white shadow-sm"
                    : step.isCurrent
                    ? "bg-brand-saffron text-brand-dark ring-4 ring-brand-saffron/30 animate-pulse font-black"
                    : "bg-white border-2 border-brand-border text-brand-muted"
                }`}
              >
                {step.isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
              </div>

              <div className="space-y-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h4 className={`text-sm font-bold ${step.isCurrent ? "text-brand-green" : "text-brand-dark"}`}>
                    {step.label}
                  </h4>
                  {step.timestamp && (
                    <span className="text-[11px] font-semibold text-brand-muted">
                      {step.timestamp}
                    </span>
                  )}
                </div>
                <p className="text-xs text-brand-muted leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grid: Order Items + Shipping Address */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Items List */}
        <div className="md:col-span-7 bg-white rounded-3xl border border-brand-border p-6 shadow-xs space-y-4">
          <h3 className="font-serif font-bold text-base text-brand-dark border-b border-brand-border pb-3">
            Reserved Harvest Items ({order.items.length})
          </h3>
          <div className="divide-y divide-brand-border">
            {order.items.map((item) => (
              <div key={item.productId} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-brand-cream overflow-hidden border border-brand-border flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-xs text-brand-dark">{item.name}</h4>
                    <p className="text-[11px] text-brand-muted">{item.weight} • Qty: {item.quantity}</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-brand-dark">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-brand-border space-y-1.5 text-xs text-brand-muted">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="text-brand-dark font-medium">{formatPrice(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-brand-green">
                <span>Discount Applied</span>
                <span>-{formatPrice(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Delivery</span>
              <span>{order.deliveryFee === 0 ? "FREE" : formatPrice(order.deliveryFee)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-brand-dark pt-2 border-t border-brand-border">
              <span>Total Paid</span>
              <span className="text-brand-green">{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Shipping Address & Payment Info */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-brand-border p-6 shadow-xs space-y-3 text-xs">
            <h3 className="font-serif font-bold text-base text-brand-dark border-b border-brand-border pb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-green" />
              <span>Delivery Address</span>
            </h3>
            <p className="font-bold text-brand-dark">{order.shippingAddress.name}</p>
            <p className="text-brand-muted leading-relaxed">
              {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
            </p>
            <p className="text-brand-dark">Contact: {order.shippingAddress.phone}</p>
          </div>

          <div className="bg-white rounded-3xl border border-brand-border p-6 shadow-xs space-y-3 text-xs">
            <h3 className="font-serif font-bold text-base text-brand-dark border-b border-brand-border pb-3">
              Payment Summary
            </h3>
            <div className="flex justify-between">
              <span className="text-brand-muted">Method:</span>
              <span className="font-bold text-brand-dark">{order.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-muted">Status:</span>
              <span className="text-brand-green font-bold bg-brand-green/10 px-2 py-0.5 rounded-full text-[10px]">
                {order.paymentStatus}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
