// Formats français partagés (historique utilisateur + admin)
// Montant en euros fr-FR, espace insécable avant « € » ; valeur absente / non numérique -> « — »
export const eur = (n) => {
  const v = n === null || n === undefined || n === '' ? NaN : Number(n);
  if (!Number.isFinite(v)) return '—';
  return `${v.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\u00a0€`;
};
const num = (n) => {
  const v = Number(n);
  return Number.isFinite(v) ? v : 0;
};
export const hhmm = (t) => (t || '').slice(0, 5);
export const formatDate = (iso) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' });
export const isoToFr = (iso) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}`;
export const monthLabel = (month) =>
  new Date(`${month}-01T00:00:00`).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
export const meal = (m) => num(m.meal_amount);
// CA d'une mission = prestation (amount) + repas (meal_amount), tous deux figés à la saisie
export const missionTotal = (m) => num(m.amount) + meal(m);

// Mission de traduction écrite (à la page) ; les anciennes missions sans type sont horaires
export const isPages = (m) => m.mission_type === 'pages';
export const plural = (n, word) => `${n} ${word}${n > 1 ? 's' : ''}`;
// Quantité facturée : « 3 h » ou « 12 pages »
export const missionQty = (m) => (isPages(m) ? plural(num(m.pages_count), 'page') : `${num(m.hours_count)} h`);
export const csvNum = (n) => num(n).toFixed(2).replace('.', ',');

// Totaux d'un ensemble de missions, globaux et par type, à partir des montants ENREGISTRÉS
// (amount / meal_amount figés à la saisie, jamais recalculés).
export function typeTotals(missions) {
  const t = {
    count: 0, hours: 0, pages: 0, amount: 0, meals: 0,
    oral: { count: 0, hours: 0, amount: 0, meals: 0 },
    written: { count: 0, pages: 0, amount: 0, meals: 0 },
  };
  for (const m of missions) {
    const g = isPages(m) ? t.written : t.oral;
    g.count += 1;
    g.amount += num(m.amount);
    g.meals += meal(m);
    if (isPages(m)) g.pages += num(m.pages_count);
    else g.hours += num(m.hours_count);
  }
  t.count = t.oral.count + t.written.count;
  t.hours = t.oral.hours;
  t.pages = t.written.pages;
  t.amount = t.oral.amount + t.written.amount;
  t.meals = t.oral.meals + t.written.meals;
  return t;
}

// Missions triées par date, puis heure de début (traductions écrites, sans horaire, en fin de journée)
export const sortByDate = (missions) =>
  [...missions].sort(
    (a, b) =>
      a.mission_date.localeCompare(b.mission_date) ||
      (a.start_time || '99').localeCompare(b.start_time || '99')
  );

// Lignes de fin de CSV : sous-total par type (si présent) + total général.
// Colonnes : [Date, Type, Début, Fin, Heures, Pages, Prestations, Repas, CA, Client, Notes] précédées de `lead` colonnes vides.
export function csvTotalRows(t, lead = 0) {
  const pad = Array(lead).fill('');
  const row = (label, hours, pages, amount, meals) =>
    [...pad, label, '', '', '', hours, pages, csvNum(amount), csvNum(meals), csvNum(amount + meals), '', ''];
  const rows = [[]];
  if (t.oral.count) rows.push(row('Sous-total interprétariat', t.oral.hours, '', t.oral.amount, t.oral.meals));
  if (t.written.count) rows.push(row('Sous-total traduction écrite', '', t.written.pages, t.written.amount, t.written.meals));
  rows.push(row('CA total', t.hours, t.pages, t.amount, t.meals));
  return rows;
}

// Télécharge un CSV lisible par Excel FR (BOM UTF-8 + séparateur ';')
export function downloadCsv(filename, rows) {
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csv = '﻿' + rows.map((r) => r.map(esc).join(';')).join('\r\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}
