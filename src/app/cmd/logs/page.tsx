"use client";

import React, { useState, useEffect } from "react";
import { cmdService } from "@/services/cmd";
import { LogEntry } from "@/types";
import { Terminal, Search, Filter, RefreshCw, Copy, Check } from "lucide-react";
import { toast } from "sonner";

export default function CmdLogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [levelFilter, setLevelFilter] = useState("ALL");
  const [categoryTab, setCategoryTab] = useState("Application");
  const [search, setSearch] = useState("");
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await cmdService.getLogs({
        level: levelFilter,
        search,
      });
      setLogs(data);
    }
    load();
  }, [levelFilter, search]);

  const handleCopyLogs = () => {
    const text = logs.map((l) => `[${l.timestamp}] [${l.level}] [${l.service}] ${l.message}`).join("\n");
    navigator.clipboard.writeText(text);
    toast.success("Logs copied to clipboard.");
  };

  const getLevelBadge = (level: string) => {
    switch (level) {
      case "ERROR":
        return "bg-red-950 text-red-400 border-red-800";
      case "WARN":
        return "bg-amber-950 text-amber-400 border-amber-800";
      case "DEBUG":
        return "bg-purple-950 text-purple-400 border-purple-800";
      case "INFO":
      default:
        return "bg-cmd-green/20 text-cmd-green border-cmd-green/40";
    }
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cmd-border pb-6">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-cmd-accent block mb-1">
            TERMINAL LOG STREAMER
          </span>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Terminal className="w-6 h-6 text-cmd-accent" />
            <span>Real-Time Logs & Observability</span>
          </h1>
          <p className="text-xs text-cmd-muted mt-0.5">
            Streaming stdout/stderr logs with automated secret & token masking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLogs}
            className="bg-cmd-card hover:bg-cmd-border text-white text-xs font-bold px-3.5 py-2 rounded-lg border border-cmd-border transition-colors flex items-center gap-1.5"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy Stream</span>
          </button>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex border-b border-cmd-border gap-2 overflow-x-auto text-xs">
        {["Application", "API Gateway", "Authentication", "Security WAF", "Infrastructure"].map((tab) => (
          <button
            key={tab}
            onClick={() => setCategoryTab(tab)}
            className={`px-4 py-2.5 rounded-t-lg font-bold transition-colors ${
              categoryTab === tab
                ? "bg-cmd-card text-cmd-accent border-t-2 border-cmd-accent border-x border-cmd-border"
                : "text-cmd-muted hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Filter Toolbar */}
      <div className="bg-cmd-card p-4 rounded-xl border border-cmd-border flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-cmd-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search keywords, IP addresses, request IDs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-cmd-bg border border-cmd-border rounded-lg text-white placeholder:text-cmd-muted focus:outline-none focus:border-cmd-accent font-mono text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-cmd-muted">Severity:</span>
          {["ALL", "INFO", "WARN", "ERROR", "DEBUG"].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setLevelFilter(lvl)}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors ${
                levelFilter === lvl ? "bg-cmd-accent text-cmd-bg" : "bg-cmd-bg text-cmd-muted hover:text-white"
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Terminal Window */}
      <div className="bg-black rounded-2xl border border-cmd-border p-5 font-mono text-xs overflow-hidden shadow-2xl space-y-2 min-h-[400px]">
        <div className="flex items-center justify-between pb-3 border-b border-cmd-border/60 text-[11px] text-cmd-muted">
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />
            <span className="ml-2 text-white/80">bash /var/log/nutrination/stream.log</span>
          </span>
          <span>Showing {logs.length} events</span>
        </div>

        <div className="space-y-2 max-h-[500px] overflow-y-auto pt-2 font-mono">
          {logs.map((log) => (
            <div key={log.id} className="flex flex-col sm:flex-row sm:items-start gap-2 hover:bg-white/5 p-1 rounded">
              <span className="text-cmd-muted select-none text-[11px] min-w-[170px]">{log.timestamp}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded border uppercase font-bold text-center min-w-[55px] ${getLevelBadge(
                  log.level
                )}`}
              >
                {log.level}
              </span>
              <span className="text-cmd-accent min-w-[120px]">[{log.service}]</span>
              <span className="text-cmd-text flex-1 break-all">{log.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
