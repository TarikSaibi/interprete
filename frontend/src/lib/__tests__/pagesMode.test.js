// Mode « traduction écrite » (facturation à la page) + garde-fous ajoutés au calcul horaire
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

const {
  computePagesCA, computeMissionCA, PAGE_TRANSLATION_RATE, PAGE_WORDS, MAX_PAGES,
} = require('../caCalculator');
const api = require('../missionsApi');
const { eur, missionTotal, missionQty, isPages } = require('../format');

const norm = (s) => s.replace(/[  ]/g, ' ');

beforeEach(() => {
  mockCalls.length = 0;
  mockResult.current = { data: { id: 1 }, error: null };
});

describe('computePagesCA', () => {
  test('tarif officiel : 38,50 € par page de 250 mots', () => {
    expect(PAGE_TRANSLATION_RATE).toBe(38.5);
    expect(PAGE_WORDS).toBe(250);
  });

  test.each([
    [1, 38.5],
    [3, 115.5],
    [12, 462],
    [MAX_PAGES, MAX_PAGES * 38.5],
  ])('%i page(s) -> %p €', (pages, total) => {
    const r = computePagesCA({ pages });
    expect(r.total).toBe(total);
    expect(r.pagesCount).toBe(pages);
    expect(r.breakdown).toHaveLength(1);
    expect(r.breakdown[0].rate).toBe(total);
  });

  test('accepte une chaîne numérique (champ texte)', () => {
    expect(computePagesCA({ pages: '4' }).total).toBe(154);
  });

  test.each([0, -1, 1.5, '', 'abc', null, undefined, MAX_PAGES + 1])('invalide : %p -> null', (pages) => {
    expect(computePagesCA({ pages })).toBeNull();
  });

  test('libellés en français, sans « vacation »', () => {
    const b = computePagesCA({ pages: 2 }).breakdown[0];
    expect(norm(b.clockLabel)).toBe('2 pages × 38,50 €');
    expect(b.regimeLabel).toMatch(/250 mots/);
    expect(JSON.stringify(b)).not.toMatch(/vacation/i);
  });
});

describe('computeMissionCA : durée nulle et lendemain', () => {
  test('début = fin -> null (non enregistrable)', () => {
    expect(computeMissionCA({ date: '2026-11-10', startTime: '10:00', endTime: '10:00' })).toBeNull();
  });
  test('fin < début -> se termine le lendemain', () => {
    const r = computeMissionCA({ date: '2026-11-10', startTime: '22:00', endTime: '01:00' });
    expect(r.endsNextDay).toBe(true);
    expect(r.hoursCount).toBe(3);
  });
  test('même jour -> endsNextDay false', () => {
    expect(computeMissionCA({ date: '2026-11-10', startTime: '09:00', endTime: '11:30' }).endsNextDay).toBe(false);
  });
});

describe('createMission type pages', () => {
  test('insère mission_type / pages_count, sans horaires ni repas', async () => {
    const result = computePagesCA({ pages: 3 });
    await api.createMission(
      { type: 'pages', date: '2026-11-12', startTime: '10:00', endTime: '11:00', client: ' TJ Paris ', notes: '', mealAmount: 20 },
      result
    );
    const insert = mockCalls.find((c) => c[0] === 'insert')[1];
    expect(insert).toEqual({
      mission_date: '2026-11-12',
      mission_type: 'pages',
      pages_count: 3,
      start_time: null,
      end_time: null,
      hours_count: null,
      meal_amount: 0,
      amount: 115.5,
      client: 'TJ Paris',
      notes: null,
      breakdown: [{ label: 'Traduction écrite', clockLabel: result.breakdown[0].clockLabel, regimeLabel: result.breakdown[0].regimeLabel, rate: 115.5 }],
    });
  });

  test('type horaire par défaut : pas de colonne pages_count envoyée', async () => {
    const input = { date: '2026-11-10', startTime: '09:00', endTime: '10:00' };
    await api.createMission(input, computeMissionCA(input));
    const insert = mockCalls.find((c) => c[0] === 'insert')[1];
    expect(insert).not.toHaveProperty('pages_count');
    expect(insert.hours_count).toBe(1);
  });
});

describe('format : missions à la page et valeurs manquantes', () => {
  test('missionQty / isPages', () => {
    expect(missionQty({ mission_type: 'pages', pages_count: 1 })).toBe('1 page');
    expect(missionQty({ mission_type: 'pages', pages_count: 12 })).toBe('12 pages');
    expect(missionQty({ hours_count: 3 })).toBe('3 h');
    expect(isPages({})).toBe(false);
  });
  test('eur() sur valeur absente ou invalide -> « — »', () => {
    expect(eur(undefined)).toBe('—');
    expect(eur(null)).toBe('—');
    expect(eur('abc')).toBe('—');
    expect(norm(eur('115.5'))).toBe('115,50 €');
  });
  test('missionTotal sans montant -> 0 (jamais NaN)', () => {
    expect(missionTotal({})).toBe(0);
    expect(missionTotal({ amount: '115.50', meal_amount: null })).toBe(115.5);
  });
});
