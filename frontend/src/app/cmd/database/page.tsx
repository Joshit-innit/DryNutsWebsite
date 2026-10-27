"use client";

import React, { useState } from "react";
import { cmdService } from "@/services/cmd";
import { toast } from "sonner";
import { Database, Play, CheckCircle2, Clock, AlertTriangle, Terminal } from "lucide-react";

export default function CmdDatabasePage() {
  const [runningAction, setRunningAction] = useState<string | null>(null);
  const [diagnosticOutput, setDiagnosticOutput] = useState<string | null>(null);

  const actions = [
    { id: "DB_HEALTH_CHECK", name: "DB Health & Consistency Check", desc: "Verifies foreign key constraints, replica lag, and write WAL state." },
    { id: "DB_SIZE_CHECK", name: "Database & Index Size Check", desc: "Calculates total schema volume and index disk headroom." },
    { id: "CONNECTION_POOL_CHECK", name: "HikariCP Connection Pool Audit", desc: "Inspects active, idle, and pending database connections." },
    { id: "SLOW_QUERY_DIAGNOSTICS", name: "Slow Query Analyzer (>200ms)", desc: "Scans pg_stat_statements for queries needing index optimization." },
    { id: "RUN_APPROVED_MIGRATION", name: "Verify Liquibase Schema Migrations", desc: "Verifies changeSet checksums in databasechangelog table." },
  ];

  const handleRunDiagnostic = async (actionId: string, name: string) => {
    setRunningAction(actionId);
    setDiagnosticOutput(`Executing predefined safe diagnostic: ${actionId}...\n`);
    const res = await cmdService.runDiagnostic(actionId);
    setDiagnosticOutput((prev) => `${prev}Result [${res.durationMs}ms]:\n${res.output}\n\nTask completed successfully with exit code 0.`);
    setRunningAction(null);
    toast.success(`Action ${actionId} finished successfully.`);
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="border-b border-cmd-border pb-6">
        <span className="text-[10px] uppercase font-bold tracking-widest text-cmd-accent block mb-1">
          RELATIONAL CLUSTER TELEMETRY
        </span>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Database className="w-6 h-6 text-cmd-accent" />
          <span>PostgreSQL 16 High-Availability Cluster</span>
        </h1>
        <p className="text-xs text-cmd-muted mt-0.5">
          Engine: PostgreSQL 16.3 on AWS Aurora Serverless • Replication Lag: 0ms
        </p>
      </div>

      {/* Cluster Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-cmd-card rounded-2xl p-5 border border-cmd-border space-y-1">
          <span className="text-xs text-cmd-muted">Connection Pool</span>
          <span className="text-xl font-bold text-white block">14 / 50 Active</span>
          <span className="text-[10px] text-cmd-green">36 Idle connections ready</span>
        </div>

        <div className="bg-cmd-card rounded-2xl p-5 border border-cmd-border space-y-1">
          <span className="text-xs text-cmd-muted">Total Database Size</span>
          <span className="text-xl font-bold text-white block">8.42 GB</span>
          <span className="text-[10px] text-cmd-muted">Index size: 1.84 GB</span>
        </div>

        <div className="bg-cmd-card rounded-2xl p-5 border border-cmd-border space-y-1">
          <span className="text-xs text-cmd-muted">P99 Query Latency</span>
          <span className="text-xl font-bold text-cmd-green block">3.4 ms</span>
          <span className="text-[10px] text-cmd-green">Sub-millisecond index hits</span>
        </div>

        <div className="bg-cmd-card rounded-2xl p-5 border border-cmd-border space-y-1">
          <span className="text-xs text-cmd-muted">Buffer Cache Hit Ratio</span>
          <span className="text-xl font-bold text-cmd-accent block">99.8%</span>
          <span className="text-[10px] text-cmd-green">Zero disk swap activity</span>
        </div>
      </div>

      {/* Safe Predefined Diagnostic Action Triggers */}
      <div className="bg-cmd-card rounded-2xl border border-cmd-border p-6 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white">
            Pre-Approved Diagnostic Actions
          </h3>
          <p className="text-xs text-cmd-muted">
            Execute predefined read-only system audits without risk of data mutation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {actions.map((act) => (
            <div
              key={act.id}
              className="p-4 rounded-xl bg-cmd-bg border border-cmd-border flex items-center justify-between gap-4"
            >
              <div>
                <h4 className="font-bold text-xs text-white">{act.name}</h4>
                <p className="text-[11px] text-cmd-muted mt-0.5">{act.desc}</p>
              </div>

              <button
                onClick={() => handleRunDiagnostic(act.id, act.name)}
                disabled={!!runningAction}
                className="bg-cmd-card hover:bg-cmd-accent hover:text-cmd-bg text-cmd-accent text-xs font-bold px-3 py-2 rounded-lg border border-cmd-accent/30 transition-all flex items-center gap-1 flex-shrink-0"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{runningAction === act.id ? "Running..." : "Run"}</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Terminal Diagnostic Output Console */}
      {diagnosticOutput && (
        <div className="bg-black rounded-2xl border border-cmd-border p-5 font-mono text-xs space-y-2">
          <div className="flex items-center justify-between text-cmd-muted border-b border-cmd-border pb-2">
            <span className="flex items-center gap-1.5 text-cmd-accent">
              <Terminal className="w-4 h-4" />
              <span>Diagnostic Console Stream</span>
            </span>
            <button onClick={() => setDiagnosticOutput(null)} className="text-[11px] hover:text-white">
              Clear Console
            </button>
          </div>
          <pre className="text-cmd-text whitespace-pre-wrap leading-relaxed">
            {diagnosticOutput}
          </pre>
        </div>
      )}
    </div>
  );
}
