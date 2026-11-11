// Barème officiel de l'interprétariat oral (missions réalisées à compter du 22/09/2023)
// Source : Ministère de la Justice, "Mémoire de frais de justice des traducteurs interprètes en matière civile",
// tarifs des interprètes ayant exercé leur droit d'option (non COSP), maj. 10/10/2023 (art. R.122 et A.43-7 CPP).
// Forfait frais de repas ajouté optionnellement à une mission
export const MEAL_ALLOWANCE = 20;

export const TARIF_REGIMES = [
  { id: 'weekday-day', label: 'Lundi au vendredi, de 7h à 22h', firstHour: 65.0, nextHours: 46.5 },
  { id: 'weekday-night', label: 'Lundi au vendredi, de 22h à 7h', firstHour: 76.8, nextHours: 58.0 },
  { id: 'weekend-day', label: 'Samedi, dimanche ou jour férié, de 7h à 22h', firstHour: 76.8, nextHours: 58.0 },
  { id: 'weekend-night', label: 'Samedi, dimanche ou jour férié, de 22h à 7h', firstHour: 88.5, nextHours: 69.8 },
];

// ---- Traduction écrite (facturée à la page) ----
// Tarif officiel : 38,50 € par page de texte en français de 250 mots (police 12 Times New Roman),
// sans majoration nuit / week-end / urgence prévue par le barème.
// Source : Ministère de la Justice (DSJ – SDFIP – FIP4), mémoires de frais de justice des traducteurs interprètes
// en matière civile et pénale, missions à compter du 22/09/2023, maj. 10/10/2023 ; art. R.122 et A.43-7 CPP.
//   - avec droit d'option exercé (non COSP) : 38,50 €  <- cohérent avec TARIF_REGIMES ci-dessus
//   - sans droit d'option (COSP)            : 25,00 €
// https://www.justice.gouv.fr/sites/default/files/2025-03/TI_civil_do_22092023.pdf
// https://www.justice.gouv.fr/sites/default/files/2025-03/TI_penal_sdo_22092023.pdf
export const PAGE_TRANSLATION_RATE = 38.5;
export const PAGE_WORDS = 250;
// Plafond de saisie (garde-fou, repris dans la contrainte SQL de la migration 004)
export const MAX_PAGES = 1000;

// pages : nombre entier de pages (> 0). Montant figé à la saisie comme pour le mode horaire.
export function computePagesCA({ pages }) {
  const n = Number(pages);
  if (!Number.isInteger(n) || n <= 0 || n > MAX_PAGES) return null;
  const total = Math.round(n * PAGE_TRANSLATION_RATE * 100) / 100;
  const unit = PAGE_TRANSLATION_RATE.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return {
    pagesCount: n,
    total,
    breakdown: [
      {
        index: 1,
        label: 'Traduction écrite',
        clockLabel: `${n} page${n > 1 ? 's' : ''} × ${unit}\u00a0€`,
        regimeLabel: `Page de ${PAGE_WORDS} mots (texte en français)`,
        rate: total,
      },
    ],
  };
}

// Calcule le dimanche de Pâques (algorithme de Meeus/Jones/Butcher)
function getEasterSunday(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function isSameDate(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function isFrenchPublicHoliday(date) {
  const year = date.getFullYear();
  const easter = getEasterSunday(year);
  const holidays = [
    new Date(year, 0, 1), // Jour de l'an
    addDays(easter, 1), // Lundi de Pâques
    new Date(year, 4, 1), // Fête du Travail
    new Date(year, 4, 8), // Victoire 1945
    addDays(easter, 39), // Ascension
    addDays(easter, 50), // Lundi de Pentecôte
    new Date(year, 6, 14), // Fête nationale
    new Date(year, 7, 15), // Assomption
    new Date(year, 10, 1), // Toussaint
    new Date(year, 10, 11), // Armistice
    new Date(year, 11, 25), // Noël
  ];
  return holidays.some((h) => isSameDate(h, date));
}

function getRegimeForInstant(instant) {
  const dayOfWeek = instant.getDay(); // 0 = dimanche, 6 = samedi
  const isWeekendOrHoliday = dayOfWeek === 0 || dayOfWeek === 6 || isFrenchPublicHoliday(instant);
  const hour = instant.getHours();
  const isNight = hour >= 22 || hour < 7;

  if (isWeekendOrHoliday) {
    return isNight ? TARIF_REGIMES[3] : TARIF_REGIMES[2];
  }
  return isNight ? TARIF_REGIMES[1] : TARIF_REGIMES[0];
}

// date: 'YYYY-MM-DD', startTime/endTime: 'HH:mm'
export function computeMissionCA({ date, startTime, endTime }) {
  if (!date || !startTime || !endTime) return null;

  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  const start = new Date(`${date}T00:00:00`);
  start.setHours(sh, sm, 0, 0);

  const end = new Date(start);
  end.setHours(eh, em, 0, 0);
  if (end.getTime() === start.getTime()) return null; // durée nulle : saisie invalide
  if (end < start) {
    end.setDate(end.getDate() + 1); // mission à cheval sur minuit
  }
  const endsNextDay = end.getDate() !== start.getDate();

  const durationMinutes = (end.getTime() - start.getTime()) / 60000;
  const hoursCount = Math.max(1, Math.ceil(durationMinutes / 60));

  const breakdown = [];
  let total = 0;

  for (let i = 0; i < hoursCount; i += 1) {
    const segmentStart = new Date(start.getTime() + i * 60 * 60000);
    const regime = getRegimeForInstant(segmentStart);
    const rate = i === 0 ? regime.firstHour : regime.nextHours;
    total += rate;

    breakdown.push({
      index: i + 1,
      label: i === 0 ? '1ère heure' : `Heure suivante n°${i + 1}`,
      clockLabel: segmentStart.toLocaleString('fr-FR', { weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }),
      regimeLabel: regime.label,
      rate,
    });
  }

  return {
    start,
    end,
    durationMinutes,
    endsNextDay,
    hoursCount,
    breakdown,
    total: Math.round(total * 100) / 100,
  };
}
