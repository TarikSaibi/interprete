// CA annuel : agrégation par mois N / N-1 à partir des montants enregistrés, variations, format %.
const { yearlyCA, variation, pct } = require('../yearly');

const M = (date, amount, meal = 0, extra = {}) => ({ mission_date: date, amount: String(amount), meal_amount: String(meal), ...extra });

describe('yearlyCA', () => {
  const missions = [
    M('2026-01-05', 65, 20),
    M('2026-01-20', 115.5, 0, { mission_type: 'pages' }),
    M('2026-03-31', 46.5),
    M('2025-01-10', 100),
    M('2025-12-31', 50),
    M('2024-01-10', 999), // hors période
    M('2027-01-01', 999),
  ];
  const y = yearlyCA(missions, 2026);

  test('12 mois, CA = prestations + repas (montants figés, sans recalcul)', () => {
    expect(y.months).toHaveLength(12);
    expect(y.months[0]).toMatchObject({ month: '2026-01', long: 'janvier', ca: 200.5, count: 2, prev: 100, prevCount: 1 });
    expect(y.months[2]).toMatchObject({ month: '2026-03', ca: 46.5, prev: 0 });
    expect(y.months[11]).toMatchObject({ month: '2026-12', ca: 0, prev: 50 });
  });
  test('totaux annuels et variation', () => {
    expect(y.total).toBe(247);
    expect(y.prevTotal).toBe(150);
    expect(y.count).toBe(3);
    expect(y.prevCount).toBe(2);
    expect(y.variation).toBeCloseTo(64.667, 2);
    expect(y.months[0].variation).toBeCloseTo(100.5, 5);
    expect(y.months[2].variation).toBeNull(); // pas de base N-1
    expect(y.months[11].variation).toBe(-100);
  });
  test('aucune mission : zéros, variation nulle', () => {
    const e = yearlyCA([], 2026);
    expect(e.total).toBe(0);
    expect(e.variation).toBeNull();
  });
  test('arrondi au centime (somme de flottants)', () => {
    expect(yearlyCA([M('2026-05-01', 0.1), M('2026-05-02', 0.2)], 2026).months[4].ca).toBe(0.3);
  });
});

describe('variation / pct', () => {
  test('variation', () => {
    expect(variation(110, 100)).toBeCloseTo(10);
    expect(variation(10, 0)).toBeNull();
  });
  test('format français avec signe et espace insécable', () => {
    expect(pct(12.345)).toBe('+12,3\u00a0%');
    expect(pct(-3)).toBe('\u22123,0\u00a0%');
    expect(pct(0)).toBe('0,0\u00a0%');
    expect(pct(null)).toBe('—');
    expect(pct(Infinity)).toBe('—');
  });
});
