// Formats français partagés (historique utilisateur + admin)
export const eur = (n) =>
  `${Number(n).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
export const hhmm = (t) => (t || '').slice(0, 5);
export const formatDate = (iso) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' });
export const isoToFr = (iso) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}`;
export const monthLabel = (month) =>
  new Date(`${month}-01T00:00:00`).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
export const meal = (m) => Number(m.meal_amount || 0);
export const missionTotal = (m) => Number(m.amount) + meal(m);
export const csvNum = (n) => Number(n).toFixed(2).replace('.', ',');

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
