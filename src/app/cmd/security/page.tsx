"use client";

import React from "react";
import { ShieldAlert, ShieldCheck, Lock, AlertTriangle, EyeOff } from "lucide-react";

export default function CmdSecurityPage() {
  const securityEvents = [
    { id: "sec-1", time: "10 mins ago", type: "Rate Limit Triggered (429)", sourceIp: "45.132.***.***", endpoint: "/api/v1/auth/login", action: "IP Rate Throttled (15 min ban)" },
    { id: "sec-2", time: "25 mins ago", type: "Suspicious Query Payload", sourceIp: "185.220.***.***", endpoint: "/api/v1/products", action: "WAF SQLi Filter Blocked" },
    { id: "sec-3", time: "1 hour ago", type: "Failed Password Hash", sourceIp: "103.88.***.***", endpoint: "/api/v1/auth/login", action: "Challenge Captcha Issued" },
    { id: "sec-4", time: "3 hours ago", type: "Invalid JWT Signature", sourceIp: "157.48.***.***", endpoint: "/api/v1/orders", action: "401 Unauthorized Returned" },
  ];

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="border-b border-cmd-border pb-6">
        <span className="text-[10px] uppercase font-bold tracking-widest text-cmd-accent block mb-1">
          THREAT DETECTION & ACCESS CONTROL
        </span>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-cmd-orange" />
          <span>Security, WAF & Rate Limiting</span>
        </h1>
        <p className="text-xs text-cmd-muted mt-0.5">
          TLS 1.3 Strict HTTPS • OWASP Top 10 Guardrails • IP Rate Limit: 100 req/min/IP
        </p>
      </div>

      {/* Security Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-cmd-card rounded-2xl p-5 border border-cmd-border space-y-1">
          <span className="text-xs text-cmd-muted">Blocked Malicious Requests (24h)</span>
          <span className="text-2xl font-bold text-white block">142</span>
          <span className="text-[10px] text-cmd-green">All neutralized at Cloudflare edge</span>
        </div>

        <div className="bg-cmd-card rounded-2xl p-5 border border-cmd-border space-y-1">
          <span className="text-xs text-cmd-muted">Active Rate Limit Bans</span>
          <span className="text-2xl font-bold text-cmd-orange block">3 IPs</span>
          <span className="text-[10px] text-cmd-muted">Temporary throttling active</span>
        </div>

        <div className="bg-cmd-card rounded-2xl p-5 border border-cmd-border space-y-1">
          <span className="text-xs text-cmd-muted">TLS Certificate Status</span>
          <span className="text-2xl font-bold text-cmd-green block">VALID</span>
          <span className="text-[10px] text-cmd-muted">Let&apos;s Encrypt ECC 256 (Expires in 74d)</span>
        </div>
      </div>

      {/* Events Stream Table */}
      <div className="bg-cmd-card rounded-2xl border border-cmd-border overflow-hidden p-5 space-y-3">
        <h3 className="text-sm font-bold text-white">Recent Security Interceptions</h3>
        <table className="w-full text-left text-xs font-mono">
          <thead className="text-[10px] uppercase font-bold text-cmd-muted border-b border-cmd-border pb-2">
            <tr>
              <th className="py-2.5">Timestamp</th>
              <th>Threat Classification</th>
              <th>Masked Origin IP</th>
              <th>Target Endpoint</th>
              <th>Mitigation Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cmd-border">
            {securityEvents.map((evt) => (
              <tr key={evt.id} className="hover:bg-cmd-border/20 transition-colors">
                <td className="py-3 text-cmd-muted">{evt.time}</td>
                <td className="font-bold text-cmd-orange">{evt.type}</td>
                <td className="text-cmd-muted">{evt.sourceIp}</td>
                <td className="text-cmd-accent">{evt.endpoint}</td>
                <td className="text-cmd-green">{evt.action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
