import { NextRequest } from "next/server";
import { AuthError, register } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim();
    const password = String(body.password || "");

    if (!name || name.length > 120) {
      return Response.json({ message: "Please enter your name." }, { status: 400 });
    }
    if (!EMAIL_PATTERN.test(email)) {
      return Response.json({ message: "Please enter a valid email address." }, { status: 400 });
    }
    if (password.length < 12 || password.length > 128) {
      return Response.json({ message: "Password must be 12 to 128 characters." }, { status: 400 });
    }

    return Response.json({ data: register(name, email, password) }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) {
      return Response.json({ message: error.message }, { status: error.status });
    }
    return Response.json({ message: "Could not create your account." }, { status: 500 });
  }
}
