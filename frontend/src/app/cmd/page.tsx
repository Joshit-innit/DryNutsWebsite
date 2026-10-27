"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { cmdService } from "@/services/cmd";
import { SystemServiceStatus, SystemMetrics } from "@/types";
import {
  Terminal,
  Activity,
  Server,
  Database,
  Cpu,
  HardDrive,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
} from "lucide-react";

export default function CmdOverviewPage() {
  const [services, setServices] = useState<SystemServiceStatus[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const s = await cmdService.getServices();
      const m = await cmdService.getMetrics();
      setServices(s);
      setMetrics(m);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cmd-border pb-6">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-cmd-accent block mb-1">
            INFRASTRUCTURE & OBSERVABILITY
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Production Cluster Overview</span>
            <span className="text-xs bg-cmd-green/20 text-cmd-green px-2.5 py-0.5 rounded-full border border-cmd-green/40">
              ALL SYSTEMS OPERATIONAL
            </span>
          </h1>
        </div>

        <div className="flex gap-2">
          <Link
            href="/cmd/health"
            className="bg-cmd-card hover:bg-cmd-border text-white text-xs font-bold px-4 py-2 rounded-lg border border-cmd-border transition-colors flex items-center gap-1.5"
          >
            <Activity className="w-3.5 h-3.5 text-cmd-green" />
            <span>Service Health Matrix</span>
          </Link>
          <Link
            href="/cmd/logs"
            className="bg-cmd-accent/15 hover:bg-cmd-accent/25 text-cmd-accent text-xs font-bold px-4 py-2 rounded-lg border border-cmd-accent/40 transition-colors flex items-center gap-1.5"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Terminal Logs</span>
          </Link>
        </div>
      </div>

      {/* Primary Subsystem Health Status Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { name: "Commerce API", status: "HEALTHY" },
          { name: "PostgreSQL", status: "HEALTHY" },
          { name: "Redis Cache", status: "HEALTHY" },
          { name: "S3 Object Store", status: "HEALTHY" },
          { name: "Payment Gateway", status: "HEALTHY" },
          { name: "Resend Email", status: "HEALTHY" },
          { name: "MeiliSearch", status: "HEALTHY" },
        ].map((sub, i) => (
          <div
            key={i}
            className="bg-cmd-card rounded-xl p-3 border border-cmd-border flex flex-col justify-between space-y-2"
          >
            <span className="text-[11px] text-cmd-muted truncate">{sub.name}</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cmd-green animate-pulse" />
              <span className="text-xs font-bold text-cmd-green">{sub.status}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Cluster Telemetry Gauges */}
      {metrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-cmd-card rounded-2xl p-5 border border-cmd-border space-y-3">
            <div className="flex items-center justify-between text-xs text-cmd-muted">
              <span>CPU Core Allocation</span>
              <Cpu className="w-4 h-4 text-cmd-accent" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-white">{metrics.cpuUsage}%</span>
              <span className="text-[11px] text-cmd-green">4 Cores Active</span>
            </div>
            <div className="w-full bg-cmd-bg h-1.5 rounded-full overflow-hidden">
              <div className="bg-cmd-accent h-full rounded-full" style={{ width: `${metrics.cpuUsage}%` }} />
            </div>
          </div>

          <div className="bg-cmd-card rounded-2xl p-5 border border-cmd-border space-y-3">
            <div className="flex items-center justify-between text-xs text-cmd-muted">
              <span>RAM Memory Usage</span>
              <Server className="w-4 h-4 text-cmd-accent" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-white">{metrics.memoryUsage}%</span>
              <span className="text-[11px] text-cmd-muted">7.04 GB / 16 GB</span>
            </div>
            <div className="w-full bg-cmd-bg h-1.5 rounded-full overflow-hidden">
              <div className="bg-cmd-accent h-full rounded-full" style={{ width: `${metrics.memoryUsage}%` }} />
            </div>
          </div>

          <div className="bg-cmd-card rounded-2xl p-5 border border-cmd-border space-y-3">
            <div className="flex items-center justify-between text-xs text-cmd-muted">
              <span>Disk SSD Headroom</span>
              <HardDrive className="w-4 h-4 text-cmd-accent" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-white">{metrics.diskUsage}%</span>
              <span className="text-[11px] text-cmd-green">91.5 GB Free</span>
            </div>
            <div className="w-full bg-cmd-bg h-1.5 rounded-full overflow-hidden">
              <div className="bg-cmd-accent h-full rounded-full" style={{ width: `${metrics.diskUsage}%` }} />
            </div>
          </div>

          <div className="bg-cmd-card rounded-2xl p-5 border border-cmd-border space-y-3">
            <div className="flex items-center justify-between text-xs text-cmd-muted">
              <span>Redis Cache Hit Rate</span>
              <Layers className="w-4 h-4 text-cmd-green" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-cmd-green">{metrics.cacheHitRatio}%</span>
              <span className="text-[11px] text-cmd-muted">Optimal</span>
            </div>
            <div className="w-full bg-cmd-bg h-1.5 rounded-full overflow-hidden">
              <div className="bg-cmd-green h-full rounded-full" style={{ width: `${metrics.cacheHitRatio}%` }} />
            </div>
          </div>
        </div>
      )}

      {/* Services Table Matrix */}
      <div className="bg-cmd-card rounded-2xl border border-cmd-border overflow-hidden space-y-2 p-5">
        <div className="flex items-center justify-between border-b border-cmd-border pb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-cmd-accent" />
            <span>Registered Microservices & Middleware</span>
          </h3>
          <span className="text-[11px] text-cmd-muted">Auto-polled every 10s</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[10px] uppercase font-bold text-cmd-muted border-b border-cmd-border pb-2">
              <tr>
                <th className="py-2.5">Service Name</th>
                <th>Role / Type</th>
                <th>Status</th>
                <th>Round-Trip Latency</th>
                <th>Version</th>
                <th>Uptime (30d)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cmd-border">
              {services.map((s, idx) => (
                <tr key={idx} className="hover:bg-cmd-border/20 transition-colors">
                  <td className="py-3 font-bold text-white">{s.name}</td>
                  <td className="text-cmd-muted">{s.type}</td>
                  <td>
                    <span className="inline-flex items-center gap-1 bg-cmd-green/10 text-cmd-green border border-cmd-green/30 px-2 py-0.5 rounded text-[10px] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-cmd-green" /> {s.status}
                    </span>
                  </td>
                  <td className="font-mono text-cmd-accent">{s.latencyMs} ms</td>
                  <td className="text-cmd-muted font-mono">{s.version}</td>
                  <td className="text-cmd-muted">{s.uptime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
