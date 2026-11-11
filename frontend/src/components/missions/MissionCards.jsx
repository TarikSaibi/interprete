import React from 'react';
import { ChevronDown, Trash2 } from 'lucide-react';
import { eur, hhmm, formatDate, meal, missionTotal, isPages, missionQty, plural } from '@/lib/format';

// Libellé court du type de mission
export const TypeBadge = ({ mission }) => (
  <span className={`inline-block px-1.5 py-0.5 rounded-sm text-[11px] font-semibold uppercase tracking-wide align-middle ${
    isPages(mission) ? 'bg-amber-100 text-amber-900' : 'bg-blue-100 text-blue-900'}`}>
    {isPages(mission) ? 'Écrit' : 'Oral'}
  </span>
);

// Horaires (oral) ou mention traduction écrite
export const missionWhen = (m) => (isPages(m) ? 'Traduction écrite' : `${hhmm(m.start_time)} → ${hhmm(m.end_time)}`);

// Détail heure par heure + notes (partagé tableau / cartes)
export const MissionBreakdown = ({ mission }) => (
  <>
    <ul className="space-y-1.5">
      {(mission.breakdown || []).map((b, i) => (
        <li key={i} className="flex justify-between gap-3 text-xs text-slate-600">
          <span>
            <span className="font-medium text-slate-800">{b.label}</span> ·{' '}
            <span className={isPages(mission) ? '' : 'capitalize'}>{b.clockLabel}</span>
            <span className="block sm:inline"><span className="hidden sm:inline"> · </span>{b.regimeLabel}</span>
          </span>
          <span className="whitespace-nowrap">{eur(b.rate)}</span>
        </li>
      ))}
    </ul>
    {mission.notes && <p className="mt-2 text-xs text-slate-500 break-words">Notes : {mission.notes}</p>}
  </>
);

