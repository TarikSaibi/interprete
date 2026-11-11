// Rendu sans @testing-library (non installé) : react-dom/client + act.
process.env.TZ = 'Europe/Paris';

const React = require('react');
const { act } = require('react');
const { createRoot } = require('react-dom/client');
const { MissionCard, MobileTotal } = require('../MissionCards');
const { DateInputFr, TimeSelectFr } = require('../FrInputs');

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

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
const text = () => container.textContent.replace(/[  ]/g, ' ');

const mission = {
  id: 1,
  mission_date: '2026-11-13',
  start_time: '21:00:00',
  end_time: '01:00:00',
  hours_count: 4,
  amount: '250.80',
  meal_amount: '20.00',
  client: 'Tribunal X',
  notes: 'note test',
  user_email: 'personne@example.test',
  breakdown: [
    { label: '1ère heure', clockLabel: 'ven. 21:00', regimeLabel: 'Lundi au vendredi, de 7h à 22h', rate: 65 },
    { label: 'Heure suivante n°2', clockLabel: 'ven. 22:00', regimeLabel: 'Lundi au vendredi, de 22h à 7h', rate: 58 },
  ],
};

describe('MissionCard', () => {
  test('replié : date jj/mm/aaaa, heures 24 h, total CA + repas', () => {
    render(<MissionCard mission={mission} expanded={false} onToggle={() => {}} />);
    const t = text();
    expect(t).toMatch(/13\/11\/2026/);
    expect(t).toContain('21:00 → 01:00 · 4 h');
    expect(t).toContain('270,80 €');
    expect(t).toContain('dont repas 20,00 €');
    expect(t).not.toContain('personne@example.test'); // showUser absent
    expect(t).not.toMatch(/vacation/i);
    expect(container.querySelector('button').getAttribute('aria-expanded')).toBe('false');
  });

  test('déplié : libellé « CA », détail figé et bouton supprimer', () => {
    const onDelete = jest.fn();
    render(<MissionCard mission={mission} showUser expanded onToggle={() => {}} onDelete={onDelete} />);
    const t = text();
    expect(t).toContain('Interprétariat250,80 €');
    expect(t).toContain('CA de la mission270,80 €');
    expect(t).toContain('Repas20,00 €');
    expect(t).toContain('1ère heure');
    expect(t).toContain('65,00 €');
    expect(t).toContain('Notes : note test');
    expect(t).toContain('personne@example.test');
    expect(t).not.toMatch(/vacation/i);
    const del = [...container.querySelectorAll('button')].find((b) => b.textContent.includes('Supprimer'));
    act(() => del.click());
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  test('sans repas : pas de mention « dont repas »', () => {
    render(<MissionCard mission={{ ...mission, meal_amount: null }} expanded={false} onToggle={() => {}} />);
    expect(text()).toContain('250,80 €');
    expect(text()).not.toContain('dont repas');
  });
});

test('MobileTotal', () => {
  render(<MobileTotal label="novembre 2026" hours={12} amount={1000} meals={40} />);
  expect(text()).toContain('1 040,00 €');
  expect(text()).toContain('CA 1 040,00 €');
  expect(text()).toContain('dont prestations 1 000,00 € · dont repas 40,00 €');
  expect(text()).toContain('12 h');
});

describe('FrInputs', () => {
  test('DateInputFr affiche jj/mm/aaaa et taille de police anti-zoom iOS côté TimeSelectFr', () => {
    render(<DateInputFr value="2026-11-13" onChange={() => {}} className="text-base sm:text-sm" />);
    const input = container.querySelector('input');
    expect(input.value).toBe('13/11/2026');
    expect(input.getAttribute('placeholder')).toBe('jj/mm/aaaa');
    expect(input.className).toMatch(/text-base sm:text-sm/);
  });

  test('TimeSelectFr : 24 h, champs text-base sm:text-sm', () => {
    render(<TimeSelectFr id="start" value="22:30" onChange={() => {}} />);
    const inputs = container.querySelectorAll('input');
    expect(inputs).toHaveLength(2);
    expect(inputs[0].value).toBe('22');
    expect(inputs[1].value).toBe('30');
    inputs.forEach((i) => expect(i.className).toMatch(/text-base sm:text-sm/));
  });
});
