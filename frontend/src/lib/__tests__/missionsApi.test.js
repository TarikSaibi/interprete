// Client Supabase entièrement simulé : aucun appel réseau.
// CRA active resetMocks : pas de jest.fn() (implémentations effacées avant chaque test), on enregistre à la main.
process.env.TZ = 'Europe/Paris';

const mockCalls = [];
const mockResult = { current: { data: null, error: null } };

function mockBuilder() {
  const b = {};
  ['from', 'select', 'insert', 'delete', 'eq', 'gte', 'lt', 'order', 'single'].forEach((m) => {
    b[m] = (...args) => {
      mockCalls.push([m, ...args]);
      return b;
    };
  });
  b.then = (resolve, reject) => Promise.resolve(mockResult.current).then(resolve, reject);
  return b;
}

const mockSupabase = {
  from: (...a) => mockBuilder().from(...a),
  rpc: async (...a) => {
    mockCalls.push(['rpc', ...a]);
    return mockResult.current;
  },
  functions: {
    invoke: async (...a) => {
      mockCalls.push(['invoke', ...a]);
      return mockResult.current;
    },
  },
};

jest.mock('@/lib/supabase', () => ({ supabase: mockSupabase }));

const api = require('../missionsApi');
const { computeMissionCA, MEAL_ALLOWANCE } = require('../caCalculator');

beforeEach(() => {
  mockCalls.length = 0;
  mockResult.current = { data: null, error: null };
});

describe('helpers de mois', () => {
  test('monthBounds', () => {
    expect(api.monthBounds('2026-11')).toEqual({ from: '2026-11-01', to: '2026-12-01' });
    expect(api.monthBounds('2026-12')).toEqual({ from: '2026-12-01', to: '2027-01-01' });
    expect(api.monthBounds('2026-09')).toEqual({ from: '2026-09-01', to: '2026-10-01' });
  });
  test('shiftMonth', () => {
    expect(api.shiftMonth('2026-01', -1)).toBe('2025-12');
    expect(api.shiftMonth('2026-12', 1)).toBe('2027-01');
    expect(api.shiftMonth('2026-11', 0)).toBe('2026-11');
    expect(api.shiftMonth('2026-03', -14)).toBe('2025-01');
  });
  test('currentMonth', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-11-30T23:30:00'));
    expect(api.currentMonth()).toBe('2026-11');
    jest.useRealTimers();
  });
});

describe('createMission : montants figés à la saisie', () => {
  const input = { date: '2026-11-13', startTime: '21:00', endTime: '01:00', client: '  Tribunal X  ', notes: '   ' };

  test('envoie amount / breakdown / hours_count / meal_amount calculés', async () => {
    const result = computeMissionCA(input);
    mockResult.current = { data: { id: 1 }, error: null };
    const data = await api.createMission({ ...input, mealAmount: MEAL_ALLOWANCE }, result);

    expect(data).toEqual({ id: 1 });
    expect(mockCalls[0]).toEqual(['from', 'missions']);
    const insert = mockCalls.find((c) => c[0] === 'insert')[1];
    expect(insert).toEqual({
      mission_date: '2026-11-13',
      start_time: '21:00',
      end_time: '01:00',
      client: 'Tribunal X',
      notes: null,
      hours_count: 4,
      amount: 250.8,
      meal_amount: 20,
      breakdown: result.breakdown.map(({ label, clockLabel, regimeLabel, rate }) => ({ label, clockLabel, regimeLabel, rate })),
    });
    expect(insert.breakdown.map((b) => b.rate)).toEqual([65, 58, 58, 69.8]);
    expect(Object.keys(insert.breakdown[0]).sort()).toEqual(['clockLabel', 'label', 'rate', 'regimeLabel']);
    expect(mockCalls.map((c) => c[0])).toEqual(['from', 'insert', 'select', 'single']);
  });

  test('meal_amount = 0 par défaut, client/notes absents -> null', async () => {
    const result = computeMissionCA(input);
    await api.createMission({ date: input.date, startTime: '21:00', endTime: '01:00' }, result);
    const insert = mockCalls.find((c) => c[0] === 'insert')[1];
    expect(insert.meal_amount).toBe(0);
    expect(insert.client).toBeNull();
    expect(insert.notes).toBeNull();
  });

  test('le montant envoyé est celui de result, sans recalcul (historique figé)', async () => {
    const frozen = { hoursCount: 1, total: 12.34, breakdown: [{ index: 1, label: 'x', clockLabel: 'y', regimeLabel: 'z', rate: 12.34 }] };
    await api.createMission({ date: '2026-11-10', startTime: '09:00', endTime: '10:00' }, frozen);
    const insert = mockCalls.find((c) => c[0] === 'insert')[1];
    expect(insert.amount).toBe(12.34);
    expect(insert.hours_count).toBe(1);
    expect(insert.breakdown).toEqual([{ label: 'x', clockLabel: 'y', regimeLabel: 'z', rate: 12.34 }]);
  });

  test('propage l\'erreur Supabase', async () => {
    mockResult.current = { data: null, error: new Error('RLS') };
    await expect(api.createMission(input, computeMissionCA(input))).rejects.toThrow('RLS');
  });
});

