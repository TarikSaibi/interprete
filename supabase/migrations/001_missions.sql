-- Historique des missions d'interprétariat
-- À exécuter dans Supabase : Dashboard > SQL Editor > New query > coller > Run

create table if not exists public.missions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null default auth.uid() references auth.users (id) on delete cascade,
  mission_date  date not null,
  start_time    time not null,
  end_time      time not null,
  client        text,                      -- juridiction / commissariat / donneur d'ordre
  notes         text,
  hours_count   integer not null check (hours_count > 0),
  amount        numeric(10, 2) not null check (amount >= 0),
  breakdown     jsonb not null default '[]'::jsonb, -- détail heure par heure figé au moment de la saisie
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists missions_user_date_idx on public.missions (user_id, mission_date);

-- Mise à jour automatique de updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists missions_set_updated_at on public.missions;
create trigger missions_set_updated_at
  before update on public.missions
  for each row execute function public.set_updated_at();

-- Row Level Security : chaque utilisateur ne voit / modifie que ses propres missions
alter table public.missions enable row level security;

drop policy if exists "missions_select_own" on public.missions;
create policy "missions_select_own" on public.missions
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "missions_insert_own" on public.missions;
create policy "missions_insert_own" on public.missions
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "missions_update_own" on public.missions;
create policy "missions_update_own" on public.missions
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "missions_delete_own" on public.missions;
create policy "missions_delete_own" on public.missions
  for delete to authenticated using (auth.uid() = user_id);
