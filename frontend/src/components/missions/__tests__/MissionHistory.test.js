// Historique utilisateur : totaux mixtes heures / pages, badges, quantité, suppression, export CSV, erreurs.
// missionsApi simulé : aucun appel réseau. Données fictives.
process.env.TZ = 'Europe/Paris';

jest.mock('@/lib/supabase', () => ({ supabase: null, isSupabaseConfigured: false }));
jest.mock('@/lib/missionsApi', () => ({
  ...jest.requireActual('@/lib/missionsApi'),
  listMissionsForMonth: jest.fn(),
  deleteMission: jest.fn(),
}));
jest.mock('@/lib/format', () => ({
  ...jest.requireActual('@/lib/format'),
  downloadCsv: jest.fn(),
}));

const React = require('react');
const { act } = require('react');
const { createRoot } = require('react-dom/client');
const api = require('@/lib/missionsApi');
const format = require('@/lib/format');
const { MissionHistory } = require('@/components/missions/MissionHistory');

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const HOURLY = {
  id: 'h1', mission_date: '2026-11-13', mission_type: 'hourly', start_time: '21:00:00', end_time: '01:00:00',
  hours_count: 4, pages_count: null, amount: '250.80', meal_amount: '20.00', client: 'Tribunal X', notes: null,
  breakdown: [{ label: '1ère heure', clockLabel: 'ven. 21:00', regimeLabel: 'Lundi au vendredi, de 7h à 22h', rate: 65 }],
};
const PAGES = {
  id: 'p1', mission_date: '2026-11-20', mission_type: 'pages', start_time: null, end_time: null,
  hours_count: null, pages_count: 3, amount: '115.50', meal_amount: '0.00', client: null, notes: 'Jugement',
  breakdown: [{ label: 'Traduction écrite', clockLabel: '3 pages × 38,50 €', regimeLabel: 'Page de 250 mots (texte en français)', rate: 115.5 }],
};
const LEGACY = { // ancienne ligne sans mission_type
  id: 'l1', mission_date: '2026-11-02', start_time: '09:00:00', end_time: '10:00:00', hours_count: 1,
  amount: '65.00', meal_amount: null, client: null, notes: null, breakdown: [],
};

let container;
let root;
let confirmSpy;
beforeEach(() => {
  api.listMissionsForMonth.mockResolvedValue([HOURLY, PAGES]);
  api.deleteMission.mockResolvedValue(undefined);
  confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
  confirmSpy.mockRestore();
});

const flush = () => act(async () => {});
const text = (el = container) => el.textContent.replace(/[  ]/g, ' ');
const table = () => container.querySelector('table');
const mobile = () => container.querySelector('.md\\:hidden');
async function renderHistory(props = {}) {
  act(() => root.render(<MissionHistory month="2026-11" onMonthChange={() => {}} refreshToken={0} {...props} />));
  await flush();
}

test('charge le mois demandé et affiche les totaux mixtes heures + pages', async () => {
  await renderHistory();
  expect(api.listMissionsForMonth).toHaveBeenCalledWith('2026-11');
  const t = text();
  expect(t).toContain('Missions2');
  expect(t).toContain('4 h');
  expect(t).toContain('+ 3 pages traduites');
  expect(t).toContain('CA du mois386,30 €'); // prestations 366,30 + repas 20
  expect(t).toContain('dont prestations 366,30 €');
  expect(t).toContain('dont repas 20,00 €');
  expect(t).toContain('Interprétariat : 4 hCA 270,80 € (dont repas 20,00 €)');
  expect(t).toContain('Traduction écrite : 3 pagesCA 115,50 €');
  expect(t).not.toMatch(/NaN|undefined|vacation/i);
});

test('tableau : badges Oral / Écrit, colonne Quantité, horaires 24 h, « — » sans repas', async () => {
  await renderHistory();
  const headers = [...table().querySelectorAll('th')].map((th) => th.textContent);
  expect(headers).toEqual(['', 'Date', 'Type / horaires', 'Client / lieu', 'Quantité', 'Prestations', 'Repas', 'CA', '']);
  const rows = [...table().querySelectorAll('tbody tr')].map((r) => text(r));
  expect(rows[0]).toContain('Oral');
  expect(rows[0]).toContain('21:00 → 01:00');
  expect(rows[0]).toContain('4 h');
  expect(rows[0]).toMatch(/13\/11\/2026/);
  expect(rows[1]).toContain('Écrit');
  expect(rows[1]).toContain('Traduction écrite');
  expect(rows[1]).toContain('3 pages');
  expect(rows[1]).toContain('115,50 €');
  const cells = [...table().querySelectorAll('tbody tr')[1].querySelectorAll('td')].map((td) => text(td));
  expect(cells[6]).toBe('—'); // repas
  const foot = text(table().querySelector('tfoot'));
  expect(foot).toContain('Sous-total interprétariat4 h250,80 €20,00 €270,80 €');
  expect(foot).toContain('Sous-total traduction écrite3 pages115,50 €—115,50 €');
  expect(foot).toContain('4 h · 3 p.366,30 €20,00 €386,30 €');
});