describe('lecture / suppression', () => {
  test('listMissionsForMonth filtre sur [1er du mois, 1er du mois suivant[ et trie', async () => {
    mockResult.current = { data: [{ id: 1 }], error: null };
    await expect(api.listMissionsForMonth('2026-12')).resolves.toEqual([{ id: 1 }]);
    expect(mockCalls).toEqual([
      ['from', 'missions'],
      ['select', '*'],
      ['gte', 'mission_date', '2026-12-01'],
      ['lt', 'mission_date', '2027-01-01'],
      ['order', 'mission_date', { ascending: true }],
      ['order', 'start_time', { ascending: true }],
    ]);
  });
  test('listMissionsForMonth propage l\'erreur', async () => {
    mockResult.current = { data: null, error: new Error('boom') };
    await expect(api.listMissionsForMonth('2026-11')).rejects.toThrow('boom');
  });
  test('deleteMission filtre par id', async () => {
    await api.deleteMission(42);
    expect(mockCalls).toEqual([['from', 'missions'], ['delete'], ['eq', 'id', 42]]);
  });
});

describe('admin', () => {
  test('fetchIsAdmin : true seulement si data === true', async () => {
    mockResult.current = { data: true, error: null };
    await expect(api.fetchIsAdmin()).resolves.toBe(true);
    mockResult.current = { data: 'true', error: null };
    await expect(api.fetchIsAdmin()).resolves.toBe(false);
    mockResult.current = { data: true, error: new Error('x') };
    await expect(api.fetchIsAdmin()).resolves.toBe(false);
    expect(mockCalls.filter((c) => c[0] === 'rpc').every((c) => c[1] === 'is_admin' && c.length === 2)).toBe(true);
  });
  test('adminListMissionsForMonth appelle la RPC avec les bornes', async () => {
    mockResult.current = { data: [], error: null };
    await api.adminListMissionsForMonth('2026-02');
    expect(mockCalls).toEqual([['rpc', 'admin_list_missions', { p_from: '2026-02-01', p_to: '2026-03-01' }]]);
  });
  test('inviteUser : succès', async () => {
    mockResult.current = { data: { ok: true }, error: null };
    await expect(api.inviteUser('personne@example.test')).resolves.toEqual({ ok: true });
    expect(mockCalls).toEqual([['invoke', 'invite-user', { body: { email: 'personne@example.test' } }]]);
  });
  test('inviteUser : message d\'erreur renvoyé par la fonction', async () => {
    const error = Object.assign(new Error('generic'), { context: { json: async () => ({ error: 'Accès refusé' }) } });
    mockResult.current = { data: null, error };
    await expect(api.inviteUser('personne@example.test')).rejects.toThrow('Accès refusé');
  });
  test('inviteUser : corps non JSON -> message d\'origine', async () => {
    const error = Object.assign(new Error('generic'), { context: { json: async () => { throw new SyntaxError(); } } });
    mockResult.current = { data: null, error };
    await expect(api.inviteUser('personne@example.test')).rejects.toThrow('generic');
  });
});
