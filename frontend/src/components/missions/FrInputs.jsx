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

// ---- Heure : deux champs heures / minutes ; saisie au clavier OU choix dans une liste (flèche ▾), 24 h ----
const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'));

const partClass =
  'h-11 sm:h-10 w-full rounded-sm border bg-white pl-2 pr-8 text-base sm:text-sm text-center shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#1E3A8A]';

// '' si vide ou invalide, sinon la valeur sur 2 chiffres
const normalize = (v, max) => (/^\d{1,2}$/.test(v) && Number(v) <= max ? v.padStart(2, '0') : '');

// Champ 2 chiffres éditable + liste déroulante
const ComboPart = React.forwardRef(
  ({ id, value, options, placeholder, ariaLabel, invalid, onType, onPick, onBlur }, inputRef) => {
    const [open, setOpen] = useState(false);
    const rootRef = React.useRef(null);
    const listRef = React.useRef(null);

    // Ferme la liste au clic / toucher en dehors
    useEffect(() => {
      if (!open) return undefined;
      const close = (e) => !rootRef.current?.contains(e.target) && setOpen(false);
      document.addEventListener('pointerdown', close);
      return () => document.removeEventListener('pointerdown', close);
    }, [open]);

    // Fait défiler jusqu'à la valeur courante à l'ouverture
    useEffect(() => {
      if (open) listRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' });
    }, [open]);

    const current = normalize(value, 99);

    return (
      <div ref={rootRef} className="relative flex-1 min-w-0">
        <input
          ref={inputRef}
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          maxLength={2}
          placeholder={placeholder}
          aria-label={ariaLabel}
          aria-invalid={invalid}
          value={value}
          onChange={(e) => {
            setOpen(false);
            onType(digits(e.target.value, 2));
          }}
          onFocus={(e) => e.target.select()}
          onBlur={onBlur}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown' || (e.key === 'Enter' && !open)) {
              e.preventDefault();
              setOpen(true);
            } else if (e.key === 'Escape') {
              setOpen(false);
            }
          }}
          className={`${partClass} ${invalid ? 'border-red-500' : 'border-slate-300'}`}
        />
        <button
          type="button"
          tabIndex={-1}
          aria-label={`Choisir ${ariaLabel.toLowerCase()}`}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setOpen((o) => !o)}
          className="absolute inset-y-0 right-0 w-8 flex items-center justify-center text-slate-500 hover:text-[#0A192F]"
        >
          <svg viewBox="0 0 20 20" className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} fill="currentColor" aria-hidden="true">
            <path d="M5.5 7.5 10 12l4.5-4.5" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        {open && (
          <ul
            ref={listRef}
            role="listbox"
            className="absolute z-30 left-0 right-0 mt-1 max-h-56 overflow-y-auto rounded-sm border border-slate-200 bg-white shadow-lg py-1"
          >
            {options.map((o) => (
              <li
                key={o}
                role="option"
                aria-selected={o === current}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setOpen(false);
                  onPick(o);
                }}
                className={`px-3 py-2 sm:py-1.5 text-center text-sm cursor-pointer ${
                  o === current ? 'bg-[#1E3A8A] text-white' : 'hover:bg-slate-100'
                }`}
              >
                {o}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }
);

export const TimeSelectFr = ({ id, value, onChange }) => {
  const [h, setH] = useState(value ? value.slice(0, 2) : '');
  const [m, setM] = useState(value ? value.slice(3, 5) : '');
  const minutesRef = React.useRef(null);

  const toValue = (hh, mm) => {
    const nh = normalize(hh, 23);
    const nm = normalize(mm, 59);
    return nh && nm ? `${nh}:${nm}` : '';
  };

  // Synchronise si la valeur est modifiée depuis le parent (ex. réinitialisation)
  useEffect(() => {
    if (value !== toValue(h, m)) {
      setH(value ? value.slice(0, 2) : '');
      setM(value ? value.slice(3, 5) : '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const emit = (hh, mm) => {
    setH(hh);
    setM(mm);
    onChange(toValue(hh, mm));
  };

  // Heure complète (2 chiffres tapés ou choix dans la liste) -> minutes à 00 si vides, puis focus minutes
  const onHourType = (v) => {
    if (v.length === 2 && normalize(v, 23)) {
      emit(v, m || '00');
      minutesRef.current?.focus();
    } else {
      emit(v, m);
    }
  };

  // Au blur, on lit les valeurs affichées (DOM) et non l'état React : le passage automatique
  // au champ minutes déclenche ce blur avant le re-rendu, l'état serait encore l'ancien (ex. "2" au lieu de "22").
  const onHourBlur = (e) => {
    const cur = digits(e.target.value, 2);
    const curM = minutesRef.current?.value ?? m;
    const nh = normalize(cur, 23);
    if (nh && (nh !== cur || !curM)) emit(nh, curM || '00');
  };

  const onMinuteBlur = (e) => {
    const cur = digits(e.target.value, 2);
    const nm = normalize(cur, 59);
    if (nm && nm !== cur) emit(h, nm);
  };

  return (
    <div className="flex items-center gap-1.5">
      <ComboPart id={id} value={h} options={HOURS} placeholder="HH" ariaLabel="Heures"
        invalid={h !== '' && !normalize(h, 23)}
        onType={onHourType} onPick={(v) => onHourType(v)} onBlur={onHourBlur} />
      <span className="text-sm font-semibold text-slate-600">h</span>
      <ComboPart ref={minutesRef} value={m} options={MINUTES} placeholder="mm" ariaLabel="Minutes"
        invalid={m !== '' && !normalize(m, 59)}
        onType={(v) => emit(h, v)} onPick={(v) => emit(h, v)} onBlur={onMinuteBlur} />
    </div>
  );
};
