"use client";

import React, { useState, useEffect } from "react";
import { cmdService } from "@/services/cmd";
import { SystemServiceStatus } from "@/types";
import { Activity, CheckCircle2, RefreshCw, Server, Database, Layers, ShieldCheck, Mail, Search, MessageSquare } from "lucide-react";
import { toast } from "sonner";

export default function CmdHealthPage() {
  const [services, setServices] = useState<SystemServiceStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    async function load() {
      const s = await cmdService.getServices();
      setServices(s);
      setLoading(false);
    }
    load();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise((res) => setTimeout(res, 500));
    const s = await cmdService.getServices();
    setServices(s);
    setRefreshing(false);
    toast.success("Health checks completed across all endpoints.");
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cmd-border pb-6">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-cmd-accent block mb-1">
            HEALTH MATRIX & DEPENDENCIES
          </span>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Service Health Checks ({services.length})
          </h1>
          <p className="text-xs text-cmd-muted mt-0.5">
            Liveness & readiness probes across core API, data stores, caches, and third-party fintech gateways.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="bg-cmd-card hover:bg-cmd-border text-white text-xs font-bold px-4 py-2 rounded-lg border border-cmd-border transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-cmd-accent" : ""}`} />
          <span>{refreshing ? "Probing Endpoints..." : "Ping All Services"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {services.map((srv, idx) => (
          <div
            key={idx}
            className="bg-cmd-card rounded-2xl border border-cmd-border p-5 space-y-4 flex flex-col justify-between hover:border-cmd-accent/40 transition-colors"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-cmd-muted uppercase tracking-wider">{srv.type}</span>
                <span className="inline-flex items-center gap-1 bg-cmd-green/10 text-cmd-green border border-cmd-green/30 px-2 py-0.5 rounded text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-cmd-green" /> {srv.status}
                </span>
              </div>
              <h3 className="font-bold text-sm text-white">{srv.name}</h3>
              <p className="text-[11px] font-mono text-cmd-muted truncate">{srv.endpoint}</p>
            </div>

            <div className="pt-3 border-t border-cmd-border/80 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-cmd-muted">Latency:</span>
                <span className="font-mono text-cmd-accent font-bold">{srv.latencyMs} ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-cmd-muted">Version:</span>
                <span className="font-mono text-white">{srv.version}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-cmd-muted">30d Uptime:</span>
                <span className="font-bold text-cmd-green">{srv.uptime}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
