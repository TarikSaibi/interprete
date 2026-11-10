-- Frais de repas (forfait) par mission, distincts du montant des vacations (amount)
alter table public.missions
  add column if not exists meal_amount numeric(10, 2) not null default 0 check (meal_amount >= 0);
