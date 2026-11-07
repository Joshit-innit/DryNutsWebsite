-- Moves sign-in accounts from public.app_users (Next.js API) to the Spring
-- customer-service, which now owns authentication.
--
-- Run this once in the SQL Editor AFTER customer-service has started at least once
-- (Hibernate creates customer_service.customers), and before pointing the site at it.
-- Safe to re-run. public.app_users is left in place as a rollback copy.
--
-- Account ids are kept, because public.orders.customer_id refers to them. Passwords
-- stay as scrypt hashes: customer-service verifies them and rehashes on next sign-in.

do $$
begin
  if to_regclass('customer_service.customers') is null then
    raise exception 'customer_service.customers does not exist yet. Start customer-service once, then re-run.';
  end if;
end $$;

-- A Spring account that already uses the same email keeps its id, so existing orders
-- and CRM rows follow it there.
update public.orders o
set customer_id = c.id
from public.app_users u
join customer_service.customers c on lower(c.email) = u.email and c.id <> u.id
where o.customer_id = u.id;

update public.customers p
set id = c.id
from public.app_users u
join customer_service.customers c on lower(c.email) = u.email and c.id <> u.id
where p.id = u.id;

update customer_service.customers c
set name = u.name, role = u.role, password_hash = u.password_hash
from public.app_users u
where lower(c.email) = u.email;

insert into customer_service.customers
  (id, name, email, role, password_hash, status, total_orders, total_spend, joined_date)
select u.id, u.name, u.email, u.role, u.password_hash, 'active', 0, 0, u.created_at::date
from public.app_users u
where not exists (select 1 from customer_service.customers c where lower(c.email) = u.email)
on conflict (id) do update
set name = excluded.name, email = excluded.email, role = excluded.role, password_hash = excluded.password_hash;
