-- Real stock tracking and saved store settings.
--
-- Product variants live in jsonb, so stock changes go through these functions:
-- each one runs in a single transaction and locks the product row, which stops
-- two customers buying the last pack at the same time.

-- ---------------------------------------------------------------------------
-- Store settings (a single row)
-- ---------------------------------------------------------------------------
create table public.store_settings (
  id                        boolean primary key default true check (id),
  store_name                text not null default 'NutriNation Foods',
  support_email             text not null default '',
  free_delivery_min         numeric(10,2) not null default 999 check (free_delivery_min >= 0),
  gst_rate                  numeric(5,2) not null default 5 check (gst_rate between 0 and 100),
  enforce_packing_checklist boolean not null default true,
  updated_at                timestamptz not null default now()
);

insert into public.store_settings (id) values (true);

create trigger store_settings_set_updated_at
before update on public.store_settings
for each row execute function public.set_updated_at();

alter table public.store_settings enable row level security;

-- ---------------------------------------------------------------------------
-- Orders: keep the GST rate charged at the time, and whether stock was taken.
-- Orders placed before this migration never took stock, so they default to false.
-- ---------------------------------------------------------------------------
alter table public.orders
  add column gst_rate       numeric(5,2) not null default 5,
  add column stock_deducted boolean not null default false;

-- ---------------------------------------------------------------------------
-- Stock functions
-- ---------------------------------------------------------------------------

-- Adds p_delta to one variant and returns the new stock. Errors with NN001 when
-- that would go below zero, or when the variant is gone and p_must_exist is true.
create function public.change_variant_stock(
  p_product_id text,
  p_variant_id text,
  p_delta      integer,
  p_must_exist boolean default true
)
returns integer
language plpgsql
set search_path = ''
as $$
declare
  v_name     text;
  v_variants jsonb;
  v_index    integer;
  v_stock    integer;
  v_weight   text;
begin
  select name, variants into v_name, v_variants
  from public.products where id = p_product_id for update;

  if found then
    select v.idx - 1, coalesce((v.value ->> 'stock')::integer, 0), v.value ->> 'weight'
    into v_index, v_stock, v_weight
    from jsonb_array_elements(v_variants) with ordinality as v(value, idx)
    where v.value ->> 'id' = p_variant_id;
  end if;

  if v_index is null then
    if not p_must_exist then
      return null;
    end if;
    raise exception 'An item in this order is no longer available.' using errcode = 'NN001';
  end if;

  if v_stock + p_delta < 0 then
    raise exception '% (%) has only % left in stock.', v_name, v_weight, v_stock using errcode = 'NN001';
  end if;

  update public.products
  set variants = jsonb_set(variants, array[v_index::text, 'stock'], to_jsonb(v_stock + p_delta))
  where id = p_product_id;

  return v_stock + p_delta;
end;
$$;

-- Applies sign * quantity for every order line. Rows are locked in a fixed order
-- so two orders sharing products cannot deadlock.
create function public.apply_order_stock(p_items jsonb, p_sign integer, p_must_exist boolean)
returns void
language plpgsql
set search_path = ''
as $$
declare
  v_line record;
begin
  for v_line in
    select i.value ->> 'productId' as product_id,
           i.value ->> 'variantId' as variant_id,
           sum((i.value ->> 'quantity')::integer)::integer as quantity
    from jsonb_array_elements(p_items) as i(value)
    group by 1, 2
    order by 1, 2
  loop
    perform public.change_variant_stock(
      v_line.product_id, v_line.variant_id, p_sign * v_line.quantity, p_must_exist
    );
  end loop;
end;
$$;

-- Takes the stock and creates the order together: if any line is short, nothing is saved.
create function public.place_order(p_order jsonb)
returns public.orders
language plpgsql
set search_path = ''
as $$
declare
  v_order public.orders;
begin
  v_order := jsonb_populate_record(null::public.orders, p_order);
  v_order.created_at := now();
  v_order.stock_deducted := true;

  perform public.apply_order_stock(v_order.items, -1, true);

  insert into public.orders select (v_order).*;
  return v_order;
end;
$$;

-- Changes an order's status and keeps stock in step:
--   * cancelled or refunded before shipping: the packs go back on the shelf
--   * cancelled or refunded after shipping: the food has left, so nothing returns
--   * reopened after a cancel or refund: stock is taken again if it is available
create function public.update_order_status(p_order_id text, p_status text, p_timeline jsonb)
returns public.orders
language plpgsql
set search_path = ''
as $$
declare
  v_order   public.orders;
  v_closing boolean := p_status in ('Cancelled', 'Refunded');
begin
  select * into v_order from public.orders where id = p_order_id for update;
  if not found then
    raise exception 'Order not found.' using errcode = 'NN001';
  end if;

  if v_closing and v_order.stock_deducted and v_order.status in ('Pending', 'Confirmed', 'Packed') then
    perform public.apply_order_stock(v_order.items, 1, false);
    v_order.stock_deducted := false;
  elsif not v_closing and not v_order.stock_deducted and v_order.status in ('Cancelled', 'Refunded') then
    perform public.apply_order_stock(v_order.items, -1, true);
    v_order.stock_deducted := true;
  end if;

  update public.orders
  set status = p_status, timeline = p_timeline, stock_deducted = v_order.stock_deducted
  where id = p_order_id
  returning * into v_order;

  return v_order;
end;
$$;

-- Only the server (secret key) may call these.
revoke all on function public.change_variant_stock(text, text, integer, boolean) from public, anon, authenticated;
revoke all on function public.apply_order_stock(jsonb, integer, boolean) from public, anon, authenticated;
revoke all on function public.place_order(jsonb) from public, anon, authenticated;
revoke all on function public.update_order_status(text, text, jsonb) from public, anon, authenticated;
grant execute on function public.change_variant_stock(text, text, integer, boolean) to service_role;
grant execute on function public.apply_order_stock(jsonb, integer, boolean) to service_role;
grant execute on function public.place_order(jsonb) to service_role;
grant execute on function public.update_order_status(text, text, jsonb) to service_role;
