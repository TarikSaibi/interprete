import { supabase } from '@/lib/supabase';
import { hhmm, meal } from '@/lib/format';

// month: 'YYYY-MM' -> bornes [premier jour, premier jour du mois suivant[
export function monthBounds(month) {
  const [y, m] = month.split('-').map(Number);
  const pad = (n) => String(n).padStart(2, '0');
  const next = m === 12 ? `${y + 1}-01` : `${y}-${pad(m + 1)}`;
  return { from: `${month}-01`, to: `${next}-01` };
}

export function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function shiftMonth(month, delta) {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export async function listMissionsForMonth(month) {
  const { from, to } = monthBounds(month);
  const { data, error } = await supabase
    .from('missions')
    .select('*')
    .gte('mission_date', from)
    .lt('mission_date', to)
    .order('mission_date', { ascending: true })
    .order('start_time', { ascending: true });
  if (error) throw error;
  return data;
}

const frozenBreakdown = (result) =>
  result.breakdown.map(({ label, clockLabel, regimeLabel, rate }) => ({ label, clockLabel, regimeLabel, rate }));

// type 'hourly' (défaut) : result = sortie de computeMissionCA
// type 'pages'           : result = sortie de computePagesCA (pas d'horaires ni de repas)
// Le montant et le détail sont figés à la saisie.
const metaFields = ({ client, notes }) => ({ client: client?.trim() || null, notes: notes?.trim() || null });

function missionRow({ type = 'hourly', date, startTime, endTime, client, notes, mealAmount = 0 }, result) {
  const common = {
    mission_date: date,
    ...metaFields({ client, notes }),
    amount: result.total,
    breakdown: frozenBreakdown(result),
  };
  return type === 'pages'
    ? { ...common, mission_type: 'pages', pages_count: result.pagesCount, start_time: null, end_time: null, hours_count: null, meal_amount: 0 }
    : { ...common, start_time: startTime, end_time: endTime, hours_count: result.hoursCount, meal_amount: mealAmount };
}

export async function createMission(input, result) {
  const { data, error } = await supabase
    .from('missions')
    .insert(missionRow(input, result))
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Nature d'une modification par rapport à la mission enregistrée :
//   'none'   : rien ne change ;
//   'meta'   : seuls client / notes changent -> amount / breakdown / meal_amount conservés tels quels ;
//   'recalc' : date, horaires, type, pages ou repas changent -> nouvelle saisie, CA recalculé au barème courant.
// input : { type, date, startTime, endTime, pages, mealAmount, client, notes } (valeurs du formulaire)
export function missionChangeKind(original, input) {
  const origType = original.mission_type === 'pages' ? 'pages' : 'hourly';
  const type = input.type || 'hourly';
  const recalc =
    type !== origType ||
    input.date !== original.mission_date ||
    (type === 'hourly'
      ? input.startTime !== hhmm(original.start_time) ||
        input.endTime !== hhmm(original.end_time) ||
        (Number(input.mealAmount) > 0) !== (meal(original) > 0)
      : Number(input.pages) !== Number(original.pages_count));
  if (recalc) return 'recalc';
  const m = metaFields(input);
  return m.client !== (original.client || null) || m.notes !== (original.notes || null) ? 'meta' : 'none';
}

// Modifie une mission (RLS : propriétaire uniquement, migration 005).
// 'meta' : n'envoie QUE client / notes (montants figés intacts) ; 'recalc' : ligne complète issue de result.
export async function updateMission(original, input, result) {
  const kind = missionChangeKind(original, input);
  if (kind === 'none') return original;
  let patch;
  if (kind === 'meta') {
    patch = metaFields(input);
  } else {
    if (!result) throw new Error('Calcul du CA impossible : vérifie la saisie.');
    patch = missionRow(input, result);
    if ((input.type || 'hourly') === 'hourly') Object.assign(patch, { mission_type: 'hourly', pages_count: null });
  }
  const { data, error } = await supabase
    .from('missions')
    .update(patch)
    .eq('id', original.id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Missions de l'utilisateur sur les années [fromYear, toYear] (colonnes utiles au CA uniquement).
// Filtre explicite sur user_id en plus de la RLS ; pagination (l'API renvoie 1000 lignes max par requête).
const PAGE_SIZE = 1000;
export async function listMissionsForYears(userId, fromYear, toYear) {
  const rows = [];
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const { data, error } = await supabase
      .from('missions')
      .select('id, mission_date, mission_type, amount, meal_amount')
      .eq('user_id', userId)
      .gte('mission_date', `${fromYear}-01-01`)
      .lt('mission_date', `${toYear + 1}-01-01`)
      .order('mission_date', { ascending: true })
      .order('id', { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1);
    if (error) throw error;
    rows.push(...(data || []));
    if (!data || data.length < PAGE_SIZE) return rows;
  }
}

// Clients déjà saisis par l'utilisateur (500 missions les plus récentes), pour les suggestions
export async function listRecentClients(userId) {
  const { data, error } = await supabase
    .from('missions')
    .select('client, mission_date')
    .eq('user_id', userId)
    .not('client', 'is', null)
    .order('mission_date', { ascending: false })
    .limit(500);
  if (error) throw error;
  return data || [];
}

export async function deleteMission(id) {
  const { error } = await supabase.from('missions').delete().eq('id', id);
  if (error) throw error;
}

// ---- Admin ----
export async function fetchIsAdmin() {
  const { data, error } = await supabase.rpc('is_admin');
  if (error) return false;
  return data === true;
}

export async function adminListMissionsForMonth(month) {
  const { from, to } = monthBounds(month);
  const { data, error } = await supabase.rpc('admin_list_missions', { p_from: from, p_to: to });
  if (error) throw error;
  return data;
}

// Invitation d'un utilisateur (Edge Function "invite-user", vérifie le rôle admin côté serveur)
export async function inviteUser(email) {
  const { data, error } = await supabase.functions.invoke('invite-user', { body: { email } });
  if (error) {
    // Récupère le message renvoyé par la fonction si disponible
    let message = error.message;
    try {
      const body = await error.context?.json();
      if (body?.error) message = body.error;
    } catch {
      /* corps non JSON */
    }
    throw new Error(message);
  }
  return data;
}
