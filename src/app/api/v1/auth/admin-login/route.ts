import { NextRequest, NextResponse } from "next/server";

// ---------------------------------------------------------------------------
// Admin credentials — single authoritative source
// ---------------------------------------------------------------------------
const ADMIN_USERNAME = "JoshitAdmin";
const ADMIN_PASSWORD = "Joshit@123";

// Simple signed token (in production use JWT with a secret)
export const ADMIN_TOKEN = "nutrination_admin_session_joshit_2026";
export const ADMIN_TOKEN_COOKIE = "nn_admin_token";

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
