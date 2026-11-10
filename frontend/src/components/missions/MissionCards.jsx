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

// Carte mission pour mobile (remplace la ligne de tableau sous md)
export const MissionCard = ({ mission: m, showUser, expanded, onToggle, onDelete }) => (
  <article className="border border-slate-200 rounded-sm bg-white">
    <div className="p-3 flex items-start justify-between gap-3">
      <div className="min-w-0">
        {showUser && <p className="text-xs text-slate-500 truncate">{m.user_email}</p>}
        <p className="font-semibold text-[#0A192F] capitalize">{formatDate(m.mission_date)}</p>
        <p className="text-sm text-slate-600">
          {hhmm(m.start_time)} → {hhmm(m.end_time)} · {m.hours_count} h
        </p>
        {m.client && <p className="text-sm text-slate-600 break-words">{m.client}</p>}
      </div>
      <div className="text-right shrink-0">
        <p className="font-bold text-[#0A192F] whitespace-nowrap">{eur(missionTotal(m))}</p>
        <p className="text-xs text-slate-500 whitespace-nowrap">CA {eur(m.amount)}</p>
        {meal(m) > 0 && <p className="text-xs text-slate-500 whitespace-nowrap">Repas {eur(meal(m))}</p>}
      </div>
    </div>
    <div className="flex border-t border-slate-100">
      <button type="button" onClick={onToggle}
        className="flex-1 inline-flex items-center justify-center gap-1.5 h-11 text-sm text-slate-600 hover:bg-slate-50">
        <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        {expanded ? 'Masquer le détail' : 'Détail'}
      </button>
      {onDelete && (
        <button type="button" onClick={onDelete} aria-label="Supprimer"
          className="w-14 inline-flex items-center justify-center h-11 border-l border-slate-100 text-slate-400 hover:text-red-600 hover:bg-red-50">
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
    {expanded && (
      <div className="px-3 pb-3 pt-2 border-t border-slate-100 bg-slate-50/60">
        <MissionBreakdown mission={m} />
      </div>
    )}
  </article>
);

// Bandeau total en bas de la liste mobile
export const MobileTotal = ({ label, hours, amount, meals }) => (
  <div className="border-2 border-slate-300 bg-slate-50 rounded-sm p-3 flex items-start justify-between gap-3 text-[#0A192F]">
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
