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

// result = sortie de computeMissionCA ; le montant et le détail sont figés à la saisie
export async function createMission({ date, startTime, endTime, client, notes, mealAmount = 0 }, result) {
  const { data, error } = await supabase
    .from('missions')
    .insert({
      mission_date: date,
      start_time: startTime,
      end_time: endTime,
      client: client?.trim() || null,
      notes: notes?.trim() || null,
      hours_count: result.hoursCount,
      amount: result.total,
      meal_amount: mealAmount,
      breakdown: result.breakdown.map(({ label, clockLabel, regimeLabel, rate }) => ({
        label,
        clockLabel,
        regimeLabel,
        rate,
      })),
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteMission(id) {
  const { error } = await supabase.from('missions').delete().eq('id', id);
  if (error) throw error;
}
