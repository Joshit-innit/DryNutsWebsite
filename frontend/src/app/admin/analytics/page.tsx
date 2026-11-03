"use client";

import React, { useState, useEffect } from "react";
import { adminService } from "@/services/admin";
import { formatPrice } from "@/lib/utils";
import { RevenueAnalytics } from "@/lib/analytics";
import {
  BarChart,
  Bar,
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
import { DashboardSkeleton } from "@/components/ui/Skeleton";

const tooltipStyle = { borderRadius: "12px", border: "1px solid #E4E0D8", fontSize: "12px" };

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="h-72 w-full flex items-center justify-center rounded-2xl border border-dashed border-brand-border bg-brand-cream/50">
      <p className="text-xs text-brand-muted text-center max-w-xs px-4">{message}</p>
    </div>
  );
}

function KpiCard({ label, value, note, tone = "dark" }: { label: string; value: string; note: string; tone?: "dark" | "green" | "amber" }) {
  const toneClass = tone === "green" ? "text-brand-green" : tone === "amber" ? "text-amber-700" : "text-brand-dark";
  return (
    <div className="bg-white rounded-2xl p-5 border border-brand-border shadow-xs">
      <span className="text-xs font-bold uppercase text-brand-muted block mb-1">{label}</span>
      <span className={`font-semibold tracking-[-0.035em] text-2xl block ${toneClass}`}>{value}</span>
      <span className="text-xs text-brand-muted mt-1 block">{note}</span>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<RevenueAnalytics | null>(null);

  useEffect(() => {
    adminService.getRevenueAnalytics().then(setData);
  }, []);

  if (!data) {
    return <DashboardSkeleton label="Loading analytics" />;
  }

  const hasDeliveries = data.deliveredOrders > 0;
  const momNote =
    data.monthOverMonth === null
      ? `${formatPrice(data.currentMonthRevenue)} delivered this month`
      : `${data.monthOverMonth >= 0 ? "+" : ""}${data.monthOverMonth}% vs last month`;

  return (
    <div className="space-y-8 max-w-7xl">
      <div>
        <span className="text-xs uppercase font-semibold tracking-[0.08em] text-brand-muted">
          PERFORMANCE INTELLIGENCE
        </span>
        <h1 className="font-semibold tracking-[-0.035em] text-2xl sm:text-3xl text-brand-dark">
          Revenue Analytics
        </h1>
        <p className="text-xs text-brand-muted mt-0.5">
          Live figures from your orders database. Revenue counts only orders marked <strong>Delivered</strong>; cancelled and
          refunded orders are excluded.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard
          label="Delivered Revenue"
          value={formatPrice(data.deliveredRevenue)}
          note={`${data.deliveredOrders} delivered of ${data.totalOrders} orders · ${momNote}`}
          tone="green"
        />
        <KpiCard
          label="Average Order Value"
          value={hasDeliveries ? formatPrice(data.averageOrderValue) : "—"}
          note="Delivered orders only"
        />
        <KpiCard
          label="In Fulfilment"
          value={formatPrice(data.pipelineRevenue)}
          note={`${data.pipelineOrders} order${data.pipelineOrders === 1 ? "" : "s"} not yet delivered (not counted as revenue)`}
        />
        <KpiCard
          label="Refunds & Cancellations"
          value={formatPrice(data.refundedAmount)}
          note={`${data.refundedOrders} refunded · ${data.cancelledOrders} cancelled`}
          tone={data.refundedOrders || data.cancelledOrders ? "amber" : "dark"}
        />
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white rounded-3xl border border-brand-border p-6 shadow-xs space-y-4">
          <div>
            <h3 className="font-semibold tracking-[-0.025em] text-base text-brand-dark">Monthly Delivered Revenue</h3>
            <p className="text-xs text-brand-muted">Grouped by order date (₹ INR)</p>
          </div>
          {hasDeliveries ? (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.monthly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EBE7DF" vertical={false} />
                  <XAxis dataKey="month" stroke="#A29D93" fontSize={11} />
                  <YAxis
                    stroke="#A29D93"
                    fontSize={11}
                    tickFormatter={(v) => (v >= 1000 ? `₹${Math.round(v / 1000)}k` : `₹${v}`)}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(val: any, _name: any, item: any) => [
                      `${formatPrice(Number(val))} · ${item.payload.orders} order${item.payload.orders === 1 ? "" : "s"}`,
                      "Delivered",
                    ]}
                  />
                  <Bar dataKey="revenue" fill="#2D4A33" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChart message="No delivered orders yet. Revenue appears here once an order is marked Delivered." />
          )}
        </div>

        <div className="lg:col-span-5 bg-white rounded-3xl border border-brand-border p-6 shadow-xs space-y-4">
          <div>
            <h3 className="font-semibold tracking-[-0.025em] text-base text-brand-dark">Revenue by Category</h3>
            <p className="text-xs text-brand-muted">Share of delivered line-item value</p>
          </div>
          {data.categories.length ? (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.categories} cx="50%" cy="45%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="revenue" nameKey="name">
                    {data.categories.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(val: any, name: any, item: any) => [`${formatPrice(Number(val))} (${item.payload.share}%)`, name]}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChart message="Category split appears after the first delivered order." />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white rounded-3xl border border-brand-border p-6 shadow-xs space-y-4">
          <h3 className="font-semibold tracking-[-0.025em] text-base text-brand-dark">Orders by Status</h3>
          {data.statusBreakdown.length ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.statusBreakdown} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#EBE7DF" horizontal={false} />
                  <XAxis type="number" stroke="#A29D93" fontSize={11} allowDecimals={false} />
                  <YAxis dataKey="status" type="category" stroke="#A29D93" fontSize={10} width={110} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(val: any) => [val, "Orders"]} />
                  <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                    {data.statusBreakdown.map((s) => (
                      <Cell
                        key={s.status}
                        fill={s.status === "Delivered" ? "#2D4A33" : s.status === "Cancelled" || s.status === "Refunded" ? "#9C5B33" : "#B9853C"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChart message="No orders in the database yet." />
          )}
        </div>

        <div className="lg:col-span-5 bg-white rounded-3xl border border-brand-border p-6 shadow-xs space-y-4">
          <h3 className="font-semibold tracking-[-0.025em] text-base text-brand-dark">Category Breakdown</h3>
          {data.categories.length ? (
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] uppercase font-bold text-brand-muted border-b border-brand-border">
                <tr>
                  <th className="py-2">Category</th>
                  <th className="text-right">Units</th>
                  <th className="text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {data.categories.map((c) => (
                  <tr key={c.name}>
                    <td className="py-2.5 font-semibold text-brand-dark">
                      <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: c.fill }} />
                      {c.name}
                    </td>
                    <td className="text-right text-brand-muted">{c.units}</td>
                    <td className="text-right font-bold text-brand-dark">{formatPrice(c.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-xs text-brand-muted">Nothing delivered yet.</p>
          )}
          <p className="text-[11px] text-brand-muted border-t border-brand-border pt-3">
            Repeat-customer rate:{" "}
            <strong className="text-brand-dark">
              {data.repeatCustomerRate === null ? "—" : `${data.repeatCustomerRate}%`}
            </strong>{" "}
            of delivered customers have more than one delivered order.
          </p>
        </div>
      </div>
    </div>
  );
}
