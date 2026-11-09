-- Security hardening: rate limits, revocable sessions, private coupons and one
-- review per customer per product.
--
-- Safe to run before the matching site code ships: nothing existing changes shape,
-- and the site treats a missing function as "allowed" until this has run.

begin;

-- ---------------------------------------------------------------------------
-- Rate limits
-- ---------------------------------------------------------------------------
-- Netlify runs the API on many short-lived instances, so counters must live here.
create table public.rate_limit_hits (
  key          text not null,
  window_start timestamptz not null,
  hits         integer not null default 1,
  primary key (key, window_start)
);
alter table public.rate_limit_hits enable row level security;

-- Counts one attempt against p_key and says whether it is still within the limit.
-- Fixed windows: simple, and good enough to stop scripted guessing and spam.
create function public.hit_rate_limit(p_key text, p_limit integer, p_window_seconds integer)
returns boolean
language plpgsql
set search_path = ''
as $$
declare
  v_window timestamptz := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);
  v_hits   integer;
begin
  insert into public.rate_limit_hits (key, window_start) values (p_key, v_window)
  on conflict (key, window_start) do update set hits = public.rate_limit_hits.hits + 1
  returning hits into v_hits;

  -- Occasional housekeeping instead of a scheduled job.
  if random() < 0.01 then
    delete from public.rate_limit_hits where window_start < now() - interval '2 days';
  end if;

  return v_hits <= p_limit;
end;
$$;

-- ---------------------------------------------------------------------------
-- Sessions
-- ---------------------------------------------------------------------------
-- Session tokens are signed and self-contained, so signing out has to list the
-- token here for the rest of its life. Only a SHA-256 of it is kept.
create table public.revoked_sessions (
  token_hash text primary key,
  expires_at timestamptz not null
);
alter table public.revoked_sessions enable row level security;

create function public.revoke_session(p_token_hash text, p_expires_at timestamptz)
returns void
language sql
set search_path = ''
as $$
  delete from public.revoked_sessions where expires_at < now();
  insert into public.revoked_sessions (token_hash, expires_at) values (p_token_hash, p_expires_at)
  on conflict (token_hash) do nothing;
$$;

-- Whether a signed token may still be used: 'revoked', 'suspended' or 'ok'.
-- Accounts are matched by id, or by email for those mirrored before ids lined up.
create function public.session_state(p_token_hash text, p_customer_id text, p_email text)
returns text
language sql
stable
set search_path = ''
as $$
  select case
    when exists (select 1 from public.revoked_sessions where token_hash = p_token_hash) then 'revoked'
    when exists (
      select 1 from public.customers
      where status = 'suspended' and (id = p_customer_id or lower(email) = lower(p_email))
    ) then 'suspended'
    else 'ok'
  end;
$$;

-- ---------------------------------------------------------------------------
-- Coupons
-- ---------------------------------------------------------------------------
-- Unlisted coupons still work when typed in, but never appear in customers' wallets.
alter table public.coupons add column listed boolean not null default true;

-- ---------------------------------------------------------------------------
-- Reviews
-- ---------------------------------------------------------------------------
-- Reviews written before this have no author id and are left as they are.
alter table public.reviews add column customer_id text;
create unique index reviews_one_per_customer
  on public.reviews (product_id, customer_id)
  where customer_id is not null;

-- ---------------------------------------------------------------------------
-- Access: only the server (secret key) may call these.
-- ---------------------------------------------------------------------------
revoke all on function public.hit_rate_limit(text, integer, integer) from public, anon, authenticated;
revoke all on function public.revoke_session(text, timestamptz) from public, anon, authenticated;
revoke all on function public.session_state(text, text, text) from public, anon, authenticated;
grant execute on function public.hit_rate_limit(text, integer, integer) to service_role;
grant execute on function public.revoke_session(text, timestamptz) to service_role;
grant execute on function public.session_state(text, text, text) to service_role;

commit;

notify pgrst, 'reload schema';
