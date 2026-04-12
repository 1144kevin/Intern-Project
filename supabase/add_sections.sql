create extension if not exists pgcrypto;

create table if not exists public.sections (
	id uuid primary key default gen_random_uuid(),
	name text not null unique,
	created_by uuid references auth.users(id) on delete set null,
	created_at timestamptz not null default now()
);

alter table public.sections enable row level security;

alter table public.projects
add column if not exists section_id uuid references public.sections(id) on delete set null;

drop policy if exists "sections are readable by everyone" on public.sections;
drop policy if exists "authenticated users can create sections" on public.sections;
drop policy if exists "section owners can update sections" on public.sections;
drop policy if exists "section owners can delete sections" on public.sections;

create policy "sections are readable by everyone"
on public.sections for select
to authenticated, anon
using (true);

create policy "authenticated users can create sections"
on public.sections for insert
to authenticated
with check (auth.uid() = created_by);

create policy "section owners can update sections"
on public.sections for update
to authenticated
using (auth.uid() = created_by)
with check (auth.uid() = created_by);

create policy "section owners can delete sections"
on public.sections for delete
to authenticated
using (auth.uid() = created_by);
