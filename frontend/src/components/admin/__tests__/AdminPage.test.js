// Page admin : contrôle d'accès, récapitulatif par utilisateur (heures + pages), filtre, invitation.
// Supabase et missionsApi simulés : aucun appel réseau. Adresses fictives (example.test).
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
  fetchIsAdmin: jest.fn(),
  adminListMissionsForMonth: jest.fn(),
  inviteUser: jest.fn(),
}));
jest.mock('react-router-dom', () => {
  const R = require('react');
  return { Link: ({ to, children, ...p }) => R.createElement('a', { href: to, ...p }, children) };
});

const React = require('react');
const { act } = require('react');
const { createRoot } = require('react-dom/client');
const api = require('@/lib/missionsApi');
const { AdminPage } = require('@/components/admin/AdminPage');

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const A = 'alice@example.test';
const B = 'bob@example.test';
const MISSIONS = [
  { id: 'm1', user_id: 'ua', user_email: A, mission_date: '2026-11-10', mission_type: 'hourly', start_time: '09:00:00', end_time: '11:30:00',
    hours_count: 3, pages_count: null, amount: '158.00', meal_amount: '20.00', client: 'TJ', notes: null, breakdown: [] },
  { id: 'm2', user_id: 'ua', user_email: A, mission_date: '2026-11-12', mission_type: 'pages', start_time: null, end_time: null,
    hours_count: null, pages_count: 12, amount: '462.00', meal_amount: '0.00', client: null, notes: null, breakdown: [] },
  { id: 'm3', user_id: 'ub', user_email: B, mission_date: '2026-11-14', mission_type: 'hourly', start_time: '10:00:00', end_time: '12:00:00',
    hours_count: 2, pages_count: null, amount: '134.80', meal_amount: '0.00', client: null, notes: null, breakdown: [] },
];

