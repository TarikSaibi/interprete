// Suggestions de clients : valeurs distinctes, tri fréquence puis récence, filtre sans accents ni casse.
const { rankClients, filterClients, clientKey } = require('../clientSuggestions');

describe('rankClients', () => {
  test('distincts (casse / accents / espaces ignorés), tri fréquence puis récence', () => {
    const rows = [
      { client: 'Tribunal judiciaire de Paris', mission_date: '2026-01-01' },
      { client: 'Commissariat Paris 18e', mission_date: '2026-11-10' },
      { client: 'tribunal  judiciaire de paris', mission_date: '2026-02-01' },
      { client: 'Gendarmerie de Créteil', mission_date: '2026-11-15' },
      { client: 'TRIBUNAL JUDICIAIRE DE PARIS ', mission_date: '2025-06-01' },
      { client: '   ', mission_date: '2026-11-20' },
      { client: null, mission_date: '2026-11-20' },
    ];
    expect(rankClients(rows)).toEqual([
      'tribunal judiciaire de paris', // 3 fois ; libellé de la saisie la plus récente
      'Gendarmerie de Créteil', // 1 fois, plus récent
      'Commissariat Paris 18e',
    ]);
  });
  test('entrée vide', () => {
    expect(rankClients([])).toEqual([]);
    expect(rankClients(undefined)).toEqual([]);
  });
});

describe('filterClients', () => {
  const clients = ['Commissariat Paris 18e', 'Gendarmerie de Créteil', 'Tribunal de Créteil', 'A', 'B', 'C', 'D'];
  test('sans saisie : les premiers (max 6)', () => {
    expect(filterClients(clients, '')).toHaveLength(6);
  });
  test('contient, sans accents ni casse', () => {
    expect(filterClients(clients, 'CRETEIL')).toEqual(['Gendarmerie de Créteil', 'Tribunal de Créteil']);
  });
  test('valeur exacte déjà saisie exclue', () => {
    expect(filterClients(clients, 'tribunal de creteil')).toEqual([]);
  });
  test('clientKey', () => {
    expect(clientKey('  Éé  À ')).toBe('ee a');
  });
});
