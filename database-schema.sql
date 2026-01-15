-- ============================================
-- DATABASE SCHEMA (Supabase/Postgres) - Agenda Studente
-- ============================================

create extension if not exists "pgcrypto";

-- Helper trigger updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================
-- ORARIO
-- ============================================
create table if not exists public.orario (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  schedule_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id)
);

alter table public.orario enable row level security;

drop policy if exists "View own schedule" on public.orario;
drop policy if exists "Insert own schedule" on public.orario;
drop policy if exists "Update own schedule" on public.orario;
drop policy if exists "Delete own schedule" on public.orario;

create policy "View own schedule" on public.orario
for select using (auth.uid() = user_id);

create policy "Insert own schedule" on public.orario
for insert with check (auth.uid() = user_id);

create policy "Update own schedule" on public.orario
for update using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Delete own schedule" on public.orario
for delete using (auth.uid() = user_id);

drop trigger if exists trg_orario_updated_at on public.orario;
create trigger trg_orario_updated_at
before update on public.orario
for each row execute function public.set_updated_at();


-- ============================================
-- COMPITI
-- ============================================
create table if not exists public.compiti (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  descrizione text not null,
  data date not null,
  completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.compiti enable row level security;

drop policy if exists "View own tasks" on public.compiti;
drop policy if exists "Insert own tasks" on public.compiti;
drop policy if exists "Update own tasks" on public.compiti;
drop policy if exists "Delete own tasks" on public.compiti;

create policy "View own tasks" on public.compiti
for select using (auth.uid() = user_id);

create policy "Insert own tasks" on public.compiti
for insert with check (auth.uid() = user_id);

create policy "Update own tasks" on public.compiti
for update using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Delete own tasks" on public.compiti
for delete using (auth.uid() = user_id);

drop trigger if exists trg_compiti_updated_at on public.compiti;
create trigger trg_compiti_updated_at
before update on public.compiti
for each row execute function public.set_updated_at();


-- ============================================
-- RIPASSO
-- ============================================
create table if not exists public.ripasso (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  argomento text not null,
  data date not null,
  priorita text not null check (priorita in ('alta','media','bassa')),
  completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.ripasso enable row level security;

drop policy if exists "View own ripasso" on public.ripasso;
drop policy if exists "Insert own ripasso" on public.ripasso;
drop policy if exists "Update own ripasso" on public.ripasso;
drop policy if exists "Delete own ripasso" on public.ripasso;

create policy "View own ripasso" on public.ripasso
for select using (auth.uid() = user_id);

create policy "Insert own ripasso" on public.ripasso
for insert with check (auth.uid() = user_id);

create policy "Update own ripasso" on public.ripasso
for update using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Delete own ripasso" on public.ripasso
for delete using (auth.uid() = user_id);

drop trigger if exists trg_ripasso_updated_at on public.ripasso;
create trigger trg_ripasso_updated_at
before update on public.ripasso
for each row execute function public.set_updated_at();


-- ============================================
-- APPUNTI
-- ============================================
create table if not exists public.appunti (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  materia text not null,
  contenuto text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.appunti enable row level security;

drop policy if exists "View own notes" on public.appunti;
drop policy if exists "Insert own notes" on public.appunti;
drop policy if exists "Update own notes" on public.appunti;
drop policy if exists "Delete own notes" on public.appunti;

create policy "View own notes" on public.appunti
for select using (auth.uid() = user_id);

create policy "Insert own notes" on public.appunti
for insert with check (auth.uid() = user_id);

create policy "Update own notes" on public.appunti
for update using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Delete own notes" on public.appunti
for delete using (auth.uid() = user_id);

drop trigger if exists trg_appunti_updated_at on public.appunti;
create trigger trg_appunti_updated_at
before update on public.appunti
for each row execute function public.set_updated_at();
