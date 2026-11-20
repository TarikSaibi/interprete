-- 005 : modification d'une mission par son propriétaire
-- À exécuter dans Supabase > SQL Editor (en une fois). Idempotent.
--
-- La migration 004 (audit M1) avait supprimé la policy UPDATE et révoqué le droit UPDATE :
-- les missions n'étaient modifiables que par suppression + ressaisie. Le front propose désormais
-- « Modifier » (src/lib/missionsApi.js, updateMission) :
--   - client / notes seuls       -> seules ces 2 colonnes sont envoyées (montants figés intacts) ;
--   - date / horaires / type / pages / repas -> nouvelle saisie : amount / breakdown / meal_amount
--     recalculés au barème courant (l'utilisatrice est prévenue dans l'UI avant d'enregistrer).
--
-- Garde-fous :
--   - policy limitée au propriétaire (auth.uid() = user_id), en lecture de la ligne ET après modification ;
--   - droit UPDATE accordé colonne par colonne : id, user_id, created_at, updated_at restent non modifiables
--     (impossible de « donner » une mission à un autre compte ou d'antidater sa création) ;
--   - les contraintes de 004 (plafonds montant / repas / longueurs, cohérence du type) s'appliquent aussi aux UPDATE ;
--   - updated_at est mis à jour par le trigger missions_set_updated_at (001).

begin;

-- Droit UPDATE limité aux colonnes saisies dans le formulaire (anon : aucun droit)
revoke update on public.missions from anon, authenticated;
grant update (
  mission_date, mission_type, start_time, end_time, hours_count, pages_count,
  client, notes, amount, breakdown, meal_amount
) on public.missions to authenticated;

drop policy if exists "missions_update_own" on public.missions;
create policy "missions_update_own" on public.missions
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

commit;
