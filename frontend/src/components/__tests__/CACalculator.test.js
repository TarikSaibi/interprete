// Rendu de la calculatrice : modes horaire / page, durée nulle, lendemain, enregistrement.
// Supabase et missionsApi simulés : aucun appel réseau.
process.env.TZ = 'Europe/Paris';

const mockAuth = { session: null };

jest.mock('@/lib/supabase', () => ({
  isSupabaseConfigured: true,
  authLinkType: null,
  signOutAndRedirect: () => {},
  supabase: {
    auth: {
      getSession: () => Promise.resolve({ data: { session: mockAuth.session } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: () => Promise.resolve({ error: null }),
      resetPasswordForEmail: () => Promise.resolve({ error: null }),
    },
  },
}));

jest.mock('@/lib/missionsApi', () => ({
  ...jest.requireActual('@/lib/missionsApi'),
  createMission: jest.fn(),
  listMissionsForMonth: jest.fn(),
  fetchIsAdmin: jest.fn(),
  deleteMission: jest.fn(),
  updateMission: jest.fn(),
  listRecentClients: jest.fn(),
  listMissionsForYears: jest.fn(),
}));

// Vue annuelle testée à part (YearlyCA.test.js) : simple marqueur ici
jest.mock('@/components/missions/YearlyCA', () => ({
  YearlyCA: ({ userId }) => require('react').createElement('div', { 'data-testid': 'yearly-ca' }, `CA annuel ${userId}`),
}));

jest.mock('react-router-dom', () => {
  const R = require('react');
  return { Link: ({ to, children, ...p }) => R.createElement('a', { href: to, ...p }, children) };
});

const React = require('react');
const { act } = require('react');
const { createRoot } = require('react-dom/client');
const api = require('@/lib/missionsApi');
const { CACalculator } = require('@/components/CACalculator');

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let container;
let root;
beforeEach(() => {
  mockAuth.session = null;
  // resetMocks (CRA) efface les implémentations avant chaque test
  api.createMission.mockResolvedValue({ id: 1 });
  api.listMissionsForMonth.mockResolvedValue([]);
  api.fetchIsAdmin.mockResolvedValue(false);
  api.updateMission.mockResolvedValue({ id: 1 });
  api.listRecentClients.mockResolvedValue([]);
  api.listMissionsForYears.mockResolvedValue([]);
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

const flush = () => act(async () => {});
async function renderCalc({ loggedIn = false } = {}) {
  if (loggedIn) mockAuth.session = { user: { id: 'u-test', email: 'test@example.test' } };
  act(() => root.render(<CACalculator />));
  await flush();
}
const text = () => container.textContent.replace(/[  ]/g, ' ');
const $ = (sel) => container.querySelector(sel);
const byLabel = (l) => $(`[aria-label="${l}"]`);
const buttonByText = (t) => [...container.querySelectorAll('button')].find((b) => b.textContent.includes(t));
const mealBox = () => $('input[type="checkbox"]');
const saveBtn = () => buttonByText('Ajouter la mission');

function type(el, value) {
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
  act(() => {
    setter.call(el, value);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  });
}
const fillHourly = (dateDigits, start, end) => {
  type($('#mission-date'), dateDigits);
  const [sh, sm] = start.split(':');
  const [eh, em] = end.split(':');
  type(byLabel('Heure de début — heures'), sh);
  type(byLabel('Heure de début — minutes'), sm);
  type(byLabel('Heure de fin — heures'), eh);
  type(byLabel('Heure de fin — minutes'), em);
};
const switchToPages = () => act(() => buttonByText('Traduction écrite (à la page)').click());

describe('mode horaire par défaut', () => {
  test('sélecteur de mode : horaire coché, champs heures + repas visibles, pas de champ pages', async () => {
    await renderCalc();
    expect(buttonByText("Interprète (à l'heure)").getAttribute('aria-checked')).toBe('true');
    expect(buttonByText('Traduction écrite (à la page)').getAttribute('aria-checked')).toBe('false');
    expect(byLabel('Heure de début')).not.toBeNull();
    expect(byLabel('Heure de fin')).not.toBeNull();
    expect(mealBox()).not.toBeNull();
    expect(text()).toContain('Ajouter les frais de repas (20,00 €)');
    expect($('#mission-pages')).toBeNull();
    expect(text()).toContain('Date de la mission');
  });

  test('libellés français : « CA », jamais « vacation » ; barème 38,50 € / page affiché', async () => {
    await renderCalc();
    expect(text()).toContain('Calculateur de CA de mission');
    expect(text()).not.toMatch(/vacation/i);
    expect(text()).toContain('38,50 €');
  });

  test('champs anti-zoom iOS : text-base sm:text-sm', async () => {
    await renderCalc({ loggedIn: true });
    ['#mission-date', '#mission-client', '#mission-notes'].forEach((s) => expect($(s).className).toMatch(/text-base sm:text-sm/));
  });

  test('non connecté : formulaire de connexion, pas de bouton d\'enregistrement', async () => {
    await renderCalc();
    expect(saveBtn()).toBeUndefined();
    expect($('input[type="password"]')).not.toBeNull();
  });

  test('calcul affiché : mardi 10/11/2026 09:00 -> 11:30 = 3 heures, 158,00 €', async () => {
    await renderCalc();
    fillHourly('10112026', '09:00', '11:30');
    expect(text()).toContain('CA estimé de la mission');
    expect(text()).toContain('158,00 €');
    expect(text()).toContain('Durée retenue : 3 heures');
    expect(text()).not.toContain('Se termine le lendemain');
  });

  test('repas coché : CA de la mission incluant le repas', async () => {
    await renderCalc();
    fillHourly('10112026', '09:00', '10:00');
    act(() => mealBox().click());
    expect(text()).toContain('CA estimé de la mission85,00 €');
    expect(text()).toContain('dont interprétariat 65,00 € · dont repas 20,00 €');
  });
});

describe('mission à cheval sur minuit', () => {
  test('22:00 -> 01:00 le 10/11/2026 : mention « se termine le lendemain, 11/11/2026 à 01h00 »', async () => {
    await renderCalc();
    fillHourly('10112026', '22:00', '01:00');
    expect(text()).toContain('Se termine le lendemain, 11/11/2026 à 01h00');
    expect(text()).toContain('Durée retenue : 3 heures');
  });

  test('31/12/2026 23:00 -> 01:00 : lendemain 01/01/2027', async () => {
    await renderCalc();
    fillHourly('31122026', '23:00', '01:00');
    expect(text()).toContain('Se termine le lendemain, 01/01/2027 à 01h00');
  });
});

describe('durée nulle', () => {
  test('début = fin : message d\'erreur, aucun résultat, enregistrement impossible', async () => {
    await renderCalc({ loggedIn: true });
    fillHourly('10112026', '10:00', '10:00');
    const alert = [...container.querySelectorAll('[role="alert"]')].map((n) => n.textContent);
    expect(alert).toContain("L'heure de fin doit être différente de l'heure de début.");
    expect($('[aria-label="Résultat du calcul"]')).toBeNull();
    expect(text()).not.toContain('Durée retenue');
    expect(saveBtn().disabled).toBe(true);
    act(() => saveBtn().click());
    await flush();
    expect(api.createMission).not.toHaveBeenCalled();
  });

  test('message absent tant que l\'heure de fin n\'est pas saisie', async () => {
    await renderCalc();
    type($('#mission-date'), '10112026');
    type(byLabel('Heure de début — heures'), '10');
    expect(text()).not.toContain("L'heure de fin doit être différente");
  });
});

describe('mode traduction écrite (à la page)', () => {
  test('bascule : masque heures et repas, affiche le nombre de pages', async () => {
    await renderCalc();
    switchToPages();
    expect(buttonByText('Traduction écrite (à la page)').getAttribute('aria-checked')).toBe('true');
    expect(byLabel('Heure de début')).toBeNull();
    expect(byLabel('Heure de fin')).toBeNull();
    expect(mealBox()).toBeNull();
    expect(text()).not.toContain('frais de repas (');
    expect($('#mission-pages')).not.toBeNull();
    expect($('#mission-pages').className).toMatch(/text-base sm:text-sm/);
    expect(text()).toContain('Date de remise');
  });

  test('3 pages -> 115,50 €, détail « 3 pages × 38,50 € », sans date', async () => {
    await renderCalc();
    switchToPages();
    type($('#mission-pages'), '3');
    expect(text()).toContain('115,50 €');
    expect(text()).toContain('3 pages × 38,50 €');
    expect(text()).not.toContain('Durée retenue');
  });

  test('saisie filtrée aux chiffres ; 0 et > 1000 invalides', async () => {
    await renderCalc({ loggedIn: true });
    switchToPages();
    type($('#mission-date'), '12112026');
    const pages = () => $('#mission-pages');
    type(pages(), '1a2');
    expect(pages().value).toBe('12');
    expect(saveBtn().disabled).toBe(false);
    type(pages(), '0');
    expect(pages().getAttribute('aria-invalid')).toBe('true');
    expect(saveBtn().disabled).toBe(true);
    type(pages(), '1001');
    expect(pages().getAttribute('aria-invalid')).toBe('true');
    expect(saveBtn().disabled).toBe(true);
    type(pages(), '1000');
    expect(pages().getAttribute('aria-invalid')).toBe('false');
    expect(text()).toContain('38 500,00 €');
  });

  test('retour au mode horaire : heures et repas réapparaissent', async () => {
    await renderCalc();
    switchToPages();
    act(() => buttonByText("Interprète (à l'heure)").click());
    expect(byLabel('Heure de début')).not.toBeNull();
    expect(mealBox()).not.toBeNull();
    expect($('#mission-pages')).toBeNull();
  });
});

describe('calendrier (DatePickerButton) dans la calculatrice', () => {
  test('choix au calendrier -> champ date en jj/mm/aaaa', async () => {
    await renderCalc();
    type($('input[type="date"]'), '2026-11-13');
    expect($('#mission-date').value).toBe('13/11/2026');
  });
});

describe('enregistrement', () => {
  test('horaire + repas : createMission reçoit type, horaires, repas 20 et le résultat calculé', async () => {
    await renderCalc({ loggedIn: true });
    fillHourly('13112026', '21:00', '01:00');
    act(() => mealBox().click());
    await act(async () => saveBtn().click());
    expect(api.createMission).toHaveBeenCalledTimes(1);
    const [input, result] = api.createMission.mock.calls[0];
    expect(input).toMatchObject({ type: 'hourly', date: '2026-11-13', startTime: '21:00', endTime: '01:00', mealAmount: 20 });
    expect(result.total).toBe(250.8);
    expect(result.hoursCount).toBe(4);
    expect(text()).toContain('Mission enregistrée.');
    expect(mealBox().checked).toBe(false); // réinitialisé
  });

  test('pages : type pages, repas 0 même si coché auparavant en mode horaire', async () => {
    await renderCalc({ loggedIn: true });
    act(() => mealBox().click());
    switchToPages();
    type($('#mission-date'), '12112026');
    type($('#mission-pages'), '3');
    await act(async () => saveBtn().click());
    const [input, result] = api.createMission.mock.calls[0];
    expect(input).toMatchObject({ type: 'pages', date: '2026-11-12', mealAmount: 0 });
    expect(result).toMatchObject({ pagesCount: 3, total: 115.5 });
    expect($('#mission-pages').value).toBe(''); // champ vidé après enregistrement
  });

  test('pages sans date : enregistrement désactivé avec indication', async () => {
    await renderCalc({ loggedIn: true });
    switchToPages();
    type($('#mission-pages'), '3');
    expect(saveBtn().disabled).toBe(true);
    expect(text()).toContain('Renseigne la date et le nombre de pages.');
  });

  test('échec réseau : message d\'erreur traduit en français', async () => {
    api.createMission.mockRejectedValue(new Error('Failed to fetch'));
    await renderCalc({ loggedIn: true });
    fillHourly('10112026', '09:00', '10:00');
    await act(async () => saveBtn().click());
    expect(text()).toContain('Enregistrement impossible : Connexion au serveur impossible. Vérifie ta connexion internet.');
  });

  test('après enregistrement, l\'historique est rechargé sur le mois de la mission', async () => {
    await renderCalc({ loggedIn: true });
    fillHourly('10122026', '09:00', '10:00');
    await act(async () => saveBtn().click());
    await flush();
    const months = api.listMissionsForMonth.mock.calls.map((c) => c[0]);
    expect(months[months.length - 1]).toBe('2026-12');
  });
});

describe('modification d\'une mission', () => {
  // Montants enregistrés avec un ancien barème fictif : ne doivent pas bouger si seuls client / notes changent
  const SAVED = {
    id: 'm1', mission_date: '2026-11-13', mission_type: 'hourly', start_time: '21:00:00', end_time: '01:00:00',
    hours_count: 4, pages_count: null, amount: '200.00', meal_amount: '15.00', client: 'Tribunal X', notes: null,
    breakdown: [{ label: '1ère heure', clockLabel: 'ven. 21:00', regimeLabel: 'ancien', rate: 200 }],
  };
  let confirmSpy;
  beforeEach(() => {
    api.listMissionsForMonth.mockResolvedValue([SAVED]);
    confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
  });
  afterEach(() => confirmSpy.mockRestore());

  const notice = () => $('[data-testid="edit-notice"]');
  const editBtn = () => buttonByText('Enregistrer les modifications');
  async function startEdit() {
    await renderCalc({ loggedIn: true });
    act(() => byLabel('Modifier la mission du 13/11/2026').click());
  }

  test('Modifier : formulaire prérempli, aucune modification -> enregistrement désactivé', async () => {
    await startEdit();
    expect(text()).toContain('Modification de la mission du 13/11/2026');
    expect($('#mission-date').value).toBe('13/11/2026');
    expect($('#mission-client').value).toBe('Tribunal X');
    expect(mealBox().checked).toBe(true);
    expect(notice().textContent).toContain('Aucune modification');
    expect(editBtn().disabled).toBe(true);
    expect(saveBtn()).toBeUndefined();
  });

  test('client seul : CA enregistré conservé (annoncé), updateMission sans confirmation', async () => {
    await startEdit();
    type($('#mission-client'), 'Commissariat Y');
    expect(notice().textContent.replace(/[  ]/g, ' ')).toContain('le CA enregistré (215,00 €) et son détail sont conservés');
    await act(async () => editBtn().click());
    expect(confirmSpy).not.toHaveBeenCalled();
    expect(api.updateMission).toHaveBeenCalledTimes(1);
    const [orig, input] = api.updateMission.mock.calls[0];
    expect(orig).toBe(SAVED);
    expect(input).toMatchObject({ client: 'Commissariat Y', date: '2026-11-13', startTime: '21:00', endTime: '01:00', mealAmount: 20 });
    expect(text()).toContain('Mission modifiée, CA enregistré conservé.');
    expect(saveBtn()).not.toBeUndefined(); // retour au mode ajout
  });

  test('horaires modifiés : recalcul annoncé avant enregistrement + confirmation', async () => {
    await startEdit();
    type(byLabel('Heure de début — heures'), '22');
    const n = notice().textContent.replace(/[  ]/g, ' ');
    expect(n).toContain('nouvelle saisie');
    expect(n).toContain('barème actuel');
    expect(n).toContain('215,00 € (enregistré) → ');
    confirmSpy.mockReturnValue(false);
    await act(async () => editBtn().click());
    expect(confirmSpy).toHaveBeenCalledTimes(1);
    expect(api.updateMission).not.toHaveBeenCalled();
    confirmSpy.mockReturnValue(true);
    await act(async () => editBtn().click());
    const [, input, result] = api.updateMission.mock.calls[0];
    expect(input).toMatchObject({ startTime: '22:00', endTime: '01:00' });
    expect(result.hoursCount).toBe(3);
    expect(text()).toContain('Mission modifiée, CA recalculé.');
  });

  test('Annuler la modification : formulaire vidé, retour au mode ajout', async () => {
    await startEdit();
    act(() => buttonByText('Annuler la modification').click());
    expect($('#mission-client').value).toBe('');
    expect(notice()).toBeNull();
    expect(saveBtn()).not.toBeUndefined();
  });

  test('échec : message en français, mode modification conservé', async () => {
    api.updateMission.mockRejectedValue(new Error('Failed to fetch'));
    await startEdit();
    type($('#mission-notes'), 'PV 1');
    await act(async () => editBtn().click());
    expect(text()).toContain('Enregistrement impossible : Connexion au serveur impossible');
    expect(editBtn()).not.toBeUndefined();
  });
});

describe('suggestions de clients et vue annuelle', () => {
  test('clients déjà saisis proposés dans le champ client', async () => {
    api.listRecentClients.mockResolvedValue([
      { client: 'Commissariat Paris 18e', mission_date: '2026-11-01' },
      { client: 'Tribunal X', mission_date: '2026-10-01' },
      { client: 'Tribunal X', mission_date: '2026-09-01' },
    ]);
    await renderCalc({ loggedIn: true });
    expect(api.listRecentClients).toHaveBeenCalledWith('u-test');
    act(() => $('#mission-client').dispatchEvent(new FocusEvent('focusin', { bubbles: true })));
    const opts = [...container.querySelectorAll('[role="option"]')].map((o) => o.textContent);
    expect(opts).toEqual(['Tribunal X', 'Commissariat Paris 18e']);
  });

  test('vue annuelle affichée une fois connecté', async () => {
    await renderCalc({ loggedIn: true });
    await flush();
    expect($('[data-testid="yearly-ca"]').textContent).toBe('CA annuel u-test');
  });

  test('non connecté : pas de suggestions ni de vue annuelle', async () => {
    await renderCalc();
    expect(api.listRecentClients).not.toHaveBeenCalled();
    expect($('[data-testid="yearly-ca"]')).toBeNull();
  });
});
