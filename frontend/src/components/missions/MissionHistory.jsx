import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, Download, Trash2 } from 'lucide-react';
import { listMissionsForMonth, deleteMission, shiftMonth } from '@/lib/missionsApi';
import {
  eur, hhmm, formatDate, isoToFr, monthLabel, meal, missionTotal, csvNum, downloadCsv, isPages, missionQty, plural,
  typeTotals, sortByDate, csvTotalRows,
} from '@/lib/format';
import {
  MissionCard, MissionBreakdown, MobileTotal, TypeBadge, TypeSubtotals, SubtotalRows, missionWhen,
} from '@/components/missions/MissionCards';
import { frError } from '@/lib/errors';

function exportCsv(month, missions) {
  downloadCsv(`missions-${month}.csv`, [
    ['Date', 'Type', 'Début', 'Fin', 'Heures facturées', 'Pages', 'Prestations (EUR)', 'Repas (EUR)', 'CA (EUR)', 'Client / lieu', 'Notes'],
    ...missions.map((m) => [
      isoToFr(m.mission_date), isPages(m) ? 'Traduction écrite' : 'Interprétariat', hhmm(m.start_time), hhmm(m.end_time),
      m.hours_count ?? '', m.pages_count ?? '',
      csvNum(m.amount), csvNum(meal(m)), csvNum(missionTotal(m)), m.client, m.notes,
    ]),
    ...csvTotalRows(typeTotals(missions)),
  ]);
}

