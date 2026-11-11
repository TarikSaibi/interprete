// Compléments : mode à la page (cas limites), endsNextDay, formats sans NaN, frError, useDocumentTitle.
// Client Supabase simulé : aucun appel réseau.
process.env.TZ = 'Europe/Paris';

const mockCalls = [];
const mockResult = { current: { data: null, error: null } };

jest.mock('@/lib/supabase', () => {
  const builder = {};
  ['from', 'select', 'insert', 'delete', 'eq', 'gte', 'lt', 'order', 'single'].forEach((m) => {
    builder[m] = (...args) => {
      mockCalls.push([m, ...args]);
      return builder;
    };
  });
  builder.then = (resolve, reject) => Promise.resolve(mockResult.current).then(resolve, reject);
  return { supabase: builder };
});

const React = require('react');
const { act } = require('react');
const { createRoot } = require('react-dom/client');
const { computePagesCA, computeMissionCA, PAGE_TRANSLATION_RATE, MAX_PAGES } = require('@/lib/caCalculator');
const api = require('@/lib/missionsApi');
const { eur, missionTotal, missionQty, plural, isPages, meal } = require('@/lib/format');
const { frError } = require('@/lib/errors');
const { useDocumentTitle } = require('@/hooks/useDocumentTitle');

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const norm = (s) => s.replace(/[  ]/g, ' ');

beforeEach(() => {
  mockCalls.length = 0;
  mockResult.current = { data: { id: 1 }, error: null };
});

describe('alias @/ résolu par Jest', () => {
  test('les modules @/lib/* sont les vrais modules', () => {
    expect(require('@/lib/format')).toBe(require('../format'));
    expect(require('@/lib/caCalculator')).toBe(require('../caCalculator'));
  });
});

describe('computePagesCA : cas limites', () => {
  test('1 page : libellé au singulier, 38,50 €', () => {
    const r = computePagesCA({ pages: 1 });
    expect(r.total).toBe(38.5);
    expect(norm(r.breakdown[0].clockLabel)).toBe('1 page × 38,50 €');
    expect(norm(eur(r.total))).toBe('38,50 €');
  });

  test('MAX_PAGES = 1000 (aligné sur la contrainte SQL) -> 38 500,00 €', () => {
    expect(MAX_PAGES).toBe(1000);
    const r = computePagesCA({ pages: MAX_PAGES });
    expect(r.total).toBe(38500);
    expect(norm(eur(r.total))).toBe('38 500,00 €');
  });

  test('total exact au centime pour toutes les valeurs 1..MAX_PAGES (pas d\'erreur flottante)', () => {
    for (let n = 1; n <= MAX_PAGES; n += 1) {
      const t = computePagesCA({ pages: n }).total;
      expect(Math.round(t * 100)).toBe(n * 3850);
    }
  });

  test.each([
    [0], [-1], [-38], [0.5], [2.5], ['2.5'], ['2,5'], [NaN], [Infinity], ['abc'], ['3 pages'], [{}], [[]],
  ])('refus de %p -> null', (pages) => {
    expect(computePagesCA({ pages })).toBeNull();
  });

  test('chaîne avec zéros de tête (champ texte) acceptée', () => {
    expect(computePagesCA({ pages: '007' }).pagesCount).toBe(7);
  });

  test('montant cohérent avec le plafond SQL amount <= 100 × pages', () => {
    expect(PAGE_TRANSLATION_RATE).toBeLessThanOrEqual(100);
  });
});

