import React, { useMemo, useState } from 'react';
import { Calculator } from 'lucide-react';
import { computeMissionCA } from '@/lib/caCalculator';

export const CACalculator = () => {
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const result = useMemo(
    () => computeMissionCA({ date, startTime, endTime }),
    [date, startTime, endTime]
  );

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-[#0A192F] text-white py-6 border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white text-[#0A192F] rounded-sm">
              <Calculator className="h-5 w-5" />
            </div>
            <h1 className="font-headings font-bold text-xl">Calculateur de CA de mission</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <p className="text-slate-700 leading-relaxed">
          Estimez le chiffre d'affaires généré par une mission d'interprétariat oral, sur la base du
          barème officiel des vacations (Ministère de la Justice, missions réalisées à compter du 22
          septembre 2023). Le calcul applique la règle selon laquelle toute heure commencée est due
          dans sa totalité, et tient compte des majorations de nuit, week-end et jours fériés.
        </p>

        {/* Formulaire */}
        <section className="bg-slate-50 border border-slate-200 rounded-sm p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="mission-date" className="text-sm font-semibold text-[#0A192F]">
                Date de la mission
              </label>
              <input
                id="mission-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="flex h-10 w-full rounded-sm border border-slate-300 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#1E3A8A]"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="mission-start" className="text-sm font-semibold text-[#0A192F]">
                Heure de début
              </label>
              <input
                id="mission-start"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="flex h-10 w-full rounded-sm border border-slate-300 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#1E3A8A]"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="mission-end" className="text-sm font-semibold text-[#0A192F]">
                Heure de fin
              </label>
              <input
                id="mission-end"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="flex h-10 w-full rounded-sm border border-slate-300 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#1E3A8A]"
              />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3">
            Si l'heure de fin est antérieure à l'heure de début, la mission est considérée comme se
            prolongeant après minuit.
          </p>
        </section>

        {/* Résultat */}
        {result && (
          <section className="space-y-6">
            <div className="bg-[#0A192F] text-white rounded-sm p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <p className="text-sm text-slate-300">CA estimé de la mission</p>
                <p className="text-3xl font-bold font-headings">
                  {result.total.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                </p>
              </div>
              <p className="text-sm text-slate-300">
                Durée retenue : {result.hoursCount} heure{result.hoursCount > 1 ? 's' : ''}{' '}
                (règle « heure commencée due en totalité »)
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-slate-200 rounded-sm overflow-hidden">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left px-4 py-2 font-semibold text-[#0A192F]">Tranche</th>
                    <th className="text-left px-4 py-2 font-semibold text-[#0A192F]">Heure</th>
                    <th className="text-left px-4 py-2 font-semibold text-[#0A192F]">Régime applicable</th>
                    <th className="text-right px-4 py-2 font-semibold text-[#0A192F]">Montant</th>
                  </tr>
                </thead>
                <tbody>
                  {result.breakdown.map((row) => (
                    <tr key={row.index} className="border-t border-slate-200">
                      <td className="px-4 py-2">{row.label}</td>
                      <td className="px-4 py-2 capitalize">{row.clockLabel}</td>
                      <td className="px-4 py-2 text-slate-600">{row.regimeLabel}</td>
                      <td className="px-4 py-2 text-right font-medium">
                        {row.rate.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Barème de référence */}
        <section>
          <h2 className="text-lg font-headings font-bold text-[#0A192F] mb-3">
            Barème officiel de référence
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-slate-200 rounded-sm overflow-hidden">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-4 py-2 font-semibold text-[#0A192F]">Régime</th>
                  <th className="text-right px-4 py-2 font-semibold text-[#0A192F]">1ère heure</th>
                  <th className="text-right px-4 py-2 font-semibold text-[#0A192F]">Heures suivantes</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-slate-200">
                  <td className="px-4 py-2">Lundi au vendredi, 7h à 22h</td>
                  <td className="px-4 py-2 text-right">65,00 €</td>
                  <td className="px-4 py-2 text-right">46,50 €</td>
                </tr>
                <tr className="border-t border-slate-200">
                  <td className="px-4 py-2">Lundi au vendredi, 22h à 7h</td>
                  <td className="px-4 py-2 text-right">76,80 €</td>
                  <td className="px-4 py-2 text-right">58,00 €</td>
                </tr>
                <tr className="border-t border-slate-200">
                  <td className="px-4 py-2">Samedi, dimanche, jours fériés, 7h à 22h</td>
                  <td className="px-4 py-2 text-right">76,80 €</td>
                  <td className="px-4 py-2 text-right">58,00 €</td>
                </tr>
                <tr className="border-t border-slate-200">
                  <td className="px-4 py-2">Samedi, dimanche, jours fériés, 22h à 7h</td>
                  <td className="px-4 py-2 text-right">88,50 €</td>
                  <td className="px-4 py-2 text-right">69,80 €</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-500 mt-3">
            Ce calculateur porte uniquement sur la rémunération de la vacation d'interprétariat oral et
            n'inclut pas les indemnités de déplacement, de repas ou de nuitée. Il s'agit d'une
            estimation indicative ; seul le mémoire de frais déposé sur Chorus Pro fait foi.
          </p>
        </section>

        <div className="pt-4">
          <a
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#0A192F] hover:bg-[#1E3A8A] text-white font-semibold rounded-sm transition-colors"
          >
            ← Retour à l'accueil
          </a>
        </div>
      </main>
    </div>
  );
};
