"use client";

import React, { useState } from "react";
import { Clock, Play, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function CmdJobsPage() {
  const [runningJob, setRunningJob] = useState<string | null>(null);

  const jobs = [
    { id: "job-1", name: "Inventory Threshold Sync", schedule: "Every 15 mins", lastRun: "6 mins ago", status: "SUCCESS", duration: "1.4s" },
    { id: "job-2", name: "Abandoned Harvest Basket Reminders", schedule: "Hourly", lastRun: "24 mins ago", status: "SUCCESS", duration: "820ms" },
    { id: "job-3", name: "Daily Revenue & GST Reconciliation", schedule: "Daily at 00:00 UTC", lastRun: "10 hours ago", status: "SUCCESS", duration: "4.2s" },
    { id: "job-4", name: "S3 Image CDN Cache Warmer", schedule: "Every 6 hours", lastRun: "2 hours ago", status: "SUCCESS", duration: "12.8s" },
    { id: "job-5", name: "MeiliSearch Full Catalog Re-Index", schedule: "Weekly on Sunday", lastRun: "4 days ago", status: "SUCCESS", duration: "3.1s" },
  ];

  const handleTriggerJob = async (id: string, name: string) => {
    setRunningJob(id);
    await new Promise((res) => setTimeout(res, 800));
    setRunningJob(null);
    toast.success(`Job "${name}" executed successfully.`);
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="border-b border-cmd-border pb-6">
        <span className="text-[10px] uppercase font-bold tracking-widest text-cmd-accent block mb-1">
          BACKGROUND WORKERS & CRON QUEUES
        </span>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Clock className="w-6 h-6 text-cmd-accent" />
          <span>Scheduled Jobs & Asynchronous Queues</span>
        </h1>
        <p className="text-xs text-cmd-muted mt-0.5">
          Engine: Spring @Scheduled + RabbitMQ event-driven consumers.
        </p>
      </div>

      <div className="bg-cmd-card rounded-2xl border border-cmd-border overflow-hidden p-5">
        <table className="w-full text-left text-xs font-mono">
          <thead className="text-[10px] uppercase font-bold text-cmd-muted border-b border-cmd-border pb-2">
            <tr>
              <th className="py-2.5">Job / Worker Task</th>
              <th>Cron Schedule</th>
              <th>Last Execution</th>
              <th>Execution Time</th>
              <th>Health Status</th>
              <th className="text-right">Manual Trigger</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cmd-border">
            {jobs.map((job) => (
              <tr key={job.id} className="hover:bg-cmd-border/20 transition-colors">
                <td className="py-3 font-bold text-white">{job.name}</td>
                <td className="text-cmd-accent">{job.schedule}</td>
                <td className="text-cmd-muted">{job.lastRun}</td>
                <td className="text-cmd-muted">{job.duration}</td>
                <td>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-cmd-green bg-cmd-green/10 border border-cmd-green/30 px-2 py-0.5 rounded">
                    <CheckCircle2 className="w-3 h-3" /> {job.status}
                  </span>
                </td>
                <td className="text-right">
                  <button
                    onClick={() => handleTriggerJob(job.id, job.name)}
                    disabled={runningJob === job.id}
                    className="text-xs bg-cmd-bg hover:bg-cmd-border text-cmd-accent border border-cmd-border px-3 py-1.5 rounded transition-colors inline-flex items-center gap-1"
                  >
                    <Play className="w-3 h-3" />
                    <span>{runningJob === job.id ? "Running..." : "Trigger Now"}</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
