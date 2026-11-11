// Les calculs dépendent du fuseau local : on fixe Europe/Paris (fuseau d'usage du site).
process.env.TZ = 'Europe/Paris';

const { computeMissionCA, isFrenchPublicHoliday, TARIF_REGIMES, MEAL_ALLOWANCE } = require('../caCalculator');

const ca = (date, startTime, endTime) => computeMissionCA({ date, startTime, endTime });
const rates = (r) => r.breakdown.map((b) => b.rate);
const d = (iso) => new Date(`${iso}T12:00:00`);

// Repères calendaires 2026 : 10/11 mardi, 11/11 mercredi (Armistice), 13/11 vendredi,
// 14/11 samedi, 15/11 dimanche, 25/12 vendredi, 31/12 jeudi.

describe('barème (constantes)', () => {
  test('4 régimes avec les tarifs du code', () => {
    expect(TARIF_REGIMES.map((r) => [r.id, r.firstHour, r.nextHours])).toEqual([
      ['weekday-day', 65.0, 46.5],
      ['weekday-night', 76.8, 58.0],
      ['weekend-day', 76.8, 58.0],
      ['weekend-night', 88.5, 69.8],
    ]);
  });
  test('forfait repas = 20 €', () => {
    expect(MEAL_ALLOWANCE).toBe(20);
  });
});

describe('entrées manquantes', () => {
  test.each([
    [{ date: '', startTime: '09:00', endTime: '10:00' }],
    [{ date: '2026-11-10', startTime: '', endTime: '10:00' }],
    [{ date: '2026-11-10', startTime: '09:00', endTime: '' }],
    [{}],
  ])('%j -> null', (input) => {
    expect(computeMissionCA(input)).toBeNull();
  });
});

describe('heure commencée due', () => {
  test.each([
    ['09:00', '09:01', 1, 1, 65],
    ['09:00', '09:59', 59, 1, 65],
    ['09:00', '10:00', 60, 1, 65],
    ['09:00', '10:01', 61, 2, 111.5],
    ['09:00', '11:00', 120, 2, 111.5],
    ['09:00', '12:30', 210, 4, 204.5],
  ])('mardi %s -> %s : %i min, %i h, %d €', (s, e, minutes, hours, total) => {
    const r = ca('2026-11-10', s, e);
    expect(r.durationMinutes).toBe(minutes);
    expect(r.hoursCount).toBe(hours);
    expect(r.total).toBe(total);
  });
});

describe('bornes jour / nuit (7h-22h) en semaine', () => {
  test.each([
    ['06:59', '07:59', 76.8], // tranche démarrant de nuit
    ['07:00', '08:00', 65],
    ['21:59', '22:59', 65], // démarre avant 22h -> tarif jour
    ['22:00', '23:00', 76.8],
    ['00:00', '01:00', 76.8],
  ])('mardi %s -> %s = %d €', (s, e, total) => {
    expect(ca('2026-11-10', s, e).total).toBe(total);
  });

  test('21:00 -> 23:00 : jour puis nuit', () => {
    expect(rates(ca('2026-11-10', '21:00', '23:00'))).toEqual([65, 58]);
  });
  test('06:00 -> 08:00 : nuit puis jour', () => {
    expect(rates(ca('2026-11-10', '06:00', '08:00'))).toEqual([76.8, 46.5]);
  });
  test('21:30 -> 23:00 : tranches de 60 min depuis le début (21:30 jour, 22:30 nuit)', () => {
    expect(rates(ca('2026-11-10', '21:30', '23:00'))).toEqual([65, 58]);
  });
});

describe('week-end', () => {
  test('samedi 10:00 -> 12:00', () => {
    expect(ca('2026-11-14', '10:00', '12:00').total).toBe(134.8);
  });
  test('dimanche nuit 23:00 -> 01:00 (lundi)', () => {
    const r = ca('2026-11-15', '23:00', '01:00');
    expect(rates(r)).toEqual([88.5, 58]); // 00:00 lundi = semaine nuit
    expect(r.total).toBe(146.5);
  });
  test('vendredi 21:00 -> samedi 01:00 : bascule week-end à minuit', () => {
    const r = ca('2026-11-13', '21:00', '01:00');
    expect(rates(r)).toEqual([65, 58, 58, 69.8]);
    expect(r.total).toBe(250.8);
    expect(r.end.getDate()).toBe(14);
  });
  test('dimanche 22:30 -> lundi 08:00 (10 tranches)', () => {
    const r = ca('2026-11-15', '22:30', '08:00');
    expect(r.hoursCount).toBe(10);
    expect(rates(r)).toEqual([88.5, 69.8, 58, 58, 58, 58, 58, 58, 58, 46.5]);
    expect(r.total).toBe(610.8);
  });
});

