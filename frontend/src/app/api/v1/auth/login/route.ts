import { NextRequest } from "next/server";
import { AuthError, login } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body.email || "");
    const password = String(body.password || "");

    if (!email || !password) {
      return Response.json({ message: "Email and password are required." }, { status: 400 });
    }

    return Response.json({ data: login(email, password) });
  } catch (error) {
    if (error instanceof AuthError) {
      return Response.json({ message: error.message }, { status: error.status });
    }
    return Response.json({ message: "Could not sign in." }, { status: 500 });
  }
}