export const MissionHistory = ({ month, onMonthChange, refreshToken }) => {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setMissions(sortByDate(await listMissionsForMonth(month)));
    } catch (e) {
      setError(`Chargement impossible : ${frError(e)}`);
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => {
    load();
  }, [load, refreshToken]);

  // Montants enregistrés (figés), oral + écrit mélangés, avec sous-totaux par type
  const totals = useMemo(() => typeTotals(missions), [missions]);

  const onDelete = async (m) => {
    if (!window.confirm(`Supprimer définitivement la mission du ${formatDate(m.mission_date)} (${missionWhen(m)}, ${eur(missionTotal(m))}) ?`)) return;
    try {
      await deleteMission(m.id);
      setMissions((list) => list.filter((x) => x.id !== m.id));
    } catch (e) {
      setError(`Suppression impossible : ${frError(e)}`);
    }
  };

  const navBtn = 'h-10 w-10 inline-flex items-center justify-center border border-slate-300 rounded-sm hover:bg-slate-50';
  const toggle = (id) => setExpanded(expanded === id ? null : id);

  return (
    <section className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-lg font-headings font-bold text-[#0A192F]">Historique des missions</h2>
        <div className="flex items-center gap-2">
          <button type="button" aria-label="Mois précédent" onClick={() => onMonthChange(shiftMonth(month, -1))} className={navBtn}>
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span aria-live="polite" className="flex-1 sm:flex-none sm:min-w-[9rem] text-center text-sm font-semibold text-[#0A192F] capitalize">{monthLabel(month)}</span>
          <button type="button" aria-label="Mois suivant" onClick={() => onMonthChange(shiftMonth(month, 1))} className={navBtn}>
            <ChevronRight className="h-4 w-4" />
          </button>
          <button type="button" disabled={!missions.length} onClick={() => exportCsv(month, missions)}
            aria-label="Exporter le mois en CSV" title="Exporter le mois en CSV"
            className="inline-flex items-center gap-1.5 px-3 h-10 border border-slate-300 rounded-sm text-sm hover:bg-slate-50 disabled:opacity-50">
            <Download className="h-4 w-4" /> CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-50 border border-slate-200 rounded-sm p-3 sm:p-4">
          <p className="text-xs text-slate-500">Missions</p>
          <p className="text-xl sm:text-2xl font-bold text-[#0A192F]">{missions.length}</p>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-sm p-3 sm:p-4">
          <p className="text-xs text-slate-500">Heures facturées</p>
          <p className="text-xl sm:text-2xl font-bold text-[#0A192F]">{totals.hours} h</p>
          {totals.pages > 0 && <p className="text-xs text-slate-500">+ {plural(totals.pages, 'page')} traduite{totals.pages > 1 ? 's' : ''}</p>}
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-sm p-3 sm:p-4">
          <p className="text-xs text-slate-500">Frais de repas</p>
          <p className="text-xl sm:text-2xl font-bold text-[#0A192F] whitespace-nowrap">{eur(totals.meals)}</p>
          <p className="text-xs text-slate-500">inclus dans le CA</p>
        </div>
        <div className="bg-[#0A192F] text-white rounded-sm p-3 sm:p-4">
          <p className="text-xs text-slate-300">CA du mois</p>
          <p className="text-xl sm:text-2xl font-bold whitespace-nowrap">{eur(totals.amount + totals.meals)}</p>
          <p className="text-xs text-slate-300">dont prestations {eur(totals.amount)}</p>
          <p className="text-xs text-slate-300">dont repas {eur(totals.meals)}</p>
        </div>
      </div>

      {!loading && missions.length > 0 && (
        <TypeSubtotals totals={totals} className="border border-slate-200 rounded-sm p-3 text-[#0A192F]" />
      )}

      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

      {/* Mobile : cartes */}
      <div className="md:hidden border border-slate-200 rounded-sm divide-y divide-slate-200 overflow-hidden">
        {loading && <p role="status" className="py-6 text-center text-slate-500">Chargement…</p>}
        {!loading && !missions.length && <p className="py-6 text-center text-slate-500">Aucune mission ce mois-ci.</p>}
        {!loading && missions.map((m) => (
          <MissionCard key={m.id} mission={m} expanded={expanded === m.id}
            onToggle={() => toggle(m.id)} onDelete={() => onDelete(m)} />
        ))}
        {!loading && missions.length > 0 && (
          <MobileTotal label={monthLabel(month)} hours={totals.hours} pages={totals.pages} amount={totals.amount} meals={totals.meals} subtotals={totals} />
        )}
      </div>

      {/* Tablette / desktop : tableau */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm border border-slate-200 rounded-sm overflow-hidden">
          <thead className="bg-slate-50">
            <tr>
              <th className="w-8" />
              <th className="text-left px-3 py-2 font-semibold text-[#0A192F]">Date</th>
              <th className="text-left px-3 py-2 font-semibold text-[#0A192F]">Type / horaires</th>
              <th className="text-left px-3 py-2 font-semibold text-[#0A192F]">Client / lieu</th>
              <th className="text-right px-3 py-2 font-semibold text-[#0A192F]">Quantité</th>
              <th className="text-right px-3 py-2 font-semibold text-[#0A192F]">Prestations</th>
              <th className="text-right px-3 py-2 font-semibold text-[#0A192F]">Repas</th>
              <th className="text-right px-3 py-2 font-semibold text-[#0A192F]">CA</th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={9} className="px-4 py-6 text-center text-slate-500">Chargement…</td></tr>
            )}
            {!loading && !missions.length && (
              <tr><td colSpan={9} className="px-4 py-6 text-center text-slate-500">Aucune mission ce mois-ci.</td></tr>
            )}
            {!loading && missions.map((m) => (
              <Fragment key={m.id}>
                <tr className="border-t border-slate-200">
                  <td className="pl-2">
                    <button type="button" aria-label="Détail heure par heure" aria-expanded={expanded === m.id} onClick={() => toggle(m.id)}
                      className="h-9 w-9 inline-flex items-center justify-center text-slate-500 hover:text-[#0A192F]">
                      <ChevronDown className={`h-4 w-4 transition-transform ${expanded === m.id ? 'rotate-180' : ''}`} />
                    </button>
                  </td>
                  <td className="px-3 py-2 capitalize whitespace-nowrap">{formatDate(m.mission_date)}</td>
                  <td className="px-3 py-2 whitespace-nowrap"><TypeBadge mission={m} /> {missionWhen(m)}</td>
                  <td className="px-3 py-2 text-slate-600 break-words">{m.client || '—'}</td>
                  <td className="px-3 py-2 text-right whitespace-nowrap">{missionQty(m)}</td>
                  <td className="px-3 py-2 text-right whitespace-nowrap">{eur(m.amount)}</td>
                  <td className="px-3 py-2 text-right whitespace-nowrap text-slate-600">{meal(m) ? eur(meal(m)) : '—'}</td>
                  <td className="px-3 py-2 text-right font-medium whitespace-nowrap">{eur(missionTotal(m))}</td>
                  <td className="pr-2 text-right">
                    <button type="button" aria-label={`Supprimer la mission du ${isoToFr(m.mission_date)}`} title="Supprimer" onClick={() => onDelete(m)}
                      className="h-9 w-9 inline-flex items-center justify-center text-slate-500 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
                {expanded === m.id && (
                  <tr className="bg-slate-50/60">
                    <td />
                    <td colSpan={8} className="px-3 py-3"><MissionBreakdown mission={m} /></td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
          {!loading && missions.length > 0 && (
            <tfoot className="bg-slate-50 font-semibold text-[#0A192F]">
              <SubtotalRows totals={totals} labelSpan={3} trailing />
              <tr className="border-t-2 border-slate-300">
                <td />
                <td colSpan={3} className="px-3 py-2">CA du mois <span className="capitalize">({monthLabel(month)})</span></td>
                <td className="px-3 py-2 text-right whitespace-nowrap">{totals.hours} h{totals.pages > 0 && ` · ${totals.pages} p.`}</td>
                <td className="px-3 py-2 text-right whitespace-nowrap">{eur(totals.amount)}</td>
                <td className="px-3 py-2 text-right whitespace-nowrap">{eur(totals.meals)}</td>
                <td className="px-3 py-2 text-right whitespace-nowrap">{eur(totals.amount + totals.meals)}</td>
                <td />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </section>
  );
};
