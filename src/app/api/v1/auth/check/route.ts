import { NextRequest, NextResponse } from "next/server";
import { ADMIN_TOKEN, ADMIN_TOKEN_COOKIE } from "@/lib/auth-constants";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(ADMIN_TOKEN_COOKIE)?.value;
  if (token === ADMIN_TOKEN) {
    return NextResponse.json({ authenticated: true, user: "JoshitAdmin" });
  }
  return NextResponse.json({ authenticated: false }, { status: 401 });
}
