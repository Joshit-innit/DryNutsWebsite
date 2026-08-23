import { NextRequest, NextResponse } from "next/server";
import { cmdService } from "@/services/cmd";

export async function GET(request: NextRequest) {
  const services = await cmdService.getServices();
  const metrics = await cmdService.getMetrics();

  return NextResponse.json({
    status: "HEALTHY",
    environment: "production",
    version: "v2.14.0",
    uptime: "99.99%",
    services,
    metrics,
    timestamp: new Date().toISOString(),
  });
}
