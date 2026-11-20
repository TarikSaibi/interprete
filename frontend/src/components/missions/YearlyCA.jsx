import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { listMissionsForYears } from '@/lib/missionsApi';
import { yearlyCA, pct } from '@/lib/yearly';
import { eur } from '@/lib/format';
import { frError } from '@/lib/errors';

// Couleurs des séries (validées daltonisme / contraste sur fond clair) : année N bleu, N-1 ambre
const COLOR_N = '#2563EB';
const COLOR_PREV = '#D97706';

// Axe Y compact : « 1,5 k€ »
const axisEur = (v) =>
  v >= 1000 ? `${(v / 1000).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} k€` : `${v} €`;

const varClass = (v) => (v === null ? 'text-slate-500' : v >= 0 ? 'text-emerald-700' : 'text-red-600');

export const YearlyCA = ({ userId, refreshToken, initialYear = new Date().getFullYear() }) => {
  const [year, setYear] = useState(initialYear);
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setMissions(await listMissionsForYears(userId, year - 1, year));
    } catch (e) {
      setError(`Chargement impossible : ${frError(e)}`);
    } finally {
      setLoading(false);
    }
  }, [userId, year]);

  useEffect(() => {
    load();
  }, [load, refreshToken]);

  const y = useMemo(() => yearlyCA(missions, year), [missions, year]);
  const navBtn = 'h-10 w-10 inline-flex items-center justify-center border border-slate-300 rounded-sm hover:bg-slate-50';
  const prevLabel = `CA ${year - 1}`;
  const curLabel = `CA ${year}`;

  return (
    <section className="space-y-4" aria-label="CA annuel">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-lg font-headings font-bold text-[#0A192F]">CA annuel</h2>
        <div className="flex items-center gap-2">
          <button type="button" aria-label="Année précédente" onClick={() => setYear(year - 1)} className={navBtn}>
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span aria-live="polite" className="flex-1 sm:flex-none sm:min-w-[5rem] text-center text-sm font-semibold text-[#0A192F]">{year}</span>
          <button type="button" aria-label="Année suivante" onClick={() => setYear(year + 1)} className={navBtn}>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-[#0A192F] text-white rounded-sm p-3 sm:p-4">
          <p className="text-xs text-slate-300">CA {year}</p>
          <p className="text-xl sm:text-2xl font-bold whitespace-nowrap" data-testid="year-total">{eur(y.total)}</p>
          <p className="text-xs text-slate-300">{y.count} mission{y.count > 1 ? 's' : ''}</p>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-sm p-3 sm:p-4">
          <p className="text-xs text-slate-500">CA {year - 1}</p>
          <p className="text-xl sm:text-2xl font-bold text-[#0A192F] whitespace-nowrap">{eur(y.prevTotal)}</p>
          <p className="text-xs text-slate-500">{y.prevCount} mission{y.prevCount > 1 ? 's' : ''}</p>
        </div>
        <div className="col-span-2 lg:col-span-1 bg-slate-50 border border-slate-200 rounded-sm p-3 sm:p-4">
          <p className="text-xs text-slate-500">Évolution {year} / {year - 1}</p>
          <p className={`text-xl sm:text-2xl font-bold whitespace-nowrap ${varClass(y.variation)}`} data-testid="year-variation">{pct(y.variation)}</p>
          <p className="text-xs text-slate-500">écart {eur(y.total - y.prevTotal)}</p>
        </div>
      </div>

      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      {loading && <p role="status" className="py-2 text-center text-sm text-slate-500">Chargement…</p>}

      {!loading && (
        <>
          {/* Mobile : liste des mois */}
          <ul className="md:hidden border border-slate-200 rounded-sm divide-y divide-slate-200" aria-label={`CA par mois ${year}`}>
            {y.months.map((r) => (
              <li key={r.month} className="p-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#0A192F] capitalize">{r.long}</p>
                  <p className="text-xs text-slate-500">{r.count} mission{r.count > 1 ? 's' : ''} · {prevLabel} : {eur(r.prev)}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-[#0A192F] whitespace-nowrap">{eur(r.ca)}</p>
                  <p className={`text-xs whitespace-nowrap ${varClass(r.variation)}`}>{pct(r.variation)}</p>
                </div>
              </li>
            ))}
            <li className="p-3 flex items-start justify-between gap-3 bg-slate-50">
              <div>
                <p className="font-semibold text-[#0A192F]">Total {year}</p>
                <p className="text-xs text-slate-500">{prevLabel} : {eur(y.prevTotal)}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-[#0A192F] whitespace-nowrap">{eur(y.total)}</p>
                <p className={`text-xs whitespace-nowrap ${varClass(y.variation)}`}>{pct(y.variation)}</p>
              </div>
            </li>
          </ul>

          {/* Tablette / desktop : graphique + tableau */}
          <div className="hidden md:block space-y-4">
            <div className="h-72 border border-slate-200 rounded-sm p-3" role="img"
              aria-label={`Graphique du CA mensuel ${year} comparé à ${year - 1} (détail dans le tableau ci-dessous)`}>
              {/* initialDimension : taille provisoire avant la première mesure du conteneur */}
              <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 720, height: 264 }}>
                <BarChart data={y.months} barGap={2} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="short" tickLine={false} axisLine={{ stroke: '#cbd5e1' }} tick={{ fontSize: 12, fill: '#475569' }} />
                  <YAxis tickFormatter={axisEur} tickLine={false} axisLine={false} width={64} tick={{ fontSize: 12, fill: '#475569' }} />
                  <Tooltip
                    cursor={{ fill: '#f1f5f9' }}
                    formatter={(v, name) => [eur(v), name]}
                    labelFormatter={(_l, p) => (p?.[0]?.payload ? `${p[0].payload.long}` : '')}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="ca" name={curLabel} fill={COLOR_N} radius={[4, 4, 0, 0]} maxBarSize={28} />
                  <Bar dataKey="prev" name={prevLabel} fill={COLOR_PREV} radius={[4, 4, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <table className="w-full text-sm border border-slate-200 rounded-sm overflow-hidden">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-3 py-2 font-semibold text-[#0A192F]">Mois</th>
                  <th className="text-right px-3 py-2 font-semibold text-[#0A192F]">Missions</th>
                  <th className="text-right px-3 py-2 font-semibold text-[#0A192F]">{curLabel}</th>
                  <th className="text-right px-3 py-2 font-semibold text-[#0A192F]">{prevLabel}</th>
                  <th className="text-right px-3 py-2 font-semibold text-[#0A192F]">Évolution</th>
                </tr>
              </thead>
              <tbody>
                {y.months.map((r) => (
                  <tr key={r.month} className="border-t border-slate-200">
                    <td className="px-3 py-2 capitalize">{r.long}</td>
                    <td className="px-3 py-2 text-right">{r.count}</td>
                    <td className="px-3 py-2 text-right font-medium whitespace-nowrap">{eur(r.ca)}</td>
                    <td className="px-3 py-2 text-right text-slate-600 whitespace-nowrap">{eur(r.prev)}</td>
                    <td className={`px-3 py-2 text-right whitespace-nowrap ${varClass(r.variation)}`}>{pct(r.variation)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 font-semibold text-[#0A192F]">
                <tr className="border-t-2 border-slate-300">
                  <td className="px-3 py-2">Total {year}</td>
                  <td className="px-3 py-2 text-right">{y.count}</td>
                  <td className="px-3 py-2 text-right whitespace-nowrap">{eur(y.total)}</td>
                  <td className="px-3 py-2 text-right whitespace-nowrap">{eur(y.prevTotal)}</td>
                  <td className={`px-3 py-2 text-right whitespace-nowrap ${varClass(y.variation)}`}>{pct(y.variation)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}
      <p className="text-xs text-slate-500">
        CA = prestations + frais de repas, d'après les montants enregistrés à la saisie de chaque mission.
      </p>
    </section>
  );
};
