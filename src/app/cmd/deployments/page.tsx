"use client";

import React, { useState, useEffect } from "react";
import { cmdService } from "@/services/cmd";
import { DeploymentRecord } from "@/types";
import { GitBranch, AlertTriangle, CheckCircle2, RotateCcw, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function CmdDeploymentsPage() {
  const [deployments, setDeployments] = useState<DeploymentRecord[]>([]);
  const [rollbackTarget, setRollbackTarget] = useState<DeploymentRecord | null>(null);
  const [isRollingBack, setIsRollingBack] = useState(false);

  useEffect(() => {
    async function load() {
      const data = await cmdService.getDeployments();
      setDeployments(data);
    }
    load();
  }, []);

  const confirmRollback = async () => {
    if (!rollbackTarget) return;
    setIsRollingBack(true);
    await cmdService.triggerRollback(rollbackTarget.id);
    const updated = await cmdService.getDeployments();
    setDeployments(updated);
    setIsRollingBack(false);
    setRollbackTarget(null);
    toast.success(`Production rolled back to version ${rollbackTarget.version}`);
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="border-b border-cmd-border pb-6">
        <span className="text-[10px] uppercase font-bold tracking-widest text-cmd-accent block mb-1">
          CI/CD RELEASES & ENVIRONMENT CONTROL
        </span>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <GitBranch className="w-6 h-6 text-cmd-accent" />
          <span>Deployments & Version Pipeline</span>
        </h1>
        <p className="text-xs text-cmd-muted mt-0.5">
          Current Live Release: <strong className="text-white font-mono">v2.14.0 (commit 7b4ef92)</strong> on Vercel Edge + AWS Fargate
        </p>
      </div>

      {/* Environments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-cmd-card rounded-2xl p-5 border border-cmd-border space-y-2">
          <span className="text-[10px] uppercase font-bold text-cmd-muted block">Development</span>
          <h3 className="font-bold text-base text-white">v2.15.0-rc1</h3>
          <p className="text-xs text-cmd-muted">Auto-deployed on branch push</p>
          <span className="text-[11px] text-cmd-green block font-bold">● Passing unit checks</span>
        </div>

        <div className="bg-cmd-card rounded-2xl p-5 border border-cmd-border space-y-2">
          <span className="text-[10px] uppercase font-bold text-cmd-muted block">Staging Sandbox</span>
          <h3 className="font-bold text-base text-white">v2.14.2</h3>
          <p className="text-xs text-cmd-muted">QA & performance benchmarked</p>
          <span className="text-[11px] text-cmd-green block font-bold">● Staging ready</span>
        </div>

        <div className="bg-cmd-card rounded-2xl p-5 border-2 border-cmd-green/40 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] uppercase font-bold text-cmd-green">Production Live</span>
            <span className="w-2 h-2 rounded-full bg-cmd-green animate-ping" />
          </div>
          <h3 className="font-bold text-base text-white">v2.14.0</h3>
          <p className="text-xs text-cmd-muted">Serving all customer & admin requests</p>
          <span className="text-[11px] text-cmd-green block font-bold">● 100% Traffic routed</span>
        </div>
      </div>

      {/* Deployment History Table */}
      <div className="bg-cmd-card rounded-2xl border border-cmd-border overflow-hidden p-5 space-y-3">
        <h3 className="text-sm font-bold text-white">Production Release History</h3>
        <table className="w-full text-left text-xs font-mono">
          <thead className="text-[10px] uppercase font-bold text-cmd-muted border-b border-cmd-border pb-2">
            <tr>
              <th className="py-2.5">Version</th>
              <th>Environment</th>
              <th>Commit Hash & Message</th>
              <th>Deployer</th>
              <th>Deployed At</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cmd-border">
            {deployments.map((d) => (
              <tr key={d.id} className="hover:bg-cmd-border/20 transition-colors">
                <td className="py-3 font-bold text-white">{d.version}</td>
                <td className="uppercase text-[11px] text-cmd-accent">{d.environment}</td>
                <td className="max-w-xs">
                  <span className="text-cmd-accent font-bold">[{d.commitHash}]</span>{" "}
                  <span className="text-cmd-muted truncate">{d.commitMessage}</span>
                </td>
                <td className="text-white">{d.author}</td>
                <td className="text-cmd-muted">{d.deployedAt}</td>
                <td>
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      d.status === "SUCCESS"
                        ? "bg-cmd-green/10 text-cmd-green"
                        : "bg-amber-950 text-amber-400"
                    }`}
                  >
                    {d.status}
                  </span>
                </td>
                <td className="text-right">
                  <button
                    onClick={() => setRollbackTarget(d)}
                    className="text-xs bg-cmd-bg hover:bg-amber-950 text-amber-400 border border-cmd-border px-3 py-1 rounded transition-colors inline-flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Rollback</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Rollback Confirmation Modal */}
      {rollbackTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-cmd-card rounded-2xl p-6 max-w-md w-full border border-red-900 shadow-2xl space-y-4 font-mono">
            <div className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-bold text-sm">Confirm Production Rollback</h3>
            </div>
            <p className="text-xs text-cmd-text leading-relaxed">
              You are about to revert production traffic from the current release to{" "}
              <strong className="text-white">{rollbackTarget.version} ({rollbackTarget.commitHash})</strong>.
              This will trigger a rolling restart of the container cluster.
            </p>
            <div className="flex gap-2 pt-2 text-xs font-bold">
              <button
                onClick={() => setRollbackTarget(null)}
                className="flex-1 py-2 bg-cmd-bg border border-cmd-border text-cmd-muted rounded hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={confirmRollback}
                disabled={isRollingBack}
                className="flex-1 py-2 bg-red-900 hover:bg-red-800 text-white rounded transition-colors"
              >
                {isRollingBack ? "Executing Rollback..." : "Confirm Rollback"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
