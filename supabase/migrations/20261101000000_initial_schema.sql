-- NutriNation initial schema.
-- All tables are accessed only from Next.js route handlers using the Supabase
-- secret (service role) key. RLS is enabled with no policies, so the public
-- anon key cannot read or write anything directly.

-- ---------------------------------------------------------------------------
-- Categories
-- ---------------------------------------------------------------------------
create table public.categories (
  id               text primary key,
  slug             text not null unique,
  name             text not null,
  tagline          text not null default '',
  description      text not null default '',
  image            text not null default '',
  banner_image     text not null default '',
  item_count       integer not null default 0,
  benefits         text[] not null default '{}',
  origin_highlight text not null default '',
  sort_order       integer not null default 0,
  created_at       timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Products (variants / nutrition / faqs kept as jsonb to match the API shape)
-- ---------------------------------------------------------------------------
create table public.products (
  id                text primary key,
  slug              text not null unique,
  name              text not null,
  category          text not null references public.categories (slug) on update cascade,
  category_name     text not null default '',
  tagline           text not null default '',
  short_description text not null default '',
  description       text not null default '',
  origin            text not null default '',
  grade             text,
  images            text[] not null default '{}',
  variants          jsonb not null default '[]'::jsonb check (jsonb_typeof(variants) = 'array'),
  rating            numeric(2,1) not null default 0 check (rating between 0 and 5),
  review_count      integer not null default 0,
  status            text not null default 'published' check (status in ('published', 'draft', 'archived')),
  is_featured       boolean not null default false,
  is_best_seller    boolean not null default false,
  is_new            boolean not null default false,
  tags              text[] not null default '{}',
  benefits          text[] not null default '{}',
  storage_info      text not null default '',
  nutrition         jsonb not null default '{}'::jsonb,
  ingredients       text not null default '',
  faqs              jsonb not null default '[]'::jsonb,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index products_category_idx on public.products (category);
create index products_status_idx on public.products (status);
create index products_created_at_idx on public.products (created_at desc);

-- ---------------------------------------------------------------------------
-- App users (Next.js API auth; scrypt password hashes)
-- ---------------------------------------------------------------------------
create table public.app_users (
  id            text primary key,
  name          text not null,
  email         text not null unique check (email = lower(email)),
  role          text not null check (role in ('ADMIN', 'CUSTOMER')),
  password_hash text not null,
  created_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Customers (admin CRM view)
-- ---------------------------------------------------------------------------
create table public.customers (
  id              text primary key,
  name            text not null,
  email           text not null unique,
  phone           text not null default '',
  avatar          text,
  total_orders    integer not null default 0,
  total_spend     numeric(12,2) not null default 0,
  last_order_date date,
  addresses       jsonb not null default '[]'::jsonb,
  joined_date     date not null default current_date,
  status          text not null default 'active' check (status in ('active', 'suspended')),
  created_at      timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Orders
-- ---------------------------------------------------------------------------
create table public.orders (
  id                 text primary key,
  order_number       text not null unique,
  customer_id        text,
  order_date         date not null default current_date,
  items              jsonb not null default '[]'::jsonb,
  subtotal           numeric(12,2) not null default 0,
  discount           numeric(12,2) not null default 0,
  delivery_fee       numeric(12,2) not null default 0,
  total              numeric(12,2) not null default 0,
  status             text not null default 'Pending' check (status in
                       ('Pending','Confirmed','Packed','Shipped','Out for Delivery','Delivered','Cancelled','Refunded')),
  payment_method     text not null check (payment_method in ('UPI','Card','NetBanking','COD')),
  payment_status     text not null default 'Pending' check (payment_status in ('Paid','Pending','Failed','Refunded')),
  shipping_address   jsonb not null default '{}'::jsonb,
  estimated_delivery date,
  tracking_number    text,
  timeline           jsonb not null default '[]'::jsonb,
  created_at         timestamptz not null default now()
);

create index orders_customer_id_idx on public.orders (customer_id);
create index orders_created_at_idx on public.orders (created_at desc);

-- ---------------------------------------------------------------------------
-- Coupons
-- ---------------------------------------------------------------------------
create table public.coupons (
  code            text primary key check (code = upper(code)),
  description     text not null default '',
  discount_type   text not null check (discount_type in ('percentage', 'fixed')),
  discount_value  numeric(10,2) not null check (discount_value >= 0),
  min_order_value numeric(10,2) not null default 0,
  max_discount    numeric(10,2),
  expiry_date     date not null,
  usage_count     integer not null default 0,
  usage_limit     integer,
  status          text not null default 'active' check (status in ('active', 'expired', 'disabled')),
  created_at      timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Reviews
-- ---------------------------------------------------------------------------
create table public.reviews (
  id                text primary key,
  product_id        text not null references public.products (id) on delete cascade,
  customer_name     text not null,
  location          text not null default '',
  rating            integer not null check (rating between 1 and 5),
  review_date       date not null default current_date,
  title             text not null default '',
  comment           text not null default '',
  verified_purchase boolean not null default false,
  likes             integer not null default 0,
  created_at        timestamptz not null default now()
);

create index reviews_product_id_idx on public.reviews (product_id);

-- ---------------------------------------------------------------------------
-- updated_at trigger for products
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security: deny-all for anon/authenticated (server uses secret key)
-- ---------------------------------------------------------------------------
alter table public.categories enable row level security;
alter table public.products   enable row level security;
alter table public.app_users  enable row level security;
alter table public.customers  enable row level security;
alter table public.orders     enable row level security;
alter table public.coupons    enable row level security;
alter table public.reviews    enable row level security;
