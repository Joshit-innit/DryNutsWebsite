/**
 * Server-side account store and token signing for the Next.js API fallback.
 * Mirrors the Spring customer-service contract (/auth/login, /auth/register,
 * /auth/check) so the frontend works against either backend.
 *
 * Accounts live in src/data/users.json, which is git-ignored because it holds
 * password hashes. The admin account is seeded from ADMIN_EMAIL / ADMIN_PASSWORD.
 */

import fs from "fs";
import path from "path";
import crypto from "crypto";

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

const USERS_FILE = path.join(process.cwd(), "src", "data", "users.json");
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
// User file
// ---------------------------------------------------------------------------
function readUsers(): StoredUser[] {
  let users: StoredUser[] = [];
  try {
    if (fs.existsSync(USERS_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
      users = Array.isArray(parsed) ? parsed : [];
    }
  } catch {
    users = [];
  }

  if (!users.some((user) => user.role === "ADMIN")) {
    const adminEmail = (process.env.ADMIN_EMAIL || DEV_ADMIN_EMAIL).trim().toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || (process.env.NODE_ENV === "production" ? "" : DEV_ADMIN_PASSWORD);
    if (adminPassword) {
      users = users.filter((user) => user.email !== adminEmail);
      users.push({
        id: "admin-1",
        name: "NutriNation Admin",
        email: adminEmail,
        role: "ADMIN",
        passwordHash: hashPassword(adminPassword),
        createdAt: new Date().toISOString(),
      });
      writeUsers(users);
    }
  }

  return users;
}

function writeUsers(users: StoredUser[]): void {
  fs.mkdirSync(path.dirname(USERS_FILE), { recursive: true });
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
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

export function login(email: string, password: string): AuthPayload {
  const normalized = email.trim().toLowerCase();
  const user = readUsers().find((candidate) => candidate.email === normalized);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    throw new AuthError(401, "Invalid email or password.");
  }
  return issueToken(user);
}

export function register(name: string, email: string, password: string): AuthPayload {
  const normalized = email.trim().toLowerCase();
  const users = readUsers();
  if (users.some((user) => user.email === normalized)) {
    throw new AuthError(409, "An account already exists for that email address.");
  }
  const user: StoredUser = {
    id: `cust-${Date.now()}`,
    name: name.trim(),
    email: normalized,
    role: "CUSTOMER",
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
  };
  writeUsers([...users, user]);
  return issueToken(user);
}
