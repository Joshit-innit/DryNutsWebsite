/**
 * Server-side account store and token signing for the Next.js API fallback.
 * Mirrors the Spring customer-service contract (/auth/login, /auth/register,
 * /auth/check) so the frontend works against either backend.
 *
 * Accounts live in the Supabase `app_users` table (scrypt password hashes).
 * The admin account is seeded from ADMIN_EMAIL / ADMIN_PASSWORD.
 */

import crypto from "crypto";
import { getSupabase } from "@/lib/server/supabase";

export type Role = "ADMIN" | "CUSTOMER";

interface StoredUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  passwordHash: string;
  createdAt: string;
}

export interface TokenClaims {
  sub: string;
  email: string;
  name: string;
  role: Role;
  exp: number;
}

export interface AuthPayload {
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: number;
  customerId: string;
  name: string;
  email: string;
  role: Role;
}

const TOKEN_TTL_SECONDS = 8 * 60 * 60;
const DEV_ADMIN_EMAIL = "admin@nutrination.in";
const DEV_ADMIN_PASSWORD = "NutriAdmin@2026";

// ---------------------------------------------------------------------------
// Secrets
// ---------------------------------------------------------------------------
const globalForAuth = globalThis as unknown as { __nnAuthSecret?: Buffer };

function getSecret(): Buffer {
  const configured = process.env.AUTH_SECRET;
  if (configured && configured.length >= 32) {
    return Buffer.from(configured, "utf-8");
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET must be set to at least 32 characters in production.");
  }
  // Development: a per-process random secret. Sessions end when the dev server restarts.
  globalForAuth.__nnAuthSecret ??= crypto.randomBytes(32);
  return globalForAuth.__nnAuthSecret;
}

