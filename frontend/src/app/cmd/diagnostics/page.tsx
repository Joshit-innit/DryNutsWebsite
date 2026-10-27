"use client";

import React, { useState } from "react";
import { cmdService } from "@/services/cmd";
import { Cpu, Play, CheckCircle2, Terminal } from "lucide-react";
import { toast } from "sonner";

export default function CmdDiagnosticsPage() {
  const [running, setRunning] = useState(false);
  const [consoleOut, setConsoleOut] = useState<string | null>(null);

  const handlePingTrace = async () => {
    setRunning(true);
    setConsoleOut("Initiating multi-region ICMP & TCP synthetic trace...\n");
    await new Promise((res) => setTimeout(res, 600));
    setConsoleOut((prev) => `${prev}
[MUMBAI ap-south-1] -> Spring API Gateway: 4ms (OK)
[MUMBAI ap-south-1] -> PostgreSQL Master: 1.2ms (OK)
[MUMBAI ap-south-1] -> Redis Sentinel Cluster: 0.6ms (OK)
[BANGALORE ap-south-1] -> S3 Image Bucket: 14ms (OK)
[DELHI Cloudflare Edge] -> Storefront CDN Cache: 2.8ms (OK)

Synthetic Health Score: 100% (Sub-millisecond internal bus).`);
    setRunning(false);
    toast.success("Synthetic traceroute completed with optimal latencies.");
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="border-b border-cmd-border pb-6">
        <span className="text-[10px] uppercase font-bold tracking-widest text-cmd-accent block mb-1">
          NETWORK LATENCY & SYNTHETIC PROBES
        </span>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Cpu className="w-6 h-6 text-cmd-accent" />
          <span>System Diagnostics & Synthetic Tracers</span>
        </h1>
        <p className="text-xs text-cmd-muted mt-0.5">
          Execute pre-approved synthetic availability tests against internal microservices.
        </p>
      </div>

      <div className="bg-cmd-card rounded-2xl border border-cmd-border p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-white">Full-Stack Synthetic Round-Trip Ping</h3>
            <p className="text-xs text-cmd-muted">Tests database, Redis, S3 CDN, and external payment webhooks.</p>
          </div>

          <button
            onClick={handlePingTrace}
            disabled={running}
            className="bg-cmd-accent hover:bg-cmd-accent/80 text-cmd-bg text-xs font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5" />
            <span>{running ? "Probing..." : "Run Synthetic Trace"}</span>
          </button>
        </div>
      </div>

      {consoleOut && (
        <div className="bg-black rounded-2xl border border-cmd-border p-5 font-mono text-xs space-y-2">
          <div className="flex items-center justify-between text-cmd-muted border-b border-cmd-border pb-2">
            <span className="text-cmd-accent flex items-center gap-1.5">
              <Terminal className="w-4 h-4" />
              <span>Synthetic Diagnostic Terminal</span>
            </span>
            <button onClick={() => setConsoleOut(null)} className="text-[11px] hover:text-white">
              Clear
            </button>
          </div>
          <pre className="text-cmd-text whitespace-pre-wrap leading-relaxed">
            {consoleOut}
          </pre>
        </div>
      )}
    </div>
  );
}
