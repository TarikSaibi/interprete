import React from 'react';
import { ChevronDown, Trash2 } from 'lucide-react';
import { eur, hhmm, formatDate, meal, missionTotal } from '@/lib/format';

// Détail heure par heure + notes (partagé tableau / cartes)
export const MissionBreakdown = ({ mission }) => (
  <>
    <ul className="space-y-1.5">
      {(mission.breakdown || []).map((b, i) => (
        <li key={i} className="flex justify-between gap-3 text-xs text-slate-600">
          <span>
            <span className="font-medium text-slate-800">{b.label}</span> ·{' '}
            <span className="capitalize">{b.clockLabel}</span>
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
        <p className="font-semibold text-[#0A192F] capitalize">{formatDate(m.mission_date)}</p>
        <p className="text-sm text-slate-600">{hhmm(m.start_time)} → {hhmm(m.end_time)} · {m.hours_count} h</p>
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
            <span className="text-slate-600">CA</span><span className="font-medium">{eur(m.amount)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Repas</span><span className="font-medium">{eur(meal(m))}</span>
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

// Ligne total en bas de la liste mobile
export const MobileTotal = ({ label, hours, amount, meals }) => (
  <div className="bg-slate-50 p-3 flex items-start justify-between gap-3 text-[#0A192F]">
    <div>
      <p className="font-semibold capitalize">{label}</p>
      <p className="text-sm text-slate-600">{hours} h</p>
    </div>
    <div className="text-right">
      <p className="font-bold whitespace-nowrap">{eur(amount + meals)}</p>
      <p className="text-xs text-slate-500 whitespace-nowrap">CA {eur(amount)} · repas {eur(meals)}</p>
    </div>
  </div>
);
