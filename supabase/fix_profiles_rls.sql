-- Ensure RLS is enabled on profiles
alter table if exists public.profiles enable row level security;

-- Recreate policies for profiles (idempotent)
drop policy if exists "profiles are readable by everyone" on public.profiles;
drop policy if exists "users can insert own profile" on public.profiles;
drop policy if exists "users can update own profile" on public.profiles;

create policy "profiles are readable by everyone"
on public.profiles for select
to authenticated, anon
using (true);

create policy "users can insert own profile"
on public.profiles for insert
to authenticated
with check (auth.uid() = id);

create policy "users can update own profile"
on public.profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- Backfill missing profile rows for existing auth users
insert into public.profiles (id, username)
select
  u.id,
  coalesce(u.raw_user_meta_data ->> 'username', split_part(u.email, '@', 1))
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;
