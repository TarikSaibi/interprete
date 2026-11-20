import { missionTotal } from '@/lib/format';

const MONTH_SHORT = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
const MONTH_LONG = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const round2 = (n) => Math.round(n * 100) / 100;

// Variation relative en % de prev à cur (null si pas de base de comparaison)
export const variation = (cur, prev) => (prev > 0 ? ((cur - prev) / prev) * 100 : null);

// « +12,5 % » / « −3,0 % » / « — »
export const pct = (v) => {
  if (v === null || v === undefined || !Number.isFinite(v)) return '—';
  const s = Math.abs(v).toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  return `${v > 0 ? '+' : v < 0 ? '−' : ''}${s} %`;
};

// CA par mois de l'année `year` et de l'année précédente, à partir des montants ENREGISTRÉS
// (amount + meal_amount figés à la saisie, jamais recalculés).
export function yearlyCA(missions, year) {
  const months = MONTH_SHORT.map((short, i) => ({
    index: i,
    month: `${year}-${String(i + 1).padStart(2, '0')}`,
    short,
    long: MONTH_LONG[i],
    ca: 0,
    count: 0,
    prev: 0,
    prevCount: 0,
  }));
  for (const m of missions) {
    const y = Number(m.mission_date.slice(0, 4));
    const i = Number(m.mission_date.slice(5, 7)) - 1;
    if (y === year) {
      months[i].ca += missionTotal(m);
      months[i].count += 1;
    } else if (y === year - 1) {
      months[i].prev += missionTotal(m);
      months[i].prevCount += 1;
    }
  }
  months.forEach((r) => {
    r.ca = round2(r.ca);
    r.prev = round2(r.prev);
    r.variation = variation(r.ca, r.prev);
  });
  const total = round2(months.reduce((s, r) => s + r.ca, 0));
  const prevTotal = round2(months.reduce((s, r) => s + r.prev, 0));
  return {
    year,
    months,
    total,
    prevTotal,
    count: months.reduce((s, r) => s + r.count, 0),
    prevCount: months.reduce((s, r) => s + r.prevCount, 0),
    variation: variation(total, prevTotal),
  };
}
