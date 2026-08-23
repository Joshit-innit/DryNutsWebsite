import React from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Route protection is handled by src/middleware.ts via HttpOnly cookie check.
  // The middleware redirects unauthenticated users to /admin/login before this
  // layout ever renders, so no client-side check is needed here.
  return (
    <div className="flex min-h-screen bg-slate-50 antialiased">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader />
        <main className="p-6 md:p-8 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
