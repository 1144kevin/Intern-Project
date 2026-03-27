create extension if not exists pgcrypto;

create table if not exists public.profiles (
	id uuid primary key references auth.users(id) on delete cascade,
	username text not null unique,
	created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
	insert into public.profiles (id, username)
	values (
		new.id,
		coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1))
	)
	on conflict (id) do update
	set username = excluded.username;

	return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create table if not exists public.projects (
	id uuid primary key default gen_random_uuid(),
	user_id uuid not null references auth.users(id) on delete cascade,
	title text not null,
	body text not null,
	image text not null,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

create table if not exists public.comments (
	id uuid primary key default gen_random_uuid(),
	project_id uuid not null references public.projects(id) on delete cascade,
	user_id uuid not null references auth.users(id) on delete cascade,
	content text not null,
	rating int not null check (rating between 1 and 5),
	user_image text not null,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.comments enable row level security;

drop policy if exists "profiles are readable by everyone" on public.profiles;
drop policy if exists "users can insert own profile" on public.profiles;
drop policy if exists "users can update own profile" on public.profiles;
drop policy if exists "projects are readable by everyone" on public.projects;
drop policy if exists "authenticated users can create projects" on public.projects;
drop policy if exists "owners can update projects" on public.projects;
drop policy if exists "owners can delete projects" on public.projects;
drop policy if exists "comments are readable by everyone" on public.comments;
drop policy if exists "authenticated users can create comments" on public.comments;
drop policy if exists "comment owners can update comments" on public.comments;
drop policy if exists "comment owners can delete comments" on public.comments;

create policy "profiles are readable by everyone"
on public.profiles for select
to authenticated, anon
using (true);

create policy "users can update own profile"
on public.profiles for update
to authenticated
using (auth.uid() = id);

create policy "projects are readable by everyone"
on public.projects for select
to authenticated, anon
using (true);

create policy "authenticated users can create projects"
on public.projects for insert
to authenticated
with check (auth.uid() = user_id);

create policy "owners can update projects"
on public.projects for update
to authenticated
using (auth.uid() = user_id);

create policy "owners can delete projects"
on public.projects for delete
to authenticated
using (auth.uid() = user_id);

create policy "comments are readable by everyone"
on public.comments for select
to authenticated, anon
using (true);

create policy "authenticated users can create comments"
on public.comments for insert
to authenticated
with check (auth.uid() = user_id);

create policy "comment owners can update comments"
on public.comments for update
to authenticated
using (auth.uid() = user_id);

create policy "comment owners can delete comments"
on public.comments for delete
to authenticated
using (auth.uid() = user_id);
