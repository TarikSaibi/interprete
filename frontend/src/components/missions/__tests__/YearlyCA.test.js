// Vue annuelle du CA : agrégation N / N-1, navigation entre années, mobile = liste, ≥ md = tableau + graphique.
// missionsApi simulé : aucun appel réseau. Données fictives.
process.env.TZ = 'Europe/Paris';

jest.mock('@/lib/supabase', () => ({ supabase: null, isSupabaseConfigured: false }));
jest.mock('@/lib/missionsApi', () => ({
  ...jest.requireActual('@/lib/missionsApi'),
  listMissionsForYears: jest.fn(),
}));

const React = require('react');
const { act } = require('react');
const { createRoot } = require('react-dom/client');
const api = require('@/lib/missionsApi');
const { YearlyCA } = require('@/components/missions/YearlyCA');

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const DATA = [
  { id: 1, mission_date: '2026-01-13', mission_type: 'hourly', amount: '250.80', meal_amount: '20.00' },
  { id: 2, mission_date: '2026-03-20', mission_type: 'pages', amount: '115.50', meal_amount: '0.00' },
  { id: 3, mission_date: '2025-01-02', mission_type: 'hourly', amount: '200.00', meal_amount: null },
];

let container;
let root;
beforeEach(() => {
  api.listMissionsForYears.mockResolvedValue(DATA);
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

const flush = () => act(async () => {});
const text = (el = container) => el.textContent.replace(/[\u00a0\u202f]/g, ' ');
const $ = (s) => container.querySelector(s);
async function renderYear(props = {}) {
  act(() => root.render(<YearlyCA userId="u-test" initialYear={2026} refreshToken={0} {...props} />));
  await flush();
}

test('charge N et N-1 pour l\'utilisateur ; totaux et évolution', async () => {
  await renderYear();
  expect(api.listMissionsForYears).toHaveBeenCalledWith('u-test', 2025, 2026);
  expect(text($('[data-testid="year-total"]'))).toBe('386,30 €');
  expect(text()).toContain('CA 2025200,00 €');
  expect(text($('[data-testid="year-variation"]'))).toBe('+93,2 %');
  expect(text()).toContain('écart 186,30 €');
  expect(text()).not.toMatch(/NaN|undefined|vacation/i);
});

test('mobile : liste des 12 mois + total', async () => {
  await renderYear();
  const list = $('ul.md\\:hidden');
  const items = list.querySelectorAll('li');
  expect(items).toHaveLength(13);
  expect(text(items[0])).toContain('janvier');
  expect(text(items[0])).toContain('270,80 €');
  expect(text(items[0])).toContain('CA 2025 : 200,00 €');
  expect(text(items[0])).toContain('+35,4 %');
  expect(text(items[2])).toContain('—'); // mars : pas de base N-1
  expect(text(items[12])).toContain('Total 2026');
});

test('≥ md : tableau mensuel + graphique', async () => {
  await renderYear();
  const table = $('.hidden.md\\:block table');
  const headers = [...table.querySelectorAll('th')].map((th) => th.textContent);
  expect(headers).toEqual(['Mois', 'Missions', 'CA 2026', 'CA 2025', 'Évolution']);
  expect(table.querySelectorAll('tbody tr')).toHaveLength(12);
  expect(text(table.querySelector('tfoot'))).toContain('Total 20262386,30 €200,00 €+93,2 %');
  expect($('[role="img"]').getAttribute('aria-label')).toContain('2026 comparé à 2025');
  expect($('.recharts-wrapper')).not.toBeNull();
});

test('navigation année précédente / suivante', async () => {
  await renderYear();
  await act(async () => $('[aria-label="Année précédente"]').click());
  expect(api.listMissionsForYears).toHaveBeenLastCalledWith('u-test', 2024, 2025);
  expect(text($('[data-testid="year-total"]'))).toBe('200,00 €');
  await act(async () => $('[aria-label="Année suivante"]').click());
  await act(async () => $('[aria-label="Année suivante"]').click());
  expect(api.listMissionsForYears).toHaveBeenLastCalledWith('u-test', 2026, 2027);
  expect($('[aria-label="Année suivante"]').className).toContain('h-10 w-10');
});

test('rechargement quand refreshToken change', async () => {
  await renderYear();
  await renderYear({ refreshToken: 1 });
  expect(api.listMissionsForYears).toHaveBeenCalledTimes(2);
});

test('erreur de chargement traduite', async () => {
  api.listMissionsForYears.mockRejectedValue(new Error('Failed to fetch'));
  await renderYear();
  expect(text($('[role="alert"]'))).toContain('Chargement impossible : Connexion au serveur impossible');
});
