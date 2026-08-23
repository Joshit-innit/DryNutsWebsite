"use client";

import React, { useState, useEffect } from "react";
import { cmdService } from "@/services/cmd";
import { SystemServiceStatus } from "@/types";
import { Server, Activity, ArrowUpRight } from "lucide-react";

export default function CmdServicesPage() {
  const [services, setServices] = useState<SystemServiceStatus[]>([]);

  useEffect(() => {
    async function load() {
      const s = await cmdService.getServices();
      setServices(s);
    }
    load();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="border-b border-cmd-border pb-6">
        <span className="text-[10px] uppercase font-bold tracking-widest text-cmd-accent block mb-1">
          SERVICE DISCOVERY & DNS REGISTRY
        </span>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Services Registry
        </h1>
        <p className="text-xs text-cmd-muted mt-0.5">
          Internal routing table, cluster DNS records, and active socket connections.
        </p>
      </div>

      <div className="bg-cmd-card rounded-2xl border border-cmd-border overflow-hidden p-5">
        <table className="w-full text-left text-xs">
          <thead className="text-[10px] uppercase font-bold text-cmd-muted border-b border-cmd-border pb-2">
            <tr>
              <th className="py-2.5">Microservice Target</th>
              <th>Internal DNS / Socket</th>
              <th>Network State</th>
              <th>Average Ping</th>
              <th>Version Tag</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cmd-border">
            {services.map((srv, idx) => (
              <tr key={idx} className="hover:bg-cmd-border/20 transition-colors">
                <td className="py-3 font-bold text-white">{srv.name}</td>
                <td className="font-mono text-cmd-muted">{srv.endpoint}</td>
                <td>
                  <span className="text-cmd-green font-bold text-[11px]">ACTIVE / READY</span>
                </td>
                <td className="font-mono text-cmd-accent font-bold">{srv.latencyMs} ms</td>
                <td className="font-mono text-cmd-muted">{srv.version}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
