"use client";

import React, { useState, useEffect } from "react";
import { adminService } from "@/services/admin";
import { formatPrice } from "@/lib/utils";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
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
import { BarChart3, TrendingUp, DollarSign, Users, ShoppingCart, Percent } from "lucide-react";

export default function AdminAnalyticsPage() {
  const [chartData, setChartData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const c = await adminService.getRevenueChartData();
      const cat = await adminService.getCategoryShareData();
      setChartData(c);
      setCategoryData(cat);
      setLoading(false);
    }
    load();
  }, []);

  const conversionData = [
    { name: "Store Visits", users: 48200 },
    { name: "Product Views", users: 31400 },
    { name: "Added to Bag", users: 8900 },
    { name: "Initiated Checkout", users: 4200 },
    { name: "Completed Purchase", users: 3410 },
  ];

  return (
    <div className="space-y-8 max-w-7xl">
      <div>
        <span className="text-xs uppercase font-semibold tracking-[0.08em] text-brand-muted">
          PERFORMANCE INTELLIGENCE
        </span>
        <h1 className="font-semibold tracking-[-0.035em] text-2xl sm:text-3xl text-brand-dark">
          Revenue Analytics & Conversion Funnel
        </h1>
        <p className="text-xs text-brand-muted mt-0.5">
          Holistic metrics on average order values, category velocity, and checkout conversion.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-brand-border shadow-xs">
          <span className="text-xs font-bold uppercase text-brand-muted block mb-1">Average Order Value</span>
          <span className="font-semibold tracking-[-0.035em] text-2xl text-brand-dark block">₹1,840</span>
          <span className="text-xs font-semibold text-brand-green mt-1 block">+12.4% vs industry benchmark</span>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-brand-border shadow-xs">
          <span className="text-xs font-bold uppercase text-brand-muted block mb-1">Storefront Conversion</span>
          <span className="font-semibold tracking-[-0.035em] text-2xl text-brand-green block">7.07%</span>
          <span className="text-xs font-semibold text-brand-green mt-1 block">High intent food commerce</span>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-brand-border shadow-xs">
          <span className="text-xs font-bold uppercase text-brand-muted block mb-1">Repeat Customer Rate</span>
          <span className="font-semibold tracking-[-0.035em] text-2xl text-brand-dark block">38.2%</span>
          <span className="text-xs text-brand-muted mt-1 block">Monthly subscription & gifts</span>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-brand-border shadow-xs">
          <span className="text-xs font-bold uppercase text-brand-muted block mb-1">Cart Abandonment</span>
          <span className="font-semibold tracking-[-0.035em] text-2xl text-amber-700 block">18.8%</span>
          <span className="text-xs text-brand-muted mt-1 block">Well below 60% e-com avg</span>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Order Volume Bar Chart */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-brand-border p-6 shadow-xs space-y-4">
          <h3 className="font-semibold tracking-[-0.025em] text-base text-brand-dark">
            Monthly Order Count & Volume
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EBE7DF" />
                <XAxis dataKey="month" stroke="#A29D93" fontSize={11} />
                <YAxis stroke="#A29D93" fontSize={11} />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #E4E0D8", fontSize: "12px" }} />
                <Bar dataKey="orders" fill="#2D4A33" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* E-Commerce Funnel Chart */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-brand-border p-6 shadow-xs space-y-4">
          <h3 className="font-semibold tracking-[-0.025em] text-base text-brand-dark">
            Conversion Funnel Drop-off
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={conversionData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#EBE7DF" />
                <XAxis type="number" stroke="#A29D93" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="#A29D93" fontSize={10} width={100} />
                <Tooltip />
                <Bar dataKey="users" fill="#B9853C" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
