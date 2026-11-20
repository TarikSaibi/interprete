// Champ client avec suggestions : affichage au focus, filtre, sélection clic / clavier, cibles tactiles.
const React = require('react');
const { act, useState } = require('react');
const { createRoot } = require('react-dom/client');
const { ClientInput } = require('@/components/missions/ClientInput');

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const SUGG = ['Commissariat Paris 18e', 'Tribunal judiciaire de Créteil', 'Gendarmerie de Créteil'];
let container;
let root;
let last;
beforeEach(() => {
  last = null;
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

const Wrapper = ({ initial = '', suggestions = SUGG }) => {
  const [v, setV] = useState(initial);
  last = v;
  return <ClientInput id="c" value={v} onChange={setV} suggestions={suggestions} className="text-base sm:text-sm" />;
};
const render = (p) => act(() => root.render(<Wrapper {...p} />));
const input = () => container.querySelector('#c');
const options = () => [...container.querySelectorAll('[role="option"]')];
const focus = () => act(() => input().dispatchEvent(new FocusEvent('focusin', { bubbles: true })));
function type(value) {
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
  act(() => {
    setter.call(input(), value);
    input().dispatchEvent(new Event('input', { bubbles: true }));
  });
}
const key = (k) => act(() => input().dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true })));

test('fermé par défaut, ouvert au focus avec tous les clients', () => {
  render();
  expect(options()).toHaveLength(0);
  focus();
  expect(options().map((o) => o.textContent)).toEqual(SUGG);
  expect(input().getAttribute('aria-expanded')).toBe('true');
});

test('filtre sans accents ni casse ; cibles ≥ 44 px, police anti-zoom iOS', () => {
  render();
  focus();
  type('creteil');
  expect(options().map((o) => o.textContent)).toEqual(['Tribunal judiciaire de Créteil', 'Gendarmerie de Créteil']);
  options().forEach((o) => {
    expect(o.className).toContain('min-h-[44px]');
    expect(o.className).toContain('text-base sm:text-sm');
  });
});

test('clic sur une suggestion : valeur choisie, liste fermée', () => {
  render();
  focus();
  act(() => options()[1].click());
  expect(last).toBe('Tribunal judiciaire de Créteil');
  expect(options()).toHaveLength(0);
});

test('clavier : flèches + Entrée, Échap ferme', () => {
  render();
  focus();
  key('ArrowDown');
  key('ArrowDown');
  expect(options()[1].getAttribute('aria-selected')).toBe('true');
  key('ArrowUp');
  key('Enter');
  expect(last).toBe('Commissariat Paris 18e');
  type('');
  expect(options().length).toBe(3);
  key('Escape');
  expect(options()).toHaveLength(0);
});

test('saisie libre conservée ; sans suggestions, pas de liste', () => {
  render({ suggestions: [] });
  focus();
  type('Nouveau client');
  expect(last).toBe('Nouveau client');
  expect(container.querySelector('[role="listbox"]')).toBeNull();
});
