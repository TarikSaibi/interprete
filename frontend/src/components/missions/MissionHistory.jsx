import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, Download, Trash2 } from 'lucide-react';
import { listMissionsForMonth, deleteMission, shiftMonth } from '@/lib/missionsApi';

const eur = (n) => `${Number(n).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
const hhmm = (t) => (t || '').slice(0, 5);
const formatDate = (iso) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' });
const isoToFr = (iso) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}`;
const meal = (m) => Number(m.meal_amount || 0);
const csvNum = (n) => Number(n).toFixed(2).replace('.', ',');
const monthLabel = (month) =>
  new Date(`${month}-01T00:00:00`).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

function exportCsv(month, missions) {
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const rows = [
    ['Date', 'Début', 'Fin', 'Heures facturées', 'Vacations (EUR)', 'Repas (EUR)', 'Total (EUR)', 'Client / lieu', 'Notes'],
    ...missions.map((m) => [
      isoToFr(m.mission_date), hhmm(m.start_time), hhmm(m.end_time), m.hours_count,
      csvNum(m.amount), csvNum(meal(m)), csvNum(Number(m.amount) + meal(m)), m.client, m.notes,
    ]),
  ];
  // BOM + ';' pour une ouverture correcte dans Excel FR
  const csv = '﻿' + rows.map((r) => r.map(esc).join(';')).join('\r\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  a.download = `missions-${month}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
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
      setMissions(await listMissionsForMonth(month));
    } catch (e) {
      setError(`Chargement impossible : ${e.message}`);
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => {
    load();
  }, [load, refreshToken]);

  const totals = useMemo(
    () => missions.reduce(
      (acc, m) => ({
        hours: acc.hours + m.hours_count,
        amount: acc.amount + Number(m.amount),
        meals: acc.meals + meal(m),
      }),
      { hours: 0, amount: 0, meals: 0 }
    ),
    [missions]
  );

  const onDelete = async (m) => {
    if (!window.confirm(`Supprimer la mission du ${formatDate(m.mission_date)} ?`)) return;
    try {
      await deleteMission(m.id);
      setMissions((list) => list.filter((x) => x.id !== m.id));
    } catch (e) {
      setError(`Suppression impossible : ${e.message}`);
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-headings font-bold text-[#0A192F]">Historique des missions</h2>
        <div className="flex items-center gap-2">
          <button type="button" aria-label="Mois précédent" onClick={() => onMonthChange(shiftMonth(month, -1))}
            className="p-2 border border-slate-300 rounded-sm hover:bg-slate-50"><ChevronLeft className="h-4 w-4" /></button>
          <span className="min-w-[9rem] text-center text-sm font-semibold text-[#0A192F] capitalize">{monthLabel(month)}</span>
          <button type="button" aria-label="Mois suivant" onClick={() => onMonthChange(shiftMonth(month, 1))}
            className="p-2 border border-slate-300 rounded-sm hover:bg-slate-50"><ChevronRight className="h-4 w-4" /></button>
          <button type="button" disabled={!missions.length} onClick={() => exportCsv(month, missions)}
            className="inline-flex items-center gap-1.5 px-3 h-9 border border-slate-300 rounded-sm text-sm hover:bg-slate-50 disabled:opacity-50">
            <Download className="h-4 w-4" /> CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-50 border border-slate-200 rounded-sm p-4">
          <p className="text-xs text-slate-500 capitalize">{monthLabel(month)}</p>
          <p className="text-2xl font-bold text-[#0A192F]">{missions.length} mission{missions.length > 1 ? 's' : ''}</p>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-sm p-4">
          <p className="text-xs text-slate-500">Heures facturées</p>
          <p className="text-2xl font-bold text-[#0A192F]">{totals.hours} h</p>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-sm p-4">
          <p className="text-xs text-slate-500">Frais de repas</p>
          <p className="text-2xl font-bold text-[#0A192F]">{eur(totals.meals)}</p>
        </div>
        <div className="bg-[#0A192F] text-white rounded-sm p-4">
          <p className="text-xs text-slate-300">Total du mois</p>
          <p className="text-2xl font-bold">{eur(totals.amount + totals.meals)}</p>
          <p className="text-xs text-slate-300">dont vacations {eur(totals.amount)}</p>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-slate-200 rounded-sm overflow-hidden">
          <thead className="bg-slate-50">
            <tr>
              <th className="w-8" />
              <th className="text-left px-4 py-2 font-semibold text-[#0A192F]">Date</th>
              <th className="text-left px-4 py-2 font-semibold text-[#0A192F]">Horaires</th>
              <th className="text-left px-4 py-2 font-semibold text-[#0A192F]">Client / lieu</th>
              <th className="text-right px-4 py-2 font-semibold text-[#0A192F]">Heures</th>
              <th className="text-right px-4 py-2 font-semibold text-[#0A192F]">Vacations</th>
              <th className="text-right px-4 py-2 font-semibold text-[#0A192F]">Repas</th>
              <th className="text-right px-4 py-2 font-semibold text-[#0A192F]">Total</th>
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
                    <button type="button" aria-label="Détail" onClick={() => setExpanded(expanded === m.id ? null : m.id)}
                      className="p-1 text-slate-500 hover:text-[#0A192F]">
                      <ChevronDown className={`h-4 w-4 transition-transform ${expanded === m.id ? 'rotate-180' : ''}`} />
                    </button>
                  </td>
                  <td className="px-4 py-2 capitalize whitespace-nowrap">{formatDate(m.mission_date)}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{hhmm(m.start_time)} → {hhmm(m.end_time)}</td>
                  <td className="px-4 py-2 text-slate-600">{m.client || '—'}</td>
                  <td className="px-4 py-2 text-right">{m.hours_count} h</td>
                  <td className="px-4 py-2 text-right whitespace-nowrap">{eur(m.amount)}</td>
                  <td className="px-4 py-2 text-right whitespace-nowrap text-slate-600">{meal(m) ? eur(meal(m)) : '—'}</td>
                  <td className="px-4 py-2 text-right font-medium whitespace-nowrap">{eur(Number(m.amount) + meal(m))}</td>
                  <td className="pr-2 text-right">
                    <button type="button" aria-label="Supprimer" onClick={() => onDelete(m)}
                      className="p-1 text-slate-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
                {expanded === m.id && (
                  <tr className="bg-slate-50/60">
                    <td />
                    <td colSpan={8} className="px-4 py-3">
                      <ul className="space-y-1">
                        {(m.breakdown || []).map((b, i) => (
                          <li key={i} className="flex justify-between gap-4 text-xs text-slate-600">
                            <span><span className="font-medium text-slate-800">{b.label}</span> · <span className="capitalize">{b.clockLabel}</span> · {b.regimeLabel}</span>
                            <span className="whitespace-nowrap">{eur(b.rate)}</span>
                          </li>
                        ))}
                      </ul>
                      {m.notes && <p className="mt-2 text-xs text-slate-500">Notes : {m.notes}</p>}
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
          {!loading && missions.length > 0 && (
            <tfoot className="bg-slate-50 font-semibold text-[#0A192F]">
              <tr className="border-t-2 border-slate-300">
                <td />
                <td colSpan={3} className="px-4 py-2">Total {monthLabel(month)}</td>
                <td className="px-4 py-2 text-right">{totals.hours} h</td>
                <td className="px-4 py-2 text-right whitespace-nowrap">{eur(totals.amount)}</td>
                <td className="px-4 py-2 text-right whitespace-nowrap">{eur(totals.meals)}</td>
                <td className="px-4 py-2 text-right whitespace-nowrap">{eur(totals.amount + totals.meals)}</td>
                <td />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </section>
  );
};
