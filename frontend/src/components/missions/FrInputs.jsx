import React, { useEffect, useState } from 'react';

// Champs de saisie au format français, indépendants de la langue du navigateur
// (les <input type="date|time"> natifs affichent mm/dd/yyyy et AM/PM sur un navigateur en anglais).

const digits = (s, max) => s.replace(/\D/g, '').slice(0, max);

// ---- Date : affichage jj/mm/aaaa, valeur ISO 'YYYY-MM-DD' ----
const formatDateText = (d) => [d.slice(0, 2), d.slice(2, 4), d.slice(4, 8)].filter(Boolean).join('/');

function dateTextToIso(text) {
  const d = digits(text, 8);
  if (d.length !== 8) return '';
  const day = Number(d.slice(0, 2));
  const month = Number(d.slice(2, 4));
  const year = Number(d.slice(4, 8));
  const dt = new Date(year, month - 1, day);
  if (year < 1900 || dt.getFullYear() !== year || dt.getMonth() !== month - 1 || dt.getDate() !== day) return '';
  return `${d.slice(4, 8)}-${d.slice(2, 4)}-${d.slice(0, 2)}`;
}

const isoToDateText = (iso) => (iso ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}` : '');

export const todayIso = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const DateInputFr = ({ value, onChange, className, ...props }) => {
  const [text, setText] = useState(isoToDateText(value));

  // Synchronise si la valeur est modifiée depuis le parent (ex. bouton « Aujourd'hui », réinitialisation)
  useEffect(() => {
    if (value !== dateTextToIso(text)) setText(isoToDateText(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const invalid = digits(text, 8).length === 8 && !dateTextToIso(text);

  return (
    <input
      type="text"
      inputMode="numeric"
      placeholder="jj/mm/aaaa"
      maxLength={10}
      value={text}
      onChange={(e) => {
        const next = formatDateText(digits(e.target.value, 8));
        setText(next);
        onChange(dateTextToIso(next));
      }}
      aria-invalid={invalid}
      className={`${className} ${invalid ? 'border-red-500' : ''}`}
      {...props}
    />
  );
};

// ---- Heure : affichage et valeur 'HH:mm' sur 24 h ----
const formatTimeText = (d) => (d.length > 2 ? `${d.slice(0, 2)}:${d.slice(2)}` : d);

function timeTextToValue(text) {
  const d = digits(text, 4);
  if (d.length !== 4) return '';
  const h = Number(d.slice(0, 2));
  const m = Number(d.slice(2, 4));
  if (h > 23 || m > 59) return '';
  return `${d.slice(0, 2)}:${d.slice(2, 4)}`;
}

export const TimeInputFr = ({ value, onChange, className, ...props }) => {
  const [text, setText] = useState(value || '');

  useEffect(() => {
    if (value !== timeTextToValue(text)) setText(value || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const invalid = digits(text, 4).length === 4 && !timeTextToValue(text);

  return (
    <input
      type="text"
      inputMode="numeric"
      placeholder="HH:mm"
      maxLength={5}
      value={text}
      onChange={(e) => {
        const next = formatTimeText(digits(e.target.value, 4));
        setText(next);
        onChange(timeTextToValue(next));
      }}
      aria-invalid={invalid}
      className={`${className} ${invalid ? 'border-red-500' : ''}`}
      {...props}
    />
  );
};
