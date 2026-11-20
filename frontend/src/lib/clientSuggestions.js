// Suggestions de clients (commissariats, tribunaux…) à partir des missions déjà saisies.

// Clé de comparaison : casse, accents et espaces multiples ignorés
export const clientKey = (s) =>
  String(s || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

// rows : [{ client, mission_date }] -> libellés distincts, triés par fréquence puis récence.
// Le libellé retenu pour un client est sa saisie la plus récente.
export function rankClients(rows) {
  const map = new Map();
  for (const r of rows || []) {
    const label = String(r.client || '').replace(/\s+/g, ' ').trim();
    const key = clientKey(label);
    if (!key) continue;
    const date = r.mission_date || '';
    const e = map.get(key);
    if (!e) map.set(key, { label, count: 1, last: date });
    else {
      e.count += 1;
      if (date > e.last) Object.assign(e, { last: date, label });
    }
  }
  return [...map.values()]
    .sort((a, b) => b.count - a.count || b.last.localeCompare(a.last) || a.label.localeCompare(b.label, 'fr'))
    .map((e) => e.label);
}

// Suggestions affichées pour la saisie courante : contient le texte (sans tenir compte des accents/casse),
// en excluant la valeur exacte déjà saisie.
export function filterClients(clients, query, max = 6) {
  const q = clientKey(query);
  return clients.filter((c) => clientKey(c) !== q && (!q || clientKey(c).includes(q))).slice(0, max);
}