// ---------------------------------------------------------------------------
// Password hashing (scrypt)
// ---------------------------------------------------------------------------
function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, 64);
  return `scrypt$${salt.toString("base64")}$${hash.toString("base64")}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [scheme, saltB64, hashB64] = stored.split("$");
  if (scheme !== "scrypt" || !saltB64 || !hashB64) return false;
  const expected = Buffer.from(hashB64, "base64");
  const actual = crypto.scryptSync(password, Buffer.from(saltB64, "base64"), expected.length);
  return crypto.timingSafeEqual(actual, expected);
}

// ---------------------------------------------------------------------------
// User store (Supabase: public.app_users)
// ---------------------------------------------------------------------------
function toStoredUser(row: Record<string, any>): StoredUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    passwordHash: row.password_hash,
    createdAt: row.created_at,
  };
}

let adminEnsured: Promise<void> | null = null;

/**
 * Keeps the admin account in step with ADMIN_EMAIL / ADMIN_PASSWORD: seeds it when
 * no admin exists, and updates the stored email or password when the env values
 * change, so rotating ADMIN_PASSWORD on the host takes effect on the next start.
 */
function ensureAdmin(): Promise<void> {
  adminEnsured ??= (async () => {
    const supabase = getSupabase();
    const adminEmail = (process.env.ADMIN_EMAIL || DEV_ADMIN_EMAIL).trim().toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || (process.env.NODE_ENV === "production" ? "" : DEV_ADMIN_PASSWORD);

    const { data, error } = await supabase
      .from("app_users")
      .select("id,email,password_hash")
      .eq("role", "ADMIN")
      .order("created_at", { ascending: true })
      .limit(1);
    if (error) throw new Error(`Supabase: ${error.message}`);

    const existing = data?.[0];
    if (existing) {
      // Without an explicit ADMIN_PASSWORD, leave the stored admin untouched.
      if (!process.env.ADMIN_PASSWORD) return;
      const emailChanged = existing.email !== adminEmail;
      const passwordChanged = !verifyPassword(adminPassword, existing.password_hash);
      if (!emailChanged && !passwordChanged) return;

      let nextEmail = adminEmail;
      if (emailChanged) {
        // Another account already uses ADMIN_EMAIL: keep the admin's current email.
        const { data: clash } = await supabase.from("app_users").select("id").eq("email", adminEmail).limit(1);
        if (clash?.length) {
          console.warn(`[auth] ADMIN_EMAIL is already used by another account; admin stays ${existing.email}.`);
          nextEmail = existing.email;
        }
      }
      if (nextEmail === existing.email && !passwordChanged) return;

      const { error: updateError } = await supabase
        .from("app_users")
        .update({
          email: nextEmail,
          ...(passwordChanged ? { password_hash: hashPassword(adminPassword) } : {}),
        })
        .eq("id", existing.id);
      if (updateError) throw new Error(`Supabase: ${updateError.message}`);
      return;
    }

    if (!adminPassword) return;

    const { error: upsertError } = await supabase.from("app_users").upsert(
      {
        id: "admin-1",
        name: "NutriNation Admin",
        email: adminEmail,
        role: "ADMIN",
        password_hash: hashPassword(adminPassword),
      },
      { onConflict: "email" }
    );
    if (upsertError) throw new Error(`Supabase: ${upsertError.message}`);
  })().catch((error) => {
    adminEnsured = null;
    throw error;
  });
  return adminEnsured;
}

async function findUserByEmail(email: string): Promise<StoredUser | null> {
  // A failed admin sync must not block everyone else from signing in.
  await ensureAdmin().catch((error) => console.error("[auth] admin sync failed:", error));
  const { data, error } = await getSupabase().from("app_users").select("*").eq("email", email).limit(1);
  if (error) throw new Error(`Supabase: ${error.message}`);
  return data?.[0] ? toStoredUser(data[0]) : null;
}

// ---------------------------------------------------------------------------
// Tokens (HS256 JWT)
// ---------------------------------------------------------------------------
function base64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

function sign(value: string): string {
  return crypto.createHmac("sha256", getSecret()).update(value).digest("base64url");
}

function issueToken(user: StoredUser): AuthPayload {
  const claims: TokenClaims = {
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS,
  };
  const unsigned = `${base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }))}.${base64url(JSON.stringify(claims))}`;
  return {
    accessToken: `${unsigned}.${sign(unsigned)}`,
    tokenType: "Bearer",
    expiresIn: TOKEN_TTL_SECONDS,
    customerId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

export function verifyToken(token: string): TokenClaims | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const expected = Buffer.from(sign(`${parts[0]}.${parts[1]}`));
  const actual = Buffer.from(parts[2]);
  if (expected.length !== actual.length || !crypto.timingSafeEqual(expected, actual)) return null;
  try {
    const claims = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf-8")) as TokenClaims;
    return claims.exp > Math.floor(Date.now() / 1000) ? claims : null;
  } catch {
    return null;
  }
}

export function getRequestUser(request: Request): TokenClaims | null {
  const header = request.headers.get("authorization") || "";
  const [scheme, token] = header.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return null;
  return verifyToken(token);
}

/** Returns an error Response when the caller is not an authenticated admin. */
export function requireAdmin(request: Request): Response | null {
  const user = getRequestUser(request);
  if (!user) {
    return Response.json({ message: "Please sign in as an administrator." }, { status: 401 });
  }
  if (user.role !== "ADMIN") {
    return Response.json({ message: "Administrator access is required." }, { status: 403 });
  }
  return null;
}

// ---------------------------------------------------------------------------
// Account operations
// ---------------------------------------------------------------------------
export class AuthError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export async function login(email: string, password: string): Promise<AuthPayload> {
  const normalized = email.trim().toLowerCase();
  const user = await findUserByEmail(normalized);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    throw new AuthError(401, "Invalid email or password.");
  }
  return issueToken(user);
}

export async function register(name: string, email: string, password: string): Promise<AuthPayload> {
  const normalized = email.trim().toLowerCase();
  if (await findUserByEmail(normalized)) {
    throw new AuthError(409, "An account already exists for that email address.");
  }
  const { data, error } = await getSupabase()
    .from("app_users")
    .insert({
      id: `cust-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`,
      name: name.trim(),
      email: normalized,
      role: "CUSTOMER",
      password_hash: hashPassword(password),
    })
    .select("*")
    .single();
  if (error) {
    if (error.code === "23505") throw new AuthError(409, "An account already exists for that email address.");
    throw new Error(`Supabase: ${error.message}`);
  }
  const user = toStoredUser(data);
  // Mirror the account into the admin CRM list; failures here must not block sign-up.
  await getSupabase()
    .from("customers")
    .upsert({ id: user.id, name: user.name, email: user.email }, { onConflict: "email", ignoreDuplicates: true });
  return issueToken(user);
}
