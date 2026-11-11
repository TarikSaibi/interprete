// Champs de saisie FR : DatePickerButton, DateInputFr, TimeSelectFr (react-dom/client + act).
process.env.TZ = 'Europe/Paris';

const React = require('react');
const { act, useState } = require('react');
const { createRoot } = require('react-dom/client');
const { DateInputFr, DatePickerButton, TimeSelectFr, todayIso } = require('@/components/missions/FrInputs');

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

// Saisie sur un input contrôlé React (setter natif + événement input)
function type(el, value) {
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
  act(() => {
    setter.call(el, value);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

describe('DatePickerButton', () => {
  test('vrai bouton accessible + input date natif ISO masqué (pas display:none), cible tactile >= 40 px', () => {
    render(<DatePickerButton value="2026-11-13" onChange={() => {}} />);
    const input = container.querySelector('input[type="date"]');
    const button = container.querySelector('button');
    expect(input.value).toBe('2026-11-13');
    expect(button.getAttribute('type')).toBe('button');
    expect(button.getAttribute('aria-label')).toBe('Choisir une date dans le calendrier');
    expect(input.getAttribute('tabindex')).toBe('-1');
    expect(input.getAttribute('aria-hidden')).toBe('true');
    expect(input.className).toMatch(/opacity-0/);
    expect(input.className).toMatch(/pointer-events-none/);
    expect(input.className).not.toMatch(/\bhidden\b/);
    expect(input.className).toMatch(/text-base/); // pas de zoom iOS
    expect(container.firstChild.className).toMatch(/h-11 sm:h-10 w-11 sm:w-10/);
  });

  test('valeur absente -> champ vide (pas « undefined »)', () => {
    render(<DatePickerButton value={undefined} onChange={() => {}} />);
    expect(container.querySelector('input').value).toBe('');
  });

  test('choix d\'une date -> onChange(ISO) ; effacement -> onChange("")', () => {
    const calls = [];
    const Picker = () => {
      const [d, setD] = useState('');
      return <DatePickerButton value={d} onChange={(v) => { calls.push(v); setD(v); }} />;
    };
    render(<Picker />);
    const input = container.querySelector('input');
    type(input, '2026-12-25');
    expect(calls).toEqual(['2026-12-25']);
    type(input, '');
    expect(calls).toEqual(['2026-12-25', '']);
  });

  test('clic sur le bouton : appelle showPicker()', () => {
    render(<DatePickerButton value="" onChange={() => {}} />);
    const input = container.querySelector('input');
    let n = 0;
    input.showPicker = () => {
      n += 1;
    };
    act(() => container.querySelector('button').click());
    expect(n).toBe(1);
  });

  test('showPicker absent ou en erreur -> repli focus() + click() sur l\'input, sans exception', () => {
    render(<DatePickerButton value="" onChange={() => {}} />);
    const input = container.querySelector('input');
    const button = container.querySelector('button');
    let clicks = 0;
    input.addEventListener('click', () => {
      clicks += 1;
    });

    input.showPicker = () => {
      throw new Error('NotAllowedError');
    };
    expect(() => act(() => button.click())).not.toThrow();
    expect(document.activeElement).toBe(input);
    expect(clicks).toBe(1);

    input.showPicker = undefined;
    act(() => button.click());
    expect(clicks).toBe(2);
  });

  test('le calendrier s\'ouvre sur la date déjà saisie au clavier ; effacer vide le champ jj/mm/aaaa', () => {
    const Field = () => {
      const [d, setD] = useState('');
      return (
        <>
          <DateInputFr id="d" value={d} onChange={setD} className="" />
          <DatePickerButton value={d} onChange={setD} />
        </>
      );
    };
    render(<Field />);
    type(container.querySelector('#d'), '05032027');
    expect(container.querySelector('input[type="date"]').value).toBe('2027-03-05');
    type(container.querySelector('input[type="date"]'), '');
    expect(container.querySelector('#d').value).toBe('');
  });

  test('couplé à DateInputFr : la date choisie s\'affiche en jj/mm/aaaa', () => {
    const Field = () => {
      const [d, setD] = useState('');
      return (
        <>
          <DateInputFr id="d" value={d} onChange={setD} className="text-base sm:text-sm" />
          <DatePickerButton value={d} onChange={setD} />
        </>
      );
    };
    render(<Field />);
    type(container.querySelector('input[type="date"]'), '2026-11-13');
    expect(container.querySelector('#d').value).toBe('13/11/2026');
    type(container.querySelector('input[type="date"]'), '2027-01-01');
    expect(container.querySelector('#d').value).toBe('01/01/2027');
  });
});

describe('DateInputFr (saisie clavier)', () => {
  test.each([
    ['13112026', '13/11/2026', '2026-11-13'],
    ['13/11/2026', '13/11/2026', '2026-11-13'],
    ['1311', '13/11', ''],
    ['29022028', '29/02/2028', '2028-02-29'], // bissextile
  ])('saisie %p -> affiché %p, valeur %p', (input, shown, iso) => {
    const calls = [];
    render(<DateInputFr value="" onChange={(v) => calls.push(v)} className="" />);
    const el = container.querySelector('input');
    type(el, input);
    expect(el.value).toBe(shown);
    expect(calls[calls.length - 1]).toBe(iso);
    expect(el.getAttribute('aria-invalid')).toBe('false');
  });

  test.each([['31022026'], ['29022026'], ['32012026'], ['01131999'], ['01011899']])('date impossible %p -> "" et aria-invalid', (input) => {
    const calls = [];
    render(<DateInputFr value="" onChange={(v) => calls.push(v)} className="" />);
    const el = container.querySelector('input');
    type(el, input);
    expect(calls[calls.length - 1]).toBe('');
    expect(el.getAttribute('aria-invalid')).toBe('true');
  });

  test('todayIso() au format AAAA-MM-JJ', () => {
    expect(todayIso()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('TimeSelectFr (saisie clavier, 24 h)', () => {
  const setup = () => {
    const calls = [];
    render(<TimeSelectFr id="t" label="Heure de début" value="" onChange={(v) => calls.push(v)} />);
    const [h, m] = container.querySelectorAll('input');
    return { calls, h, m };
  };

  test('heure complète -> minutes à 00', () => {
    const { calls, h, m } = setup();
    type(h, '22');
    expect(calls[calls.length - 1]).toBe('22:00');
    expect(m.value).toBe('00');
  });
  test('heures puis minutes', () => {
    const { calls, h, m } = setup();
    type(h, '07');
    type(m, '45');
    expect(calls[calls.length - 1]).toBe('07:45');
  });
  test('heure 24 invalide : valeur vide, aria-invalid', () => {
    const { calls, h } = setup();
    type(h, '24');
    expect(calls[calls.length - 1]).toBe('');
    expect(h.getAttribute('aria-invalid')).toBe('true');
  });
  test('libellés accessibles des deux parties', () => {
    const { h, m } = setup();
    expect(h.getAttribute('aria-label')).toBe('Heure de début — heures');
    expect(m.getAttribute('aria-label')).toBe('Heure de début — minutes');
  });
});