// Ligne mission pour mobile (remplace la ligne de tableau sous md). À placer dans une liste avec divide-y.
export const MissionCard = ({ mission: m, showUser, expanded, onToggle, onDelete }) => (
  <article className="bg-white">
    <button type="button" onClick={onToggle} aria-expanded={expanded}
      className="w-full text-left p-3 flex items-start gap-3 active:bg-slate-50">
      <div className="min-w-0 flex-1">
        {showUser && <p className="text-xs text-slate-500 truncate">{m.user_email}</p>}
        <p className="font-semibold text-[#0A192F]"><span className="capitalize">{formatDate(m.mission_date)}</span> <TypeBadge mission={m} /></p>
        <p className="text-sm text-slate-600">{missionWhen(m)} · {missionQty(m)}</p>
        {m.client && <p className="text-sm text-slate-500 truncate">{m.client}</p>}
      </div>
      <div className="text-right shrink-0">
        <p className="font-bold text-[#0A192F] whitespace-nowrap">{eur(missionTotal(m))}</p>
        {meal(m) > 0 && <p className="text-xs text-slate-500 whitespace-nowrap">dont repas {eur(meal(m))}</p>}
      </div>
      <ChevronDown className={`h-5 w-5 mt-0.5 shrink-0 text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
    </button>
    {expanded && (
      <div className="px-3 pb-3 space-y-3">
        <div className="rounded-sm bg-slate-50 p-3 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">{isPages(m) ? 'Traduction' : 'Interprétariat'}</span><span className="font-medium">{eur(m.amount)}</span>
          </div>
          {!isPages(m) && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Repas</span><span className="font-medium">{eur(meal(m))}</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-semibold text-[#0A192F]">
            <span>CA de la mission</span><span>{eur(missionTotal(m))}</span>
          </div>
          <div className="border-t border-slate-200 pt-2">
            <MissionBreakdown mission={m} />
          </div>
        </div>
        {onDelete && (
          <button type="button" onClick={onDelete}
            className="w-full inline-flex items-center justify-center gap-2 h-11 border border-red-200 text-red-600 rounded-sm text-sm hover:bg-red-50">
            <Trash2 className="h-4 w-4" /> Supprimer la mission
          </button>
        )}
      </div>
    )}
  </article>
);

// Sous-totaux par type (lignes masquées s'il n'y a aucune mission du type)
// asSpans : rendu en <span> (contenu autorisé dans un <button>)
export const TypeSubtotals = ({ totals: t, className = '', asSpans = false }) => {
  const List = asSpans ? 'span' : 'ul';
  const Item = asSpans ? 'span' : 'li';
  return (
  <List className={`${asSpans ? 'block ' : ''}space-y-1 text-sm ${className}`}>
    {t.oral.count > 0 && (
      <Item className="flex flex-wrap justify-between gap-x-3">
        <span><span className="font-medium">Interprétariat</span> : {t.oral.hours} h</span>
        <span className="whitespace-nowrap">
          CA {eur(t.oral.amount + t.oral.meals)}{t.oral.meals > 0 && ` (dont repas ${eur(t.oral.meals)})`}
        </span>
      </Item>
    )}
    {t.written.count > 0 && (
      <Item className="flex flex-wrap justify-between gap-x-3">
        <span><span className="font-medium">Traduction écrite</span> : {plural(t.written.pages, 'page')}</span>
        <span className="whitespace-nowrap">CA {eur(t.written.amount + t.written.meals)}</span>
      </Item>
    )}
    {t.oral.count > 0 && t.written.count > 0 && (
      <Item className="flex flex-wrap justify-between gap-x-3 border-t border-slate-200 pt-1 font-semibold">
        <span>Total : {t.oral.hours} h · {plural(t.written.pages, 'page')}</span>
        <span className="whitespace-nowrap">
          CA {eur(t.oral.amount + t.oral.meals + t.written.amount + t.written.meals)}
        </span>
      </Item>
    )}
  </List>
  );
};

// Ligne total en bas de la liste mobile (subtotals : sortie de typeTotals, optionnelle)
export const MobileTotal = ({ label, hours, pages = 0, amount, meals, subtotals }) => (
  <div className="bg-slate-50 text-[#0A192F]">
    {subtotals && (subtotals.oral.count > 0 || subtotals.written.count > 0) && (
      <TypeSubtotals totals={subtotals} className="px-3 pt-3 pb-2 border-b border-slate-200 text-slate-700" />
    )}
    <div className="p-3 flex items-start justify-between gap-3">
      <div>
        <p className="font-semibold capitalize">{label}</p>
        <p className="text-sm text-slate-600">{hours} h{pages > 0 && ` · ${plural(pages, 'page')}`}</p>
      </div>
      <div className="text-right">
        <p className="font-bold whitespace-nowrap">CA {eur(amount + meals)}</p>
        <p className="text-xs text-slate-500 whitespace-nowrap">dont prestations {eur(amount)} · dont repas {eur(meals)}</p>
      </div>
    </div>
  </div>
);

// Lignes de sous-total par type pour le pied de tableau (≥ md).
// Colonnes : [vide][libellé × labelSpan][quantité][prestations][repas][CA = prestations + repas][vide ?]
export const SubtotalRows = ({ totals: t, labelSpan, trailing = false, cell = 'px-3 py-2' }) => {
  const rows = [];
  if (t.oral.count) rows.push(['oral', 'Sous-total interprétariat', `${t.oral.hours} h`, t.oral.amount, t.oral.meals]);
  if (t.written.count) {
    rows.push(['written', 'Sous-total traduction écrite', plural(t.written.pages, 'page'), t.written.amount, t.written.meals]);
  }
  return rows.map(([key, label, qty, amount, meals]) => (
    <tr key={key} className="border-t border-slate-200 font-normal text-slate-700">
      <td />
      <td colSpan={labelSpan} className={cell}>{label}</td>
      <td className={`${cell} text-right whitespace-nowrap`}>{qty}</td>
      <td className={`${cell} text-right whitespace-nowrap`}>{eur(amount)}</td>
      <td className={`${cell} text-right whitespace-nowrap`}>{meals ? eur(meals) : '—'}</td>
      <td className={`${cell} text-right whitespace-nowrap`}>{eur(amount + meals)}</td>
      {trailing && <td />}
    </tr>
  ));
};