test('mobile : cartes avec quantité et total', async () => {
  await renderHistory();
  const t = text(mobile());
  expect(t).toContain('Traduction écrite · 3 pages');
  expect(t).toContain('21:00 → 01:00 · 4 h');
  expect(t).toContain('4 h · 3 pages');
});

test('ancienne mission sans type : badge Oral, quantité en heures', async () => {
  api.listMissionsForMonth.mockResolvedValue([LEGACY]);
  await renderHistory();
  const row = text(table().querySelector('tbody tr'));
  expect(row).toContain('Oral');
  expect(row).toContain('1 h');
  expect(row).toContain('09:00 → 10:00');
  expect(text()).not.toContain('pages traduites');
});

test('mois vide : message et export CSV désactivé', async () => {
  api.listMissionsForMonth.mockResolvedValue([]);
  await renderHistory();
  expect(text()).toContain('Aucune mission ce mois-ci.');
  expect(container.querySelector('[aria-label="Exporter le mois en CSV"]').disabled).toBe(true);
});

test('erreur de chargement traduite en français', async () => {
  api.listMissionsForMonth.mockRejectedValue(new Error('JWT expired'));
  await renderHistory();
  expect(container.querySelector('[role="alert"]').textContent).toBe('Chargement impossible : Session expirée : reconnecte-toi.');
});

test('suppression confirmée : deleteMission(id) et ligne retirée', async () => {
  await renderHistory();
  const del = container.querySelector('[aria-label="Supprimer la mission du 20/11/2026"]');
  await act(async () => del.click());
  expect(confirmSpy.mock.calls[0][0]).toMatch(/Traduction écrite/);
  expect(api.deleteMission).toHaveBeenCalledWith('p1');
  expect(container.querySelector('[aria-label="Supprimer la mission du 20/11/2026"]')).toBeNull();
  expect(text()).toContain('Missions1');
});

test('suppression annulée : aucun appel', async () => {
  confirmSpy.mockReturnValue(false);
  await renderHistory();
  await act(async () => container.querySelector('[aria-label="Supprimer la mission du 13/11/2026"]').click());
  expect(api.deleteMission).not.toHaveBeenCalled();
});

test('export CSV : colonnes Type / Pages, montants à virgule, dates jj/mm/aaaa', async () => {
  await renderHistory();
  act(() => container.querySelector('[aria-label="Exporter le mois en CSV"]').click());
  const [filename, rows] = format.downloadCsv.mock.calls[0];
  expect(filename).toBe('missions-2026-11.csv');
  expect(rows[0]).toEqual(['Date', 'Type', 'Début', 'Fin', 'Heures facturées', 'Pages', 'Prestations (EUR)', 'Repas (EUR)', 'CA (EUR)', 'Client / lieu', 'Notes']);
  expect(rows[1]).toEqual(['13/11/2026', 'Interprétariat', '21:00', '01:00', 4, '', '250,80', '20,00', '270,80', 'Tribunal X', null]);
  expect(rows[2]).toEqual(['20/11/2026', 'Traduction écrite', '', '', '', 3, '115,50', '0,00', '115,50', null, 'Jugement']);
});

test('détail dépliable : montant figé du breakdown affiché', async () => {
  await renderHistory();
  const toggles = container.querySelectorAll('table [aria-expanded]');
  act(() => toggles[1].click());
  expect(text(table())).toContain('3 pages × 38,50 €');
  expect(text(table())).toContain('Notes : Jugement');
});

test('navigation : mois précédent / suivant', async () => {
  const months = [];
  await renderHistory({ onMonthChange: (m) => months.push(m) });
  act(() => container.querySelector('[aria-label="Mois précédent"]').click());
  act(() => container.querySelector('[aria-label="Mois suivant"]').click());
  expect(months).toEqual(['2026-10', '2026-12']);
});
