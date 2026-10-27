"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Terminal,
  Activity,
  Server,
  Database,
  Layers,
  FileCode2,
  Clock,
  GitBranch,
  ShieldAlert,
  Cpu,
  History,
  LogOut,
  ChevronRight,
} from "lucide-react";

export default function CmdSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { label: "Overview", href: "/cmd", icon: Terminal },
    { label: "Health Checks", href: "/cmd/health", icon: Activity },
    { label: "Services Registry", href: "/cmd/services", icon: Server },
    { label: "PostgreSQL Cluster", href: "/cmd/database", icon: Database },
    { label: "Redis In-Memory", href: "/cmd/redis", icon: Layers },
    { label: "Terminal Logs", href: "/cmd/logs", icon: FileCode2 },
    { label: "Background Jobs", href: "/cmd/jobs", icon: Clock },
    { label: "Deployments", href: "/cmd/deployments", icon: GitBranch },
    { label: "Security & WAF", href: "/cmd/security", icon: ShieldAlert },
    { label: "Diagnostics", href: "/cmd/diagnostics", icon: Cpu },
    { label: "Audit Compliance", href: "/cmd/audit", icon: History },
  ];

  return (
    <aside className="w-64 bg-cmd-card border-r border-cmd-border flex flex-col justify-between h-[calc(100vh-33px)] sticky top-[33px] p-4 font-mono text-cmd-text">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 px-2 py-2 border-b border-cmd-border pb-4">
          <div className="w-8 h-8 rounded-lg bg-cmd-accent/20 border border-cmd-accent/40 text-cmd-accent flex items-center justify-center font-bold text-sm">
            &gt;_
          </div>
          <div>
            <span className="font-bold text-sm text-white tracking-wider block">
              NUTRINATION CMD
            </span>
            <span className="text-[10px] text-cmd-green uppercase tracking-widest block font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cmd-green animate-ping" />
              CLUSTER HEALTHY
            </span>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="space-y-1 overflow-y-auto max-h-[calc(100vh-220px)] pr-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/cmd" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${
                  isActive
                    ? "bg-cmd-accent/15 border border-cmd-accent/40 text-white font-bold"
                    : "text-cmd-muted hover:text-white hover:bg-cmd-border/30"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? "text-cmd-accent" : "text-cmd-muted"}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-cmd-accent" />}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-cmd-border/80 flex items-center justify-between px-2 text-[11px] text-cmd-muted">
        <div>
          <p className="font-bold text-white">dev-lead@nutrination</p>
          <p className="text-[10px]">env: production (ap-south-1)</p>
        </div>
        <Link href="/" className="text-cmd-muted hover:text-white p-1" title="Exit to Storefront">
          <LogOut className="w-4 h-4" />
        </Link>
      </div>
    </aside>
  );
}
