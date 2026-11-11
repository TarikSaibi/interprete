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
