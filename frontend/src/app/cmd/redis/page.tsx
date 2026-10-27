"use client";

import React from "react";
import { Layers, RefreshCw, Trash2, CheckCircle2, Zap } from "lucide-react";
import { toast } from "sonner";

export default function CmdRedisPage() {
  const handlePurgeTag = (tag: string) => {
    toast.success(`Cache tag purged: ${tag}`, {
      description: "Keys flushed from Redis in 1.2ms.",
    });
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="border-b border-cmd-border pb-6">
        <span className="text-[10px] uppercase font-bold tracking-widest text-cmd-accent block mb-1">
          HIGH-SPEED IN-MEMORY CACHE
        </span>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Layers className="w-6 h-6 text-cmd-accent" />
          <span>Redis 7.2 Cache Cluster</span>
        </h1>
        <p className="text-xs text-cmd-muted mt-0.5">
          Cluster Nodes: 3 Master + 3 Replica • Total Keys: 4,820 • Memory: 142 MB / 2048 MB
        </p>
      </div>

      {/* Redis Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-cmd-card rounded-2xl p-5 border border-cmd-border space-y-1">
          <span className="text-xs text-cmd-muted">Cache Hit Rate</span>
          <span className="text-xl font-bold text-cmd-green block">94.8%</span>
          <span className="text-[10px] text-cmd-green">48,920 hits / hr</span>
        </div>

        <div className="bg-cmd-card rounded-2xl p-5 border border-cmd-border space-y-1">
          <span className="text-xs text-cmd-muted">Memory Allocated</span>
          <span className="text-xl font-bold text-white block">142.4 MB</span>
          <span className="text-[10px] text-cmd-muted">Max memory: 2 GB</span>
        </div>

        <div className="bg-cmd-card rounded-2xl p-5 border border-cmd-border space-y-1">
          <span className="text-xs text-cmd-muted">Evicted Keys</span>
          <span className="text-xl font-bold text-cmd-green block">0</span>
          <span className="text-[10px] text-cmd-green">LRU policy active</span>
        </div>

        <div className="bg-cmd-card rounded-2xl p-5 border border-cmd-border space-y-1">
          <span className="text-xs text-cmd-muted">Average Latency</span>
          <span className="text-xl font-bold text-cmd-accent block">0.8 ms</span>
          <span className="text-[10px] text-cmd-green">Ultra low network overhead</span>
        </div>
      </div>

      {/* Active Keyspace Namespaces */}
      <div className="bg-cmd-card rounded-2xl border border-cmd-border p-6 space-y-4">
        <h3 className="text-sm font-bold text-white">Active Keyspaces & Purge Controls</h3>
        <div className="space-y-3">
          {[
            { tag: "catalog:categories", keys: 12, ttl: "24h", desc: "9 Core harvest taxonomy and combos" },
            { tag: "catalog:products:details", keys: 28, ttl: "1h", desc: "Product prices, MRP, and variant stock cached" },
            { tag: "auth:sessions", keys: 184, ttl: "7d", desc: "Active JWT session tokens and refresh cookies" },
            { tag: "cart:guest_sessions", keys: 420, ttl: "48h", desc: "Unauthenticated guest harvest baskets" },
          ].map((ns, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-cmd-bg border border-cmd-border flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <span className="font-mono text-xs font-bold text-cmd-accent block">{ns.tag}</span>
                <p className="text-[11px] text-cmd-muted mt-0.5">{ns.desc} • TTL: {ns.ttl}</p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-white font-bold">{ns.keys} keys</span>
                <button
                  onClick={() => handlePurgeTag(ns.tag)}
                  className="text-xs bg-cmd-card hover:bg-red-950 text-red-400 hover:text-red-300 font-bold px-3 py-1.5 rounded-lg border border-red-900/40 transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Purge Tag</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
