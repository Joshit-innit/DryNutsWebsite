"use client";

import React, { useState, useEffect } from "react";
import { adminService } from "@/services/admin";
import { Customer } from "@/types";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";
import { Users, Search, ShieldCheck, ShieldAlert, Check, X } from "lucide-react";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      const data = await adminService.getCustomers();
      setCustomers(data);
      setLoading(false);
    }
    load();
  }, []);

  const handleToggleStatus = async (id: string, name: string) => {
    const updated = await adminService.toggleCustomerStatus(id);
    if (updated) {
      setCustomers((prev) => prev.map((c) => (c.id === id ? updated : c)));
      toast.success(`Customer status for ${name} set to ${updated.status}`);
    }
  };

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-brand-green">
            MEMBERSHIP DIRECTORY
          </span>
          <h1 className="font-serif font-black text-2xl sm:text-3xl text-brand-dark">
            Customer Accounts ({customers.length})
          </h1>
          <p className="text-xs text-brand-muted mt-0.5">
            View customer order frequencies, lifetime harvest spend, and account states.
          </p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-brand-border shadow-xs flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-brand-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by customer name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-brand-border rounded-xl focus:outline-none focus:border-brand-green"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-brand-border shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-[11px] uppercase font-bold text-brand-muted border-b border-brand-border">
            <tr>
              <th className="py-3 px-4">Customer Name</th>
              <th className="py-3 px-3">Contact</th>
              <th className="py-3 px-3">Orders</th>
              <th className="py-3 px-3">Total Spend</th>
              <th className="py-3 px-3">Joined Date</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {filtered.map((cust) => (
              <tr key={cust.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-brand-green/20 text-brand-green font-bold flex items-center justify-center">
                      {cust.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-brand-dark">{cust.name}</p>
                      <p className="text-[10px] text-brand-muted">{cust.email}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-3 text-brand-dark">{cust.phone}</td>
                <td className="py-3 px-3 font-bold">{cust.totalOrders} orders</td>
                <td className="py-3 px-3 font-bold text-brand-green">{formatPrice(cust.totalSpend)}</td>
                <td className="py-3 px-3 text-brand-muted">{cust.joinedDate}</td>
                <td className="py-3 px-3">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      cust.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {cust.status === "active" ? "Active Member" : "Suspended"}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => handleToggleStatus(cust.id, cust.name)}
                    className={`text-xs font-bold px-3 py-1 rounded-lg transition-colors ${
                      cust.status === "active"
                        ? "text-red-500 hover:bg-red-50"
                        : "text-brand-green hover:bg-brand-green/10"
                    }`}
                  >
                    {cust.status === "active" ? "Suspend" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
