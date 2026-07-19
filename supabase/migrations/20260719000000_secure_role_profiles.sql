-- Bring existing installations in line with the authenticated profile contract.
alter table public.users add column if not exists avatar_url text;
alter table public.users add column if not exists role public.user_role;
alter table public.users alter column role set default 'customer';
update public.users set role = 'customer' where role is null;
alter table public.users alter column role set not null;

-- Use only the server-side Auth trigger to create profiles. A client cannot choose a role.
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, full_name, avatar_url, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url',
    'customer'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- A SECURITY DEFINER helper keeps role enforcement in Postgres/RLS, never the client.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select role = 'admin' from public.users where id = auth.uid()), false);
$$;

-- Customers can edit only their own non-privileged profile fields.
revoke update on public.users from authenticated;
grant update (full_name, phone, avatar_url) on public.users to authenticated;

-- Customers can only create orders and order items associated with their own account.
create policy "Users create their own orders" on public.orders
  for insert with check (auth.uid() = user_id);

create policy "Users create their own order items" on public.order_items
  for insert with check (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id and orders.user_id = auth.uid()
    )
  );