let container;
let root;
beforeEach(() => {
  mockAuth.session = { user: { id: 'ua', email: A } };
  api.fetchIsAdmin.mockResolvedValue(true);
  api.adminListMissionsForMonth.mockResolvedValue(MISSIONS);
  api.inviteUser.mockResolvedValue({ email: 'nouveau@example.test' });
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

const flush = async () => {
  await act(async () => {});
  await act(async () => {});
};
const text = (el = container) => el.textContent.replace(/[  ]/g, ' ');
async function renderAdmin() {
  act(() => root.render(<AdminPage />));
  await flush();
}
function setValue(el, value, proto = window.HTMLInputElement.prototype, evt = 'input') {
  const setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
  act(() => {
    setter.call(el, value);
    el.dispatchEvent(new Event(evt, { bubbles: true }));
  });
}
const tables = () => container.querySelectorAll('table');

describe('contrôle d\'accès', () => {
  test('non connecté : formulaire de connexion, aucune donnée chargée', async () => {
    mockAuth.session = null;
    await renderAdmin();
    expect(container.querySelector('input[type="password"]')).not.toBeNull();
    expect(api.adminListMissionsForMonth).not.toHaveBeenCalled();
  });
  test('connecté non admin : accès refusé, aucune donnée chargée', async () => {
    api.fetchIsAdmin.mockResolvedValue(false);
    await renderAdmin();
    expect(text()).toContain("Accès refusé : ce compte n'a pas les droits administrateur.");
    expect(api.adminListMissionsForMonth).not.toHaveBeenCalled();
  });
  test('titre d\'onglet « Administration »', async () => {
    await renderAdmin();
    expect(document.title).toMatch(/^Administration \| /);
  });
});

describe('tableau de bord admin', () => {
  test('indicateurs : heures et pages séparées, CA du mois = prestations + repas', async () => {
    await renderAdmin();
    const t = text();
    expect(t).toContain('Utilisateurs actifs2');
    expect(t).toContain('Missions3');
    expect(t).toContain('Heures facturées5 h+ 12 pages');
    expect(t).toContain('Frais de repas20,00 €');
    expect(t).toContain('CA du mois774,80 €'); // 754,80 prestations + 20 repas
    expect(t).toContain('dont prestations 754,80 € · dont repas 20,00 €');
    expect(t).toContain('Interprétariat : 5 hCA 312,80 € (dont repas 20,00 €)');
    expect(t).toContain('Traduction écrite : 12 pagesCA 462,00 €');
    expect(t).not.toMatch(/NaN|undefined|vacation/i);
  });

  test('récapitulatif par utilisateur : CA oral / CA écrit (repas inclus), « — » si aucune', async () => {
    await renderAdmin();
    const recap = tables()[0];
    expect([...recap.querySelectorAll('th')].map((th) => th.textContent)).toEqual(['Utilisateur', 'Missions', 'Heures', 'CA oral', 'Pages', 'CA écrit', 'dont repas', 'CA']);
    const rows = [...recap.querySelectorAll('tbody tr')].map((r) => [...r.querySelectorAll('td')].map((td) => text(td)));
    expect(rows[0]).toEqual([A, '2', '3 h', '178,00 €', '12', '462,00 €', '20,00 €', '640,00 €']);
    expect(rows[1]).toEqual([B, '1', '2 h', '134,80 €', '—', '—', '0,00 €', '134,80 €']);
    const foot = [...recap.querySelectorAll('tfoot td')].map((td) => text(td));
    expect(foot).toEqual(['CA du mois', '3', '5 h', '312,80 €', '12', '462,00 €', '20,00 €', '774,80 €']);
  });

  test('détail : badges, quantité, filtre par utilisateur (select)', async () => {
    await renderAdmin();
    const detail = tables()[1];
    const rows = () => [...tables()[1].querySelectorAll('tbody tr')].map((r) => text(r));
    expect(rows()).toHaveLength(3);
    expect(rows()[1]).toContain('Écrit');
    expect(rows()[1]).toContain('12 pages');
    expect(rows()[0]).toContain('Oral');
    expect(rows()[0]).toContain('09:00 → 11:30');
    expect(text(detail.querySelector('tfoot'))).toContain('5 h · 12 p.');

    const select = container.querySelector('[aria-label="Filtrer par utilisateur"]');
    setValue(select, 'ub', window.HTMLSelectElement.prototype, 'change');
    expect(rows()).toHaveLength(1);
    expect(rows()[0]).toContain(B);
    expect(text(tables()[1].querySelector('tfoot'))).toContain(`CA du mois — ${B}`);
    expect(text(tables()[1].querySelector('tfoot'))).not.toContain(' p.');
  });

  test('clic sur une ligne du récapitulatif : filtre puis défiltre', async () => {
    await renderAdmin();
    const recapRow = () => tables()[0].querySelectorAll('tbody tr')[0];
    act(() => recapRow().click());
    expect(tables()[1].querySelectorAll('tbody tr')).toHaveLength(2);
    act(() => recapRow().click());
    expect(tables()[1].querySelectorAll('tbody tr')).toHaveLength(3);
  });

  test('erreur de chargement (non admin côté serveur) : message affiché', async () => {
    api.adminListMissionsForMonth.mockRejectedValue(new Error('Accès réservé aux administrateurs'));
    await renderAdmin();
    expect(container.querySelector('[role="alert"]').textContent).toBe('Chargement impossible : Accès réservé aux administrateurs');
  });

  test('mois vide : export désactivé', async () => {
    api.adminListMissionsForMonth.mockResolvedValue([]);
    await renderAdmin();
    const exportBtn = [...container.querySelectorAll('button')].find((b) => b.textContent.includes('Export CSV'));
    expect(exportBtn.disabled).toBe(true);
    expect(text()).toContain('Aucune mission ce mois-ci.');
  });
});

describe('invitation', () => {
  const form = () => container.querySelector('form');
  const email = () => container.querySelector('#invite-email');

  test('champ email anti-zoom iOS', async () => {
    await renderAdmin();
    expect(email().className).toMatch(/text-base sm:text-sm/);
  });
  test('succès : message et champ vidé', async () => {
    await renderAdmin();
    setValue(email(), 'nouveau@example.test');
    await act(async () => form().dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
    expect(api.inviteUser).toHaveBeenCalledWith('nouveau@example.test');
    expect(text()).toContain('Invitation envoyée à nouveau@example.test.');
    expect(email().value).toBe('');
  });
  test('échec : message traduit', async () => {
    api.inviteUser.mockRejectedValue(new Error('Too many requests'));
    await renderAdmin();
    setValue(email(), 'nouveau@example.test');
    await act(async () => form().dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
    expect(text()).toContain('Invitation impossible : Trop de tentatives.');
  });
});

describe('robustesse', () => {
  // Une ligne admin_list_missions peut avoir user_email null (compte auth sans email, ex. téléphone)
  test('user_email null ne fait pas planter la page', async () => {
    api.adminListMissionsForMonth.mockResolvedValue([...MISSIONS, { ...MISSIONS[2], id: 'm4', user_id: 'uc', user_email: null }]);
    const errors = jest.spyOn(console, 'error').mockImplementation(() => {});
    let thrown = null;
    try {
      await renderAdmin();
    } catch (e) {
      thrown = e;
    }
    errors.mockRestore();
    expect(thrown).toBeNull();
    expect(text()).toContain('Récapitulatif par utilisateur');
  });
});
