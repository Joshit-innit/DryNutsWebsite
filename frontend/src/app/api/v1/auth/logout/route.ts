import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/server/session";

export const dynamic = "force-dynamic";

export async function POST() {
  const response = NextResponse.json({ data: { authenticated: false } });
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
