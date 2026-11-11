process.env.TZ = 'Europe/Paris';

const { eur, hhmm, formatDate, isoToFr, monthLabel, meal, missionTotal, csvNum, downloadCsv } = require('../format');

// Séparateurs de milliers fr-FR (ICU) : espace fine insécable U+202F (ou U+00A0 selon la version)
const norm = (s) => s.replace(/[  ]/g, ' ');

describe('eur()', () => {
  test.each([
    [0, '0,00 €'],
    [65, '65,00 €'],
    [46.5, '46,50 €'],
    ['76.8', '76,80 €'],
    [1234.5, '1 234,50 €'],
    [1000000, '1 000 000,00 €'],
    [-12.3, '-12,30 €'],
    [0.005, '0,01 €'],
  ])('eur(%p) -> %s', (n, expected) => {
    expect(norm(eur(n))).toBe(expected);
  });
  test('séparateur de milliers insécable', () => {
    expect(eur(1234.5)).toMatch(/^1[  ]234,50/);
  });
  test('espace insécable avant le symbole € (évite un retour à la ligne avant €)', () => {
    expect(eur(65)).toMatch(/[  ]€$/);
  });
});

describe('dates et heures', () => {
  test('hhmm tronque les secondes Postgres', () => {
    expect(hhmm('09:05:00')).toBe('09:05');
    expect(hhmm('22:30')).toBe('22:30');
    expect(hhmm(null)).toBe('');
    expect(hhmm(undefined)).toBe('');
  });
  test('isoToFr -> jj/mm/aaaa', () => {
    expect(isoToFr('2026-01-05')).toBe('05/01/2026');
    expect(isoToFr('2026-12-31')).toBe('31/12/2026');
  });
  test('formatDate -> jour abrégé + jj/mm/aaaa', () => {
    expect(formatDate('2026-11-10')).toMatch(/^mar\.? 10\/11\/2026$/);
    expect(formatDate('2027-01-01')).toMatch(/01\/01\/2027$/);
  });
  test('formatDate ne décale pas la date (pas d\'interprétation UTC)', () => {
    expect(formatDate('2026-03-29')).toMatch(/29\/03\/2026/);
    expect(formatDate('2026-10-25')).toMatch(/25\/10\/2026/);
  });
  test('monthLabel', () => {
    expect(monthLabel('2026-11')).toBe('novembre 2026');
    expect(monthLabel('2027-01')).toBe('janvier 2027');
  });
});

describe('montants mission', () => {
  test('meal', () => {
    expect(meal({ meal_amount: 20 })).toBe(20);
    expect(meal({ meal_amount: '20.00' })).toBe(20);
    expect(meal({ meal_amount: null })).toBe(0);
    expect(meal({})).toBe(0);
  });
  test('missionTotal = CA figé + repas (numeric Postgres renvoyé en chaîne)', () => {
    expect(missionTotal({ amount: '111.50', meal_amount: '20.00' })).toBe(131.5);
    expect(missionTotal({ amount: 65 })).toBe(65);
  });
  test('csvNum : virgule décimale, 2 décimales', () => {
    expect(csvNum(46.5)).toBe('46,50');
    expect(csvNum('1238')).toBe('1238,00');
    expect(csvNum(0)).toBe('0,00');
  });
});

describe('downloadCsv', () => {
  test('BOM UTF-8, séparateur ;, CRLF, échappement des guillemets', async () => {
    let blob;
    const click = jest.fn();
    const origCreate = document.createElement.bind(document);
    jest.spyOn(document, 'createElement').mockImplementation((tag) => {
      const el = origCreate(tag);
      if (tag === 'a') el.click = click;
      return el;
    });
    URL.createObjectURL = jest.fn((b) => {
      blob = b;
      return 'blob:fake';
    });
    URL.revokeObjectURL = jest.fn();

    downloadCsv('missions.csv', [['Date', 'Client'], ['10/11/2026', 'Tribunal "X"'], [null, undefined]]);

    expect(click).toHaveBeenCalledTimes(1);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:fake');
    const text = await new Promise((resolve) => {
      const fr = new FileReader();
      fr.onload = () => resolve(fr.result);
      fr.readAsText(blob);
    });
    const raw = text.replace(/^﻿/, '');
    expect(raw).toBe('"Date";"Client"\r\n"10/11/2026";"Tribunal ""X"""\r\n"";""');
    expect(blob.type).toMatch(/text\/csv/);
    document.createElement.mockRestore();
  });
});
