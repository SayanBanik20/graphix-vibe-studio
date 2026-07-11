create extension if not exists pgcrypto;

alter table public.products
  add column if not exists min_photo_count integer not null default 0 check (min_photo_count >= 0),
  add column if not exists max_photo_count integer not null default 0 check (max_photo_count >= 0),
  add column if not exists photo_upload_label text,
  add column if not exists photo_upload_description text;

create table if not exists public.product_uploads (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  cart_item_key text,
  order_item_id uuid references public.order_items(id) on delete cascade,
  uploaded_by uuid references public.users(id) on delete cascade,
  file_name text not null,
  storage_path text,
  public_url text,
  mime_type text,
  size_bytes integer,
  created_at timestamptz not null default now()
);

alter table public.product_uploads enable row level security;

create policy "Users can manage their product uploads" on public.product_uploads for all using (
  auth.uid() = uploaded_by
) with check (
  auth.uid() = uploaded_by
);
