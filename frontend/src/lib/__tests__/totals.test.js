// Regroupement oral + écrit : total combiné, sous-totaux par type, tri par date, lignes de total CSV
process.env.TZ = 'Europe/Paris';

const React = require('react');
const { act } = require('react');
const { createRoot } = require('react-dom/client');
const { typeTotals, sortByDate, csvTotalRows } = require('../format');
const { TypeSubtotals, SubtotalRows, MobileTotal } = require('@/components/missions/MissionCards');

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const norm = (s) => s.replace(/[  ]/g, ' ');

const oral = { id: 'o1', mission_date: '2026-11-13', start_time: '21:00:00', hours_count: 4, amount: '250.80', meal_amount: '20.00' };
const oral2 = { id: 'o2', mission_date: '2026-11-02', start_time: '09:00:00', hours_count: 1, amount: '65.00', meal_amount: '0' };
const written = { id: 'p1', mission_type: 'pages', mission_date: '2026-11-13', start_time: null, pages_count: 3, amount: '115.50', meal_amount: 0 };

describe('typeTotals (montants enregistrés, jamais recalculés)', () => {
  test('oral + écrit : total combiné et sous-totaux', () => {
    const t = typeTotals([oral, written, oral2]);
    expect(t.count).toBe(3);
    expect(t.oral).toEqual({ count: 2, hours: 5, amount: 315.8, meals: 20 });
    expect(t.written).toEqual({ count: 1, pages: 3, amount: 115.5, meals: 0 });
    expect(t.hours).toBe(5);
    expect(t.pages).toBe(3);
    expect(t.amount).toBeCloseTo(431.3, 2);
    expect(t.meals).toBe(20);
  });
  test('montant figé utilisé tel quel (pas de recalcul selon le barème)', () => {
    expect(typeTotals([{ ...oral, amount: '12.34' }]).amount).toBe(12.34);
  });
  test('liste vide / valeurs manquantes -> 0, jamais NaN', () => {
    const t = typeTotals([{ mission_date: '2026-11-01' }]);
    expect(t.amount).toBe(0);
    expect(t.hours).toBe(0);
    expect(typeTotals([]).count).toBe(0);
  });
});

test('sortByDate : oral et écrit mélangés, par date puis heure (écrit en fin de journée)', () => {
  expect(sortByDate([written, oral, oral2]).map((m) => m.id)).toEqual(['o2', 'o1', 'p1']);
});

describe('csvTotalRows', () => {
  test('sous-totaux par type + total général, colonnes alignées', () => {
    const rows = csvTotalRows(typeTotals([oral, oral2, written]));
    expect(rows[0]).toEqual([]);
    expect(rows[1]).toEqual(['Sous-total interprétariat', '', '', '', 5, '', '315,80', '20,00', '335,80', '', '']);
    expect(rows[2]).toEqual(['Sous-total traduction écrite', '', '', '', '', 3, '115,50', '0,00', '115,50', '', '']);
    expect(rows[3]).toEqual(['CA total', '', '', '', 5, 3, '431,30', '20,00', '451,30', '', '']);
  });
  test('type absent : sa ligne est omise ; colonne utilisateur en tête pour l\'admin', () => {
    const rows = csvTotalRows(typeTotals([written]), 1);
    expect(rows).toHaveLength(3);
    expect(rows[1][1]).toBe('Sous-total traduction écrite');
    expect(rows[2].slice(0, 2)).toEqual(['', 'CA total']);
  });
});

describe('composants de sous-totaux', () => {
  let container;
  let root;
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });
  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });
  const render = (el) => act(() => root.render(el));
  const text = () => norm(container.textContent);

  test('TypeSubtotals : interprétariat (h, CA, repas) et traduction écrite (pages, CA)', () => {
    render(<TypeSubtotals totals={typeTotals([oral, written])} />);
    expect(text()).toContain('Interprétariat : 4 h');
    expect(text()).toContain('CA 270,80 € (dont repas 20,00 €)');
    expect(text()).toContain('Traduction écrite : 3 pages');
    expect(text()).toContain('CA 115,50 €');
  });
  test('TypeSubtotals : ligne masquée sans mission du type', () => {
    render(<TypeSubtotals totals={typeTotals([oral])} />);
    expect(text()).not.toContain('Traduction écrite');
  });
  test('MobileTotal avec sous-totaux + total combiné', () => {
    const t = typeTotals([oral, written]);
    render(<MobileTotal label="Total" hours={t.hours} pages={t.pages} amount={t.amount} meals={t.meals} subtotals={t} />);
    expect(text()).toContain('Interprétariat : 4 h');
    expect(text()).toContain('Traduction écrite : 3 pages');
    expect(text()).toContain('386,30 €');
  });
  test('SubtotalRows : une ligne de pied par type', () => {
    render(
      <table><tfoot><SubtotalRows totals={typeTotals([oral, written])} labelSpan={3} trailing /></tfoot></table>
    );
    const rows = [...container.querySelectorAll('tr')].map((r) => norm(r.textContent));
    expect(rows).toHaveLength(2);
    expect(rows[0]).toContain('Sous-total interprétariat');
    expect(rows[0]).toContain('270,80 €');
    expect(rows[1]).toContain('Sous-total traduction écrite');
    expect(rows[1]).toContain('3 pages');
    // vide + libellé + quantité + prestations + repas + CA + vide final
    expect(container.querySelectorAll('tr')[0].children).toHaveLength(7);
  });
});
