"use client";

import React, { useState, useEffect } from "react";
import { cmdService } from "@/services/cmd";
import { AuditEntry } from "@/types";
import { History, Search, Filter, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function CmdAuditPage() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      const data = await cmdService.getAuditLogs();
      setLogs(data);
    }
    load();
  }, []);

  const filtered = logs.filter((l) => {
    const matchesRole = roleFilter === "ALL" || l.role === roleFilter;
    const matchesSearch =
      l.actor.toLowerCase().includes(search.toLowerCase()) ||
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.resource.toLowerCase().includes(search.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="border-b border-cmd-border pb-6">
        <span className="text-[10px] uppercase font-bold tracking-widest text-cmd-accent block mb-1">
          COMPLIANCE & TRACEABILITY
        </span>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <History className="w-6 h-6 text-cmd-accent" />
          <span>Immutable Audit Logs & Actor Activity</span>
        </h1>
        <p className="text-xs text-cmd-muted mt-0.5">
          Cryptographically timestamped record of administrative, price changes, and DevOps triggers.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-cmd-card p-4 rounded-xl border border-cmd-border flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-cmd-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search actor, action, resource, request ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-cmd-bg border border-cmd-border rounded-lg text-white placeholder:text-cmd-muted focus:outline-none focus:border-cmd-accent font-mono text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-cmd-muted">Role Filter:</span>
          {["ALL", "admin", "developer", "customer"].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase transition-colors ${
                roleFilter === r ? "bg-cmd-accent text-cmd-bg" : "bg-cmd-bg text-cmd-muted hover:text-white"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Table */}
      <div className="bg-cmd-card rounded-2xl border border-cmd-border overflow-hidden p-5">
        <table className="w-full text-left text-xs font-mono">
          <thead className="text-[10px] uppercase font-bold text-cmd-muted border-b border-cmd-border pb-2">
            <tr>
              <th className="py-2.5">Timestamp</th>
              <th>Actor ID</th>
              <th>Role</th>
              <th>Action Triggered</th>
              <th>Resource Target</th>
              <th>Env</th>
              <th className="text-right">Outcome</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cmd-border">
            {filtered.map((log) => (
              <tr key={log.id} className="hover:bg-cmd-border/20 transition-colors">
                <td className="py-3 text-cmd-muted">{log.timestamp}</td>
                <td className="font-bold text-white">{log.actor}</td>
                <td>
                  <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-cmd-bg text-cmd-accent border border-cmd-border font-bold">
                    {log.role}
                  </span>
                </td>
                <td className="font-bold text-cmd-accent">{log.action}</td>
                <td className="text-cmd-text">{log.resource}</td>
                <td className="text-cmd-muted uppercase text-[10px]">{log.environment}</td>
                <td className="text-right">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-cmd-green bg-cmd-green/10 px-2 py-0.5 rounded border border-cmd-green/30">
                    <CheckCircle2 className="w-3 h-3" /> {log.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
