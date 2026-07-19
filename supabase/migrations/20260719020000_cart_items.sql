-- Persist each authenticated customer's cart separately from the guest cart kept in localStorage.
create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_slug text not null,
  quantity integer not null check (quantity > 0),
  photo_name text,
  attachments jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists cart_items_user_id_idx on public.cart_items (user_id);
create unique index if not exists cart_items_unique_line_idx
  on public.cart_items (user_id, product_slug, coalesce(product_id::text, ''), coalesce(photo_name, ''));

alter table public.cart_items enable row level security;
create policy "Users manage their own cart" on public.cart_items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create trigger cart_items_set_updated_at
  before update on public.cart_items for each row execute function public.set_updated_at();
