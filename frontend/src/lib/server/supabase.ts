/**
 * Server-only Supabase client. Uses the secret (service role) key, which
 * bypasses RLS — never import this from a client component.
 */
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const globalForSupabase = globalThis as unknown as { __nnSupabase?: SupabaseClient };

export function getSupabase(): SupabaseClient {
  if (globalForSupabase.__nnSupabase) return globalForSupabase.__nnSupabase;

  if (typeof window !== "undefined") {
    throw new Error("The Supabase admin client must only be used on the server.");
  }

  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase is not configured. Set SUPABASE_URL and SUPABASE_SECRET_KEY in frontend/.env.local."
    );
  }

  globalForSupabase.__nnSupabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return globalForSupabase.__nnSupabase;
}
