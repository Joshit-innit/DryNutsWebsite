import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/server/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const categories = db.getCategories();
  return NextResponse.json({
    status: 200,
    count: categories.length,
    data: categories,
    timestamp: new Date().toISOString(),
  });
}