describe('computeMissionCA : endsNextDay', () => {
  const ca = (date, startTime, endTime) => computeMissionCA({ date, startTime, endTime });

  test('fin pile à minuit (23:00 -> 00:00) : lendemain, 1 h', () => {
    const r = ca('2026-11-10', '23:00', '00:00');
    expect(r.endsNextDay).toBe(true);
    expect(r.hoursCount).toBe(1);
    expect(r.end.getDate()).toBe(11);
  });
  test('départ à minuit (00:00 -> 01:00) : même jour', () => {
    expect(ca('2026-11-10', '00:00', '01:00').endsNextDay).toBe(false);
  });
  test('00:01 -> 00:00 : 23 h 59 sur deux jours, 24 tranches (max autorisé en base)', () => {
    const r = ca('2026-11-10', '00:01', '00:00');
    expect(r.endsNextDay).toBe(true);
    expect(r.hoursCount).toBe(24);
  });
  test('fin de mois (31/01 -> 01/02)', () => {
    const r = ca('2026-01-31', '22:00', '01:00');
    expect(r.endsNextDay).toBe(true);
    expect(r.end.getMonth()).toBe(1);
    expect(r.end.getDate()).toBe(1);
  });
  test('Saint-Sylvestre (31/12 -> 01/01, férié) : changement d\'année', () => {
    const r = ca('2026-12-31', '23:00', '01:00');
    expect(r.endsNextDay).toBe(true);
    expect(r.end.getFullYear()).toBe(2027);
    expect(r.breakdown.map((b) => b.rate)).toEqual([76.8, 69.8]); // jeudi nuit puis 1er janvier nuit
  });
  test('veille du passage à l\'heure d\'été (28/03 23:00 -> 29/03 03:00) : 3 h réelles', () => {
    const r = ca('2026-03-28', '23:00', '03:00');
    expect(r.endsNextDay).toBe(true);
    expect(r.durationMinutes).toBe(180);
  });
});

describe('format : jamais NaN ni « undefined »', () => {
  test.each([[undefined], [null], [''], [NaN], [Infinity], [-Infinity], ['abc'], [{}]])('eur(%p) -> « — »', (v) => {
    expect(eur(v)).toBe('—');
  });
  test('eur(0) et eur("0") restent des montants', () => {
    expect(norm(eur(0))).toBe('0,00 €');
    expect(norm(eur('0'))).toBe('0,00 €');
  });
  test('eur() : espace insécable (U+00A0) avant €', () => {
    expect(eur(38.5).endsWith(' €')).toBe(true);
  });

  test.each([
    [{}, 0],
    [{ amount: null, meal_amount: null }, 0],
    [{ amount: 'abc', meal_amount: '20.00' }, 20],
    [{ amount: '250.80', meal_amount: 'x' }, 250.8],
    [{ amount: 115.5, meal_amount: 0 }, 115.5],
    [{ amount: '250.80', meal_amount: '20.00' }, 270.8],
  ])('missionTotal(%p) = %p', (m, expected) => {
    const t = missionTotal(m);
    expect(Number.isNaN(t)).toBe(false);
    expect(t).toBeCloseTo(expected, 10);
  });
  test('meal() sans repas -> 0', () => {
    expect(meal({})).toBe(0);
  });

  test.each([
    [0, 'page', '0 page'],
    [1, 'page', '1 page'],
    [2, 'page', '2 pages'],
    [1, 'heure', '1 heure'],
    [24, 'heure', '24 heures'],
  ])('plural(%p, %p) -> %p', (n, w, expected) => {
    expect(plural(n, w)).toBe(expected);
  });

  test.each([
    [{ mission_type: 'pages', pages_count: 1 }, '1 page'],
    [{ mission_type: 'pages', pages_count: '3' }, '3 pages'],
    [{ mission_type: 'pages', pages_count: null }, '0 page'],
    [{ mission_type: 'hourly', hours_count: 4 }, '4 h'],
    [{ hours_count: 2 }, '2 h'], // anciennes lignes sans type
    [{ mission_type: 'hourly', hours_count: null }, '0 h'],
  ])('missionQty(%p) -> %p', (m, expected) => {
    expect(missionQty(m)).toBe(expected);
    expect(missionQty(m)).not.toMatch(/NaN|undefined/);
  });

  test('isPages', () => {
    expect(isPages({ mission_type: 'pages' })).toBe(true);
    expect(isPages({ mission_type: 'hourly' })).toBe(false);
    expect(isPages({})).toBe(false);
  });
});

