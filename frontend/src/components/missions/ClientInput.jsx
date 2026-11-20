import React, { useState } from 'react';
import { filterClients } from '@/lib/clientSuggestions';

// Champ client avec suggestions des clients déjà saisis (liste filtrée, cibles tactiles ≥ 44 px).
// Liste affichée au focus ; clic / Entrée = sélection ; Échap = fermeture.
export const ClientInput = ({ id, value, onChange, suggestions = [], className = '', ...props }) => {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const items = open ? filterClients(suggestions, value) : [];
  const listId = `${id}-suggestions`;

  const pick = (c) => {
    onChange(c);
    setOpen(false);
    setActive(-1);
  };

  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      setOpen(false);
      setActive(-1);
    } else if (e.key === 'ArrowDown' && items.length) {
      e.preventDefault();
      setOpen(true);
      setActive((a) => (a + 1) % items.length);
    } else if (e.key === 'ArrowUp' && items.length) {
      e.preventDefault();
      setActive((a) => (a <= 0 ? items.length - 1 : a - 1));
    } else if (e.key === 'Enter' && active >= 0 && items[active]) {
      e.preventDefault();
      pick(items[active]);
    }
  };

  return (
    <div className="relative">
      <input
        id={id}
        type="text"
        autoComplete="off"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={items.length > 0}
        aria-controls={listId}
        aria-activedescendant={active >= 0 && items[active] ? `${listId}-${active}` : undefined}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
          setActive(-1);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={onKeyDown}
        className={className}
        {...props}
      />
      {items.length > 0 && (
        <ul id={listId} role="listbox" aria-label="Clients déjà saisis"
          className="absolute z-20 left-0 right-0 mt-1 max-h-72 overflow-auto bg-white border border-slate-300 rounded-sm shadow-lg divide-y divide-slate-100">
          {items.map((c, i) => (
            <li key={c} id={`${listId}-${i}`} role="option" aria-selected={i === active}
              // mousedown : évite le blur du champ avant la sélection
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => pick(c)}
              className={`min-h-[44px] px-3 py-2 flex items-center text-base sm:text-sm text-[#0A192F] cursor-pointer break-words ${
                i === active ? 'bg-slate-100' : 'hover:bg-slate-50'}`}>
              {c}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
