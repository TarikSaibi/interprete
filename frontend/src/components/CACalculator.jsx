import React, { useMemo, useState } from 'react';
import { Calculator, LogOut, Save } from 'lucide-react';
import { computeMissionCA, MEAL_ALLOWANCE } from '@/lib/caCalculator';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { createMission, currentMonth } from '@/lib/missionsApi';
import { useSession } from '@/hooks/useSession';
import { LoginForm } from '@/components/missions/LoginForm';
import { MissionHistory } from '@/components/missions/MissionHistory';
import { DateInputFr, TimeInputFr, todayIso } from '@/components/missions/FrInputs';

const eur = (n) => `${n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;

const fieldClass =
  'flex h-10 w-full rounded-sm border border-slate-300 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#1E3A8A]';

export const CACalculator = () => {
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [client, setClient] = useState('');
  const [notes, setNotes] = useState('');
  const [withMeal, setWithMeal] = useState(false);
  const [month, setMonth] = useState(currentMonth());
  const [refreshToken, setRefreshToken] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);
  const session = useSession();

  const result = useMemo(
    () => computeMissionCA({ date, startTime, endTime }),
    [date, startTime, endTime]
  );

  const mealAmount = withMeal ? MEAL_ALLOWANCE : 0;

  const onSave = async () => {
    setSaving(true);
    setSaveMessage(null);
    try {
      await createMission({ date, startTime, endTime, client, notes, mealAmount }, result);
      setSaveMessage({ ok: true, text: 'Mission enregistrée.' });
      setClient('');
      setNotes('');
      setWithMeal(false);
      setMonth(date.slice(0, 7));
      setRefreshToken((n) => n + 1);
    } catch (e) {
      setSaveMessage({ ok: false, text: `Erreur : ${e.message}` });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-[#0A192F] text-white py-6 border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white text-[#0A192F] rounded-sm">
                <Calculator className="h-5 w-5" />
              </div>
              <h1 className="font-headings font-bold text-xl">Calculateur de CA de mission</h1>
            </div>
            {session && (
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <span className="hidden sm:inline">{session.user.email}</span>
                <button type="button" onClick={() => supabase.auth.signOut()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-600 rounded-sm hover:bg-white/10">
                  <LogOut className="h-4 w-4" /> Déconnexion
                </button>
              </div>
            )}
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
              <div className="flex gap-2">
                <DateInputFr id="mission-date" value={date} onChange={setDate} className={fieldClass} />
                <button type="button" onClick={() => setDate(todayIso())}
                  className="px-2 text-xs border border-slate-300 rounded-sm bg-white hover:bg-slate-100 whitespace-nowrap">
                  Auj.
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="mission-start" className="text-sm font-semibold text-[#0A192F]">
                Heure de début
              </label>
              <TimeInputFr id="mission-start" value={startTime} onChange={setStartTime} className={fieldClass} />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="mission-end" className="text-sm font-semibold text-[#0A192F]">
                Heure de fin
              </label>
              <TimeInputFr id="mission-end" value={endTime} onChange={setEndTime} className={fieldClass} />
            </div>
          </div>
          {session && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div className="space-y-1.5">
                <label htmlFor="mission-client" className="text-sm font-semibold text-[#0A192F]">
                  Client / lieu (optionnel)
                </label>
                <input id="mission-client" type="text" value={client} placeholder="Ex. Commissariat Paris 18e"
                  onChange={(e) => setClient(e.target.value)} className={fieldClass} />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="mission-notes" className="text-sm font-semibold text-[#0A192F]">
                  Notes (optionnel)
                </label>
                <input id="mission-notes" type="text" value={notes} placeholder="N° de procédure, langue…"
                  onChange={(e) => setNotes(e.target.value)} className={fieldClass} />
              </div>
            </div>
          )}
          <label className="mt-4 flex items-center gap-2 text-sm text-[#0A192F] cursor-pointer select-none">
            <input type="checkbox" checked={withMeal} onChange={(e) => setWithMeal(e.target.checked)}
              className="h-4 w-4 accent-[#1E3A8A]" />
            Ajouter les frais de repas ({eur(MEAL_ALLOWANCE)})
          </label>
          <p className="text-xs text-slate-500 mt-3">
            Format : date en jj/mm/aaaa, heures en 24 h (ex. 21:30). Si l'heure de fin est antérieure à l'heure de début, la mission est considérée comme se
            prolongeant après minuit.
          </p>
        </section>

        {/* Résultat */}
        {result && (
          <section className="space-y-6">
            <div className="bg-[#0A192F] text-white rounded-sm p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <p className="text-sm text-slate-300">
                  {mealAmount ? 'Total de la mission (vacations + repas)' : 'CA estimé de la mission'}
                </p>
                <p className="text-3xl font-bold font-headings">{eur(result.total + mealAmount)}</p>
                {mealAmount > 0 && (
                  <p className="text-sm text-slate-300">
                    Vacations {eur(result.total)} + repas {eur(mealAmount)}
                  </p>
                )}
              </div>
              <p className="text-sm text-slate-300">
                Durée retenue : {result.hoursCount} heure{result.hoursCount > 1 ? 's' : ''}{' '}
                (règle « heure commencée due en totalité »)
              </p>
            </div>

            {session && (
              <div className="flex flex-wrap items-center gap-3">
                <button type="button" onClick={onSave} disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#1E3A8A] hover:bg-[#0A192F] disabled:opacity-60 text-white font-semibold rounded-sm transition-colors">
                  <Save className="h-4 w-4" /> {saving ? 'Enregistrement…' : 'Enregistrer la mission'}
                </button>
                {saveMessage && (
                  <span className={`text-sm ${saveMessage.ok ? 'text-emerald-700' : 'text-red-600'}`}>
                    {saveMessage.text}
                  </span>
                )}
              </div>
            )}

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
                        {eur(row.rate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Historique (Supabase) */}
        {isSupabaseConfigured && session === null && <LoginForm />}
        {session && (
          <MissionHistory month={month} onMonthChange={setMonth} refreshToken={refreshToken} />
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
            n'inclut pas les indemnités de déplacement ou de nuitée ; les frais de repas peuvent être ajoutés forfaitairement. Il s'agit d'une
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