describe('jours fériés', () => {
  test('mercredi 11/11 (Armistice) en journée = tarif férié', () => {
    expect(ca('2026-11-11', '10:00', '12:00').total).toBe(134.8);
  });
  test('Noël 22:00 -> 23:00 = férié nuit', () => {
    expect(ca('2026-12-25', '22:00', '23:00').total).toBe(88.5);
  });
  test('veille de férié 23:00 -> 01:00 : bascule férié à minuit', () => {
    expect(rates(ca('2026-11-10', '23:00', '01:00'))).toEqual([76.8, 69.8]);
  });
  test('sortie de férié 23:00 -> 00:30 : retour tarif semaine à minuit', () => {
    expect(rates(ca('2026-11-11', '23:00', '00:30'))).toEqual([88.5, 58]);
  });
  test('31/12 23:00 -> 01/01 01:00 (changement d\'année)', () => {
    const r = ca('2026-12-31', '23:00', '01:00');
    expect(rates(r)).toEqual([76.8, 69.8]);
    expect(r.total).toBe(146.6);
    expect(r.end.getFullYear()).toBe(2027);
    expect(r.end.getMonth()).toBe(0);
    expect(r.end.getDate()).toBe(1);
  });
  test('lundi de Pâques 2026 (06/04) en journée', () => {
    expect(ca('2026-04-06', '09:00', '10:00').total).toBe(76.8);
  });
});

describe('isFrenchPublicHoliday', () => {
  test.each([
    '2026-01-01', '2026-04-06', '2026-05-01', '2026-05-08', '2026-05-14', '2026-05-25',
    '2026-07-14', '2026-08-15', '2026-11-01', '2026-11-11', '2026-12-25',
    '2024-04-01', '2024-05-09', '2024-05-20', // Pâques 31/03/2024
    '2025-04-21', '2025-05-29', '2025-06-09', // Pâques 20/04/2025
    '2027-03-29', '2027-05-06', '2027-05-17', // Pâques 28/03/2027
  ])('%s est férié', (iso) => {
    expect(isFrenchPublicHoliday(d(iso))).toBe(true);
  });
  test.each(['2026-04-03', '2026-04-05', '2026-12-26', '2026-11-10', '2026-05-24', '2026-12-31'])(
    '%s n\'est pas férié (Vendredi saint / 26/12 Alsace-Moselle non gérés)',
    (iso) => {
      expect(isFrenchPublicHoliday(d(iso))).toBe(false);
    }
  );
  test('indépendant de l\'heure (00:00 et 23:59)', () => {
    expect(isFrenchPublicHoliday(new Date('2026-11-11T00:00:00'))).toBe(true);
    expect(isFrenchPublicHoliday(new Date('2026-11-11T23:59:00'))).toBe(true);
  });
});

describe('fin <= début', () => {
  test('fin avant début = mission sur le lendemain (10:00 -> 09:00 = 23 h)', () => {
    const r = ca('2026-11-10', '10:00', '09:00');
    expect(r.durationMinutes).toBe(23 * 60);
    expect(r.hoursCount).toBe(23);
  });
  // Début == fin : saisie refusée (auparavant 24 h facturées, 1 238 €)
  test.each([['10:00'], ['00:00'], ['23:59']])('durée nulle (%s -> %s) refusée : null', (t) => {
    expect(ca('2026-11-10', t, t)).toBeNull();
  });
});

describe('changement d\'heure (Europe/Paris)', () => {
  test('passage à l\'heure d\'été 29/03/2026 01:00 -> 04:00 = 2 h réelles', () => {
    const r = ca('2026-03-29', '01:00', '04:00');
    expect(r.durationMinutes).toBe(120);
    expect(rates(r)).toEqual([88.5, 69.8]);
  });
  test('passage à l\'heure d\'hiver 25/10/2026 01:00 -> 03:00 = 3 h réelles', () => {
    const r = ca('2026-10-25', '01:00', '03:00');
    expect(r.durationMinutes).toBe(180);
    expect(r.hoursCount).toBe(3);
  });
});

describe('breakdown', () => {
  test('structure et libellés', () => {
    const r = ca('2026-11-10', '21:00', '23:00');
    expect(r.breakdown).toHaveLength(2);
    expect(r.breakdown[0]).toMatchObject({
      index: 1,
      label: '1ère heure',
      regimeLabel: 'Lundi au vendredi, de 7h à 22h',
      rate: 65,
    });
    expect(r.breakdown[1]).toMatchObject({
      index: 2,
      label: 'Heure suivante n°2',
      regimeLabel: 'Lundi au vendredi, de 22h à 7h',
      rate: 58,
    });
    expect(r.breakdown[0].clockLabel).toMatch(/mar\.?/i);
    expect(r.breakdown[0].clockLabel).toMatch(/21:00/);
    expect(r.breakdown[1].clockLabel).toMatch(/22:00/);
  });
  test('heure 24 h dans clockLabel (pas AM/PM)', () => {
    const r = ca('2026-11-10', '15:00', '16:00');
    expect(r.breakdown[0].clockLabel).toMatch(/15:00/);
    expect(r.breakdown[0].clockLabel).not.toMatch(/PM|AM/);
  });
  test('total = somme des tranches, arrondi au centime', () => {
    const r = ca('2026-11-14', '00:00', '23:00'); // 23 tranches à virgule
    const sum = r.breakdown.reduce((s, b) => s + b.rate, 0);
    expect(r.total).toBe(Math.round(sum * 100) / 100);
    expect(Number.isInteger(Math.round(r.total * 100))).toBe(true);
    expect(String(r.total)).toMatch(/^\d+(\.\d{1,2})?$/);
  });
});
