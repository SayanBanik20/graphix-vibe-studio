-- Recover a profile only for the authenticated caller. This complements the
-- Auth trigger for users created before the trigger was installed or repaired.
create or replace function public.ensure_current_user_profile()
returns public.users
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  current_email text := auth.jwt() ->> 'email';
  recovered_profile public.users;
begin
  if current_user_id is null or current_email is null then
    raise exception 'Authentication is required to create a profile';
  end if;

  insert into public.users (id, email, full_name, avatar_url, role)
  values (
    current_user_id,
    current_email,
    coalesce(auth.jwt() -> 'user_metadata' ->> 'full_name', auth.jwt() -> 'user_metadata' ->> 'name'),
    auth.jwt() -> 'user_metadata' ->> 'avatar_url',
    'customer'
  )
  on conflict (id) do nothing;

  select * into recovered_profile from public.users where id = current_user_id;
  return recovered_profile;
end;
$$;

grant execute on function public.ensure_current_user_profile() to authenticated;
