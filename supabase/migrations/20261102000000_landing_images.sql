-- Admin-managed photos for the storefront landing page.
--   hero     : slides in the curved hero carousel (ordered by sort_order)
--   featured : optional override for the "Harvest of the Day" banner (one row)
--   category : one photo per category tile; slot = category slug
create table public.landing_images (
  id         uuid primary key default gen_random_uuid(),
  section    text not null check (section in ('hero', 'featured', 'category')),
  slot       text,
  image_url  text not null check (image_url ~ '^https://'),
  title      text not null default '',
  caption    text not null default '',
  link_url   text not null default '',
  alt        text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint landing_images_slot_check check (
    (section = 'category' and slot is not null) or (section <> 'category')
  )
);

-- One featured row, and one row per category slug.
create unique index landing_images_single_slot_idx
  on public.landing_images (section, coalesce(slot, ''))
  where section in ('featured', 'category');

create index landing_images_section_order_idx on public.landing_images (section, sort_order);

create trigger landing_images_set_updated_at
before update on public.landing_images
for each row execute function public.set_updated_at();

alter table public.landing_images enable row level security;

-- Public bucket for uploaded landing photos. Writes go through the Next.js
-- server with the secret key; anyone can read the public URLs.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('landing-images', 'landing-images', true, 5242880,
        array['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
on conflict (id) do nothing;
