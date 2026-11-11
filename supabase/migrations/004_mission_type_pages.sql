-- 004 : missions de traduction écrite (facturées à la page) + durcissement de la table missions
-- À exécuter dans Supabase > SQL Editor (en une fois). Idempotent autant que possible.
--
-- Les missions existantes deviennent mission_type = 'hourly' (valeur par défaut) ; leurs montants
-- (amount / breakdown / meal_amount, figés à la saisie) ne sont pas modifiés.
-- Plafonds repris des constantes de frontend/src/lib/caCalculator.js (avec marge, pour absorber
-- une revalorisation du barème sans migration) :
--   - heures : 1 à 24 par mission (computeMissionCA : durée < 24 h, heure commencée due) ;
--   - pages  : 1 à 1000 (MAX_PAGES) ;
--   - montant ≤ 100 € par heure ou par page (barème actuel max : 88,50 € l'heure, 38,50 € la page) ;
--   - repas ≤ 100 € (MEAL_ALLOWANCE = 20 €).

begin;

-- ---------------------------------------------------------------------------
-- 1. Type de mission et nombre de pages
-- ---------------------------------------------------------------------------
alter table public.missions
  add column if not exists mission_type text not null default 'hourly',
  add column if not exists pages_count  integer;

-- Traduction écrite : pas d'horaires ni d'heures facturées
alter table public.missions alter column start_time  drop not null;
alter table public.missions alter column end_time    drop not null;
alter table public.missions alter column hours_count drop not null;
-- Ancienne contrainte "hours_count > 0" (nom généré par 001), remplacée par la contrainte de cohérence
alter table public.missions drop constraint if exists missions_hours_count_check;

alter table public.missions drop constraint if exists missions_type_check;
alter table public.missions add constraint missions_type_check
  check (mission_type in ('hourly', 'pages'));

-- Cohérence selon le type (toutes les lignes existantes sont 'hourly' avec horaires et heures > 0)
alter table public.missions drop constraint if exists missions_type_consistency;
alter table public.missions add constraint missions_type_consistency check (
  (mission_type = 'hourly'
     and start_time is not null and end_time is not null
     and hours_count between 1 and 24
     and pages_count is null)
  or
  (mission_type = 'pages'
     and pages_count between 1 and 1000
     and hours_count is null and start_time is null and end_time is null
     and meal_amount = 0)
);

-- ---------------------------------------------------------------------------
-- 2. Garde-fous sur les valeurs saisies (audit sécurité M1)
--    Ajoutés NOT VALID (appliqués à toute nouvelle ligne), puis validés sur l'existant
--    dans le bloc DO ci-dessous : si une ancienne ligne ne respecte pas un plafond, la
--    contrainte reste NOT VALID et un NOTICE l'indique (rien n'est bloqué ni modifié).
-- ---------------------------------------------------------------------------
alter table public.missions drop constraint if exists missions_amount_cap;
alter table public.missions add constraint missions_amount_cap check (
  amount >= 0
  and amount <= 100 * coalesce(case when mission_type = 'pages' then pages_count else hours_count end, 0)
) not valid;

alter table public.missions drop constraint if exists missions_meal_cap;
alter table public.missions add constraint missions_meal_cap
  check (meal_amount >= 0 and meal_amount <= 100) not valid;

alter table public.missions drop constraint if exists missions_client_length;
alter table public.missions add constraint missions_client_length
  check (client is null or char_length(client) <= 200) not valid;

alter table public.missions drop constraint if exists missions_notes_length;
alter table public.missions add constraint missions_notes_length
  check (notes is null or char_length(notes) <= 2000) not valid;

-- breakdown est toujours un tableau JSON côté front (une entrée par heure, ou une entrée pour les pages)
alter table public.missions drop constraint if exists missions_breakdown_array;
alter table public.missions add constraint missions_breakdown_array
  check (jsonb_typeof(breakdown) = 'array') not valid;

do $$
declare
  c text;
begin
  foreach c in array array[
    'missions_amount_cap', 'missions_meal_cap', 'missions_client_length',
    'missions_notes_length', 'missions_breakdown_array'
  ] loop
    begin
      execute format('alter table public.missions validate constraint %I', c);
    exception when check_violation then
      raise notice 'Contrainte % laissée NOT VALID : des lignes existantes la dépassent (non modifiées).', c;
    end;
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- 3. Missions non modifiables via l'API (M1) : suppression puis ressaisie uniquement
-- ---------------------------------------------------------------------------
drop policy if exists "missions_update_own" on public.missions;
revoke update on public.missions from anon, authenticated;

-- Privilèges inutiles (I3)
revoke truncate, references, trigger on public.missions, public.admins from anon, authenticated;

-- ---------------------------------------------------------------------------
-- 4. Horodatage imposé par le serveur à l'insertion + search_path figé (F7)
-- ---------------------------------------------------------------------------
create or replace function public.set_created_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.created_at = pg_catalog.now();
  new.updated_at = pg_catalog.now();
  return new;
end;
$$;

drop trigger if exists missions_set_created_at on public.missions;
create trigger missions_set_created_at
  before insert on public.missions
  for each row execute function public.set_created_at();

alter function public.set_updated_at() set search_path = '';

revoke all on function public.set_created_at() from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- 5. Liste admin : ajoute mission_type et pages_count (type de retour modifié => drop + create)
-- ---------------------------------------------------------------------------
drop function if exists public.admin_list_missions(date, date);

create function public.admin_list_missions(p_from date, p_to date)
returns table (
  id           uuid,
  user_id      uuid,
  user_email   text,
  mission_date date,
  mission_type text,
  start_time   time,
  end_time     time,
  client       text,
  notes        text,
  hours_count  integer,
  pages_count  integer,
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
    select m.id, m.user_id, u.email::text, m.mission_date, m.mission_type, m.start_time, m.end_time,
           m.client, m.notes, m.hours_count, m.pages_count, m.amount, m.meal_amount, m.breakdown, m.created_at
    from public.missions m
    join auth.users u on u.id = m.user_id
    where m.mission_date >= p_from and m.mission_date < p_to
    order by u.email, m.mission_date, m.start_time nulls last, m.created_at;
end;
$$;

revoke all on function public.admin_list_missions(date, date) from public, anon;
grant execute on function public.admin_list_missions(date, date) to authenticated;

commit;