describe('frError', () => {
  test.each([
    ['Failed to fetch', 'Connexion au serveur impossible. Vérifie ta connexion internet.'],
    ['NetworkError when attempting to fetch resource.', 'Connexion au serveur impossible. Vérifie ta connexion internet.'],
    ['Load failed', 'Connexion au serveur impossible. Vérifie ta connexion internet.'],
    ['Invalid login credentials', 'Identifiants invalides.'],
    ['Email not confirmed', 'Adresse email non confirmée.'],
    ['Request rate limit reached', 'Trop de tentatives. Patiente quelques instants avant de réessayer.'],
    ['For security purposes, you can only request this after 42 seconds.', 'Trop de tentatives. Patiente quelques instants avant de réessayer.'],
    ['New password should be different from the old password.', "Le nouveau mot de passe doit être différent de l'ancien."],
    ['Password should be at least 8 characters.', 'Mot de passe trop court.'],
    ['Password is known to be weak and easy to guess', 'Mot de passe trop faible : choisis-en un plus robuste.'],
    ['JWT expired', 'Session expirée : reconnecte-toi.'],
    ['Auth session missing!', 'Session expirée : reconnecte-toi.'],
    ['new row violates row-level security policy for table "missions"', 'Action non autorisée pour ce compte.'],
    ['permission denied for table missions', 'Action non autorisée pour ce compte.'],
  ])('%p -> %p', (msg, expected) => {
    expect(frError(new Error(msg))).toBe(expected);
    expect(frError(msg)).toBe(expected);
    expect(frError({ message: msg })).toBe(expected);
  });

  test('message inconnu renvoyé tel quel', () => {
    expect(frError(new Error('Accès réservé aux administrateurs'))).toBe('Accès réservé aux administrateurs');
  });
  test.each([[undefined], [null], [''], [{}], [new Error('')]])('%p -> message générique', (e) => {
    expect(frError(e)).toBe('Une erreur inattendue est survenue.');
  });
});

describe('createMission (compléments)', () => {
  const lastInsert = () => mockCalls.find((c) => c[0] === 'insert')[1];

  test('pages : repas forcé à 0, horaires et heures null, détail figé sans index', async () => {
    await api.createMission({ type: 'pages', date: '2026-11-12', mealAmount: 20, client: '   ' }, computePagesCA({ pages: 1 }));
    const row = lastInsert();
    expect(row).toMatchObject({
      mission_type: 'pages', pages_count: 1, amount: 38.5, meal_amount: 0,
      start_time: null, end_time: null, hours_count: null, client: null, notes: null,
    });
    expect(row.breakdown[0]).not.toHaveProperty('index');
    expect(Object.keys(row.breakdown[0]).sort()).toEqual(['clockLabel', 'label', 'rate', 'regimeLabel']);
  });

  test('horaire : repas transmis, pas de mission_type (défaut SQL hourly)', async () => {
    const input = { date: '2026-11-10', startTime: '22:00', endTime: '01:00', mealAmount: 20 };
    await api.createMission(input, computeMissionCA(input));
    const row = lastInsert();
    expect(row.meal_amount).toBe(20);
    expect(row.hours_count).toBe(3);
    expect(row.start_time).toBe('22:00');
    expect(row.end_time).toBe('01:00');
    expect(row).not.toHaveProperty('mission_type');
  });

  test('erreur Supabase propagée', async () => {
    mockResult.current = { data: null, error: new Error('permission denied') };
    await expect(api.createMission({ type: 'pages', date: '2026-11-12' }, computePagesCA({ pages: 2 }))).rejects.toThrow('permission denied');
  });
});

