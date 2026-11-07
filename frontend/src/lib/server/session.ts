/**
 * Verifies the session token issued by the Spring customer-service. It sits apart
 * from auth.ts and uses only Web Crypto so proxy.ts can import it on any runtime.
 */

export type Role = "ADMIN" | "CUSTOMER";

export interface TokenClaims {
  sub: string;
  email: string;
  name: string;
  role: Role;
  exp: number;
}

/** HttpOnly: page scripts can neither read nor steal it. */
export const SESSION_COOKIE = "nn_session";

const TOKEN_ISSUER = "nutrination-customer-service";

function decodeBase64url(value: string): Uint8Array<ArrayBuffer> {
  const binary = atob(value.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

export async function verifyToken(token: string | undefined): Promise<TokenClaims | null> {
  // AUTH_SECRET must equal the customer-service's JWT_SECRET. Without it nobody is signed in.
  const secret = process.env.AUTH_SECRET;
  if (!token || !secret || secret.length < 32) return null;

  const [header, payload, signature] = token.split(".");
  if (!header || !payload || !signature) return null;

  try {
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      decodeBase64url(signature),
      new TextEncoder().encode(`${header}.${payload}`)
    );
    if (!valid) return null;

    const claims = JSON.parse(new TextDecoder().decode(decodeBase64url(payload)));
    const current = claims.iss === TOKEN_ISSUER && claims.exp > Math.floor(Date.now() / 1000);
    return current ? (claims as TokenClaims) : null;
  } catch {
    return null;
  }
}
