import {
  CMD_SERVICES,
  CMD_METRICS,
  CMD_LOGS,
  CMD_AUDIT,
  CMD_DEPLOYMENTS,
} from "@/data/mockData";
import {
  SystemServiceStatus,
  SystemMetrics,
  LogEntry,
  AuditEntry,
  DeploymentRecord,
} from "@/types";

let currentLogs = [...CMD_LOGS];
let currentDeployments = [...CMD_DEPLOYMENTS];

export const cmdService = {
  async getServices(): Promise<SystemServiceStatus[]> {
    await new Promise((res) => setTimeout(res, 20));
    return [...CMD_SERVICES];
  },

  async getMetrics(): Promise<SystemMetrics> {
    await new Promise((res) => setTimeout(res, 20));
    return {
      ...CMD_METRICS,
      cpuUsage: Math.floor(25 + Math.random() * 8),
      avgLatencyMs: Math.floor(28 + Math.random() * 6),
      requestsPerSecond: Math.floor(360 + Math.random() * 40),
    };
  },

  async getLogs(filter?: { level?: string; search?: string }): Promise<LogEntry[]> {
    await new Promise((res) => setTimeout(res, 30));
    let logs = [...currentLogs];
    if (filter?.level && filter.level !== "ALL") {
      logs = logs.filter((l) => l.level === filter.level);
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      logs = logs.filter((l) => l.message.toLowerCase().includes(q) || l.service.toLowerCase().includes(q));
    }
    return logs;
  },

  async runDiagnostic(action: string): Promise<{ success: boolean; output: string; durationMs: number }> {
    const start = Date.now();
    await new Promise((res) => setTimeout(res, 400));
    const duration = Date.now() - start;

    switch (action) {
      case "DB_HEALTH_CHECK":
        return {
          success: true,
          durationMs: duration,
          output: "PostgreSQL 16.3: OK. Replication Lag: 0ms. Active Pool Connections: 14/50. Idle: 36. Transactions/sec: 142. All constraints consistent.",
        };
      case "DB_SIZE_CHECK":
        return {
          success: true,
          durationMs: duration,
          output: "Database: 'nutrination_prod'. Total Size: 8.42 GB. Index Size: 1.84 GB. Free disk headroom: 91.58 GB (91.5%).",
        };
      case "CONNECTION_POOL_CHECK":
        return {
          success: true,
          durationMs: duration,
          output: "HikariCP Pool: Max=50, MinIdle=10, Active=14, Pending=0, MaxWaitTimeout=30000ms. Health: Optimal.",
        };
      case "SLOW_QUERY_DIAGNOSTICS":
        return {
          success: true,
          durationMs: duration,
          output: "No queries exceeded threshold (>200ms) in past 24 hours. Longest query: 38ms (Category aggregation materialized cache).",
        };
      default:
        return {
          success: true,
          durationMs: duration,
          output: `Diagnostic task '${action}' executed successfully with exit code 0.`,
        };
    }
  },

  async getDeployments(): Promise<DeploymentRecord[]> {
    await new Promise((res) => setTimeout(res, 20));
    return [...currentDeployments];
  },

  async triggerRollback(deploymentId: string): Promise<boolean> {
    await new Promise((res) => setTimeout(res, 500));
    const dep = currentDeployments.find((d) => d.id === deploymentId);
    if (dep) {
      dep.status = "ROLLED_BACK";
    }
    return true;
  },

  async getAuditLogs(): Promise<AuditEntry[]> {
    await new Promise((res) => setTimeout(res, 20));
    return [...CMD_AUDIT];
  },
};