describe('useDocumentTitle', () => {
  test('définit le titre puis restaure le précédent au démontage', () => {
    document.title = 'Avant';
    const Page = ({ t }) => {
      useDocumentTitle(t);
      return null;
    };
    const container = document.createElement('div');
    const root = createRoot(container);
    act(() => root.render(React.createElement(Page, { t: 'Calculateur de CA' })));
    expect(document.title).toBe('Calculateur de CA | Kenza ALIM — Interprète judiciaire');
    act(() => root.render(React.createElement(Page, { t: 'Administration' })));
    expect(document.title).toBe('Administration | Kenza ALIM — Interprète judiciaire');
    act(() => root.unmount());
    expect(document.title).toBe('Avant');
  });
});

describe('totaux par type (typeTotals), tri, lignes de total CSV', () => {
  const { typeTotals, sortByDate, csvTotalRows, csvNum } = require('@/lib/format');
  const H = { mission_type: 'hourly', mission_date: '2026-11-10', start_time: '09:00:00', hours_count: 3, amount: '158.00', meal_amount: '20.00' };
  const H2 = { mission_date: '2026-11-10', start_time: '22:00:00', hours_count: 2, amount: '134.80', meal_amount: null }; // ancienne ligne
  const P = { mission_type: 'pages', mission_date: '2026-11-10', start_time: null, pages_count: 12, amount: '462.00', meal_amount: '0.00' };

  test('typeTotals : montants enregistrés, séparés oral / écrit, sans NaN', () => {
    const t = typeTotals([H, P, H2, { mission_type: 'pages', amount: null, pages_count: null }]);
    expect(t.count).toBe(4);
    expect(t.oral).toEqual({ count: 2, hours: 5, amount: 292.8, meals: 20 });
    expect(t.written).toEqual({ count: 2, pages: 12, amount: 462, meals: 0 });
    expect(t.hours).toBe(5);
    expect(t.pages).toBe(12);
    expect(t.amount).toBeCloseTo(754.8, 10);
    expect(t.meals).toBe(20);
  });
  test('typeTotals([]) : tout à 0', () => {
    expect(typeTotals([])).toMatchObject({ count: 0, hours: 0, pages: 0, amount: 0, meals: 0 });
  });

  test('sortByDate : date puis heure, traductions (sans horaire) en fin de journée, sans muter l\'entrée', () => {
    const input = [P, H2, { ...H, mission_date: '2026-11-02' }, H];
    const out = sortByDate(input);
    expect(out.map((m) => [m.mission_date, m.start_time])).toEqual([
      ['2026-11-02', '09:00:00'], ['2026-11-10', '09:00:00'], ['2026-11-10', '22:00:00'], ['2026-11-10', null],
    ]);
    expect(input[0]).toBe(P);
  });

  test('csvTotalRows : sous-totaux présents seulement si le type existe, puis total général', () => {
    const rows = csvTotalRows(typeTotals([H, P]));
    expect(rows[0]).toEqual([]);
    expect(rows.map((r) => r[0])).toEqual([undefined, 'Sous-total interprétariat', 'Sous-total traduction écrite', 'CA total']);
    expect(rows[3]).toEqual(['CA total', '', '', '', 3, 12, '620,00', '20,00', '640,00', '', '']);
    const onlyOral = csvTotalRows(typeTotals([H]));
    expect(onlyOral.map((r) => r[0])).toEqual([undefined, 'Sous-total interprétariat', 'CA total']);
  });
  test('csvTotalRows avec colonnes de tête (export admin)', () => {
    const rows = csvTotalRows(typeTotals([P]), 1);
    expect(rows[rows.length - 1].slice(0, 2)).toEqual(['', 'CA total']);
    expect(rows[rows.length - 1]).toHaveLength(12);
  });
  test('csvNum : virgule décimale, valeur absente -> 0,00', () => {
    expect(csvNum('115.5')).toBe('115,50');
    expect(csvNum(null)).toBe('0,00');
    expect(csvNum('abc')).toBe('0,00');
  });
});
