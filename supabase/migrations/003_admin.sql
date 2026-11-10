-- Rôle administrateur : lecture des missions de tous les utilisateurs
-- À exécuter dans Supabase > SQL Editor

-- Liste des admins. RLS activée SANS policy : personne ne peut la lire ni la modifier via l'API,
-- seulement depuis le SQL Editor (ou les fonctions security definer ci-dessous).
create table if not exists public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;

-- L'utilisateur connecté est-il admin ?
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins a where a.user_id = auth.uid());
$$;

-- Toutes les missions d'une période, avec l'email de l'utilisateur (réservé aux admins)
create or replace function public.admin_list_missions(p_from date, p_to date)
returns table (
  id           uuid,
  user_id      uuid,
  user_email   text,
  mission_date date,
  start_time   time,
  end_time     time,
  client       text,
  notes        text,
  hours_count  integer,
  amount       numeric,
  meal_amount  numeric,
  breakdown    jsonb,
  created_at   timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Accès réservé aux administrateurs' using errcode = '42501';
  end if;

  return query
    select m.id, m.user_id, u.email::text, m.mission_date, m.start_time, m.end_time,
           m.client, m.notes, m.hours_count, m.amount, m.meal_amount, m.breakdown, m.created_at
    from public.missions m
    join auth.users u on u.id = m.user_id
    where m.mission_date >= p_from and m.mission_date < p_to
    order by u.email, m.mission_date, m.start_time;
end;
$$;

revoke all on function public.admin_list_missions(date, date) from public, anon;
grant execute on function public.admin_list_missions(date, date) to authenticated;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- ============================================================
-- Pour te nommer admin (remplacer l'email puis exécuter) :
--   insert into public.admins (user_id)
--   select id from auth.users where email = 'ton-email@exemple.com'
--   on conflict do nothing;
-- ============================================================
