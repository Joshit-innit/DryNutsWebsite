"use client";

import React, { useState, useEffect } from "react";
import { Activity, ShieldCheck, Terminal, Cpu, Clock } from "lucide-react";

export default function CmdHeader() {
  const [time, setTime] = useState("");
  const [latency, setLatency] = useState(24);

  useEffect(() => {
    setTime(new Date().toUTCString());
    const interval = setInterval(() => {
      setTime(new Date().toUTCString());
      setLatency(Math.floor(22 + Math.random() * 6));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 bg-cmd-card border-b border-cmd-border px-6 flex items-center justify-between sticky top-[33px] z-30 font-mono text-xs text-cmd-text">
      <div className="flex items-center gap-3">
        <span className="text-cmd-muted flex items-center gap-1.5">
          <Terminal className="w-4 h-4 text-cmd-accent" />
          <span>node_01.prod.nutrination.internal</span>
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 bg-cmd-bg border border-cmd-border px-2.5 py-1 rounded text-cmd-muted">
          <Clock className="w-3.5 h-3.5" />
          <span className="text-[11px]">{time || "UTC Live"}</span>
        </div>

        <div className="flex items-center gap-1.5 bg-cmd-green/10 border border-cmd-green/30 text-cmd-green px-2.5 py-1 rounded font-bold">
          <Activity className="w-3.5 h-3.5" />
          <span>RTT: {latency}ms</span>
        </div>
      </div>
    </header>
  );
}
