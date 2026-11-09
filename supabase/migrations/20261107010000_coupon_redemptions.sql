-- One use of a coupon per account, recorded with the order that used it.
--
-- The coupon is claimed inside place_order, in the same transaction as the stock
-- and the order row. Two orders racing for the same coupon therefore cannot both
-- succeed, whatever the storefront checked beforehand.
--
-- Safe to run before the matching site code ships: place_order still accepts the
-- old call, and the old code simply never sends a coupon code to it.

begin;

-- Orders remember the code that discounted them, for receipts and invoices.
-- Orders placed before this migration have a discount but no recorded code.
alter table public.orders add column coupon_code text references public.coupons(code);

-- ---------------------------------------------------------------------------
-- Redemptions
-- ---------------------------------------------------------------------------
create table public.coupon_redemptions (
  id           bigint generated always as identity primary key,
  coupon_code  text not null references public.coupons(code),
  customer_id  text not null,
  order_id     text not null references public.orders(id) on delete cascade,
  discount     numeric(10,2) not null,
  redeemed_at  timestamptz not null default now(),
  -- Set when the order is cancelled before it ships, which gives the coupon back.
  released_at  timestamptz
);

-- The rule itself. Released rows are kept as history and don't count.
create unique index coupon_redemptions_one_per_account
  on public.coupon_redemptions (coupon_code, customer_id)
  where released_at is null;

create index coupon_redemptions_customer_idx on public.coupon_redemptions (customer_id);
create unique index coupon_redemptions_order_idx on public.coupon_redemptions (order_id);

alter table public.coupon_redemptions enable row level security;

-- ---------------------------------------------------------------------------
-- Placing an order
-- ---------------------------------------------------------------------------
drop function public.place_order(jsonb);

-- Takes the stock, creates the order and claims its coupon together: if any of
-- them fails, nothing is saved. Expiry is a date in India, where the store trades.
create function public.place_order(p_order jsonb, p_customer_id text default null)
returns public.orders
language plpgsql
set search_path = ''
as $$
declare
  v_order  public.orders;
  v_coupon public.coupons;
begin
  v_order := jsonb_populate_record(null::public.orders, p_order);
  v_order.created_at := now();
  v_order.stock_deducted := true;

  perform public.apply_order_stock(v_order.items, -1, true);

  if v_order.coupon_code is not null then
    if p_customer_id is null then
      raise exception 'Sign in to use a coupon.' using errcode = 'NN001';
    end if;

    -- The lock makes usage_limit exact when several customers order at once.
    select * into v_coupon from public.coupons where code = v_order.coupon_code for update;

    if not found
      or v_coupon.status <> 'active'
      or v_coupon.expiry_date < (now() at time zone 'Asia/Kolkata')::date
      or (v_coupon.usage_limit is not null and v_coupon.usage_count >= v_coupon.usage_limit)
    then
      raise exception 'This coupon has expired or is no longer available.' using errcode = 'NN001';
    end if;
  end if;

  insert into public.orders select (v_order).*;

  if v_order.coupon_code is not null then
    begin
      insert into public.coupon_redemptions (coupon_code, customer_id, order_id, discount)
      values (v_order.coupon_code, p_customer_id, v_order.id, v_order.discount);
    exception when unique_violation then
      raise exception 'You have already used this coupon on this account.' using errcode = 'NN001';
    end;

    update public.coupons set usage_count = usage_count + 1 where code = v_order.coupon_code;
  end if;

  return v_order;
end;
$$;

-- ---------------------------------------------------------------------------
-- Order status
-- ---------------------------------------------------------------------------

-- Changes an order's status and keeps stock and coupons in step:
--   * cancelled or refunded before shipping: packs go back on the shelf and the
--     customer gets the coupon back, since they received nothing with it
--   * cancelled or refunded after shipping: nothing returns, the coupon stays used
--   * reopened: stock is taken again and the coupon is claimed again. If the
--     customer has since spent that coupon elsewhere, the order can't be reopened.
create or replace function public.update_order_status(p_order_id text, p_status text, p_timeline jsonb)
returns public.orders
language plpgsql
set search_path = ''
as $$
declare
  v_order   public.orders;
  v_closing boolean := p_status in ('Cancelled', 'Refunded');
  v_before  boolean;
  v_reopen  boolean;
begin
  select * into v_order from public.orders where id = p_order_id for update;
  if not found then
    raise exception 'Order not found.' using errcode = 'NN001';
  end if;

  v_before := v_order.status in ('Pending', 'Confirmed', 'Packed');
  v_reopen := not v_closing and v_order.status in ('Cancelled', 'Refunded');

  if v_closing and v_order.stock_deducted and v_before then
    perform public.apply_order_stock(v_order.items, 1, false);
    v_order.stock_deducted := false;
  elsif v_reopen and not v_order.stock_deducted then
    perform public.apply_order_stock(v_order.items, -1, true);
    v_order.stock_deducted := true;
  end if;

  if v_closing and v_before then
    with released as (
      update public.coupon_redemptions set released_at = now()
      where order_id = p_order_id and released_at is null
      returning coupon_code
    )
    update public.coupons c set usage_count = greatest(c.usage_count - 1, 0)
    from released r where c.code = r.coupon_code;
  elsif v_reopen then
    begin
      with claimed as (
        update public.coupon_redemptions set released_at = null
        where order_id = p_order_id and released_at is not null
        returning coupon_code
      )
      update public.coupons c set usage_count = c.usage_count + 1
      from claimed r where c.code = r.coupon_code;
    exception when unique_violation then
      raise exception 'This order''s coupon has since been used on another order, so it can''t be reopened.'
        using errcode = 'NN001';
    end;
  end if;

  update public.orders
  set status = p_status, timeline = p_timeline, stock_deducted = v_order.stock_deducted
  where id = p_order_id
  returning * into v_order;

  return v_order;
end;
$$;

-- Only the server (secret key) may call these.
revoke all on function public.place_order(jsonb, text) from public, anon, authenticated;
grant execute on function public.place_order(jsonb, text) to service_role;

commit;

-- PostgREST caches function signatures and tables.
notify pgrst, 'reload schema';
