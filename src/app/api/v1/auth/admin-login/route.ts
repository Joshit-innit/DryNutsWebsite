import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_USERNAME,
  ADMIN_PASSWORD,
  ADMIN_TOKEN,
  ADMIN_TOKEN_COOKIE,
} from "@/lib/auth-constants";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        {
          status: 401,
          success: false,
          message: "Invalid credentials. Access denied.",
        },
        { status: 401 }
      );
    }

    // Issue the admin session token as an HttpOnly cookie
    const response = NextResponse.json({
      status: 200,
      success: true,
      message: "Authenticated successfully.",
      user: { username: ADMIN_USERNAME, role: "admin" },
      token: ADMIN_TOKEN,
    });

    response.cookies.set(ADMIN_TOKEN_COOKIE, ADMIN_TOKEN, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 12, // 12 hours
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json(
      { status: 500, success: false, message: "Server error." },
      { status: 500 }
    );
  }
}
