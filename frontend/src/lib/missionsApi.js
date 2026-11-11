import { supabase } from '@/lib/supabase';

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
export async function createMission({ type = 'hourly', date, startTime, endTime, client, notes, mealAmount = 0 }, result) {
  const common = {
    mission_date: date,
    client: client?.trim() || null,
    notes: notes?.trim() || null,
    amount: result.total,
    breakdown: frozenBreakdown(result),
  };
  const row =
    type === 'pages'
      ? { ...common, mission_type: 'pages', pages_count: result.pagesCount, start_time: null, end_time: null, hours_count: null, meal_amount: 0 }
      : { ...common, start_time: startTime, end_time: endTime, hours_count: result.hoursCount, meal_amount: mealAmount };
  const { data, error } = await supabase
    .from('missions')
    .insert(row)
    .select()
    .single();
  if (error) throw error;
  return data;
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
