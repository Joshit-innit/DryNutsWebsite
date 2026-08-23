import { NextResponse } from "next/server";
import { ADMIN_TOKEN_COOKIE } from "@/app/api/v1/auth/admin-login/route";

export async function POST() {
  const response = NextResponse.json({
    status: 200,
    success: true,
    message: "Logged out successfully.",
  });

  // Clear the admin token cookie
  response.cookies.set(ADMIN_TOKEN_COOKIE, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
  });

  return response;
}
