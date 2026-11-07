import { NextRequest } from "next/server";
import { forwardCredentials } from "@/lib/server/auth-backend";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const email = String(body.email || "").trim();
  const password = String(body.password || "");

  if (!email || !password) {
    return Response.json({ message: "Email and password are required." }, { status: 400 });
  }

  return forwardCredentials("/login", { email, password }, {
    400: "Please enter a valid email address.",
    401: "Invalid email or password.",
  });
}
