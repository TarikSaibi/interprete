import React, { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calculator, LogOut, Pencil, Save, X } from 'lucide-react';
import {
  computeMissionCA, computePagesCA, MEAL_ALLOWANCE, TARIF_REGIMES, PAGE_TRANSLATION_RATE, PAGE_WORDS, MAX_PAGES,
} from '@/lib/caCalculator';
import { isSupabaseConfigured, signOutAndRedirect } from '@/lib/supabase';
import { createMission, currentMonth, listRecentClients, missionChangeKind, updateMission } from '@/lib/missionsApi';
import { useSession } from '@/hooks/useSession';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { LoginForm } from '@/components/missions/LoginForm';
import { MissionHistory } from '@/components/missions/MissionHistory';
import { ModeSwitch } from '@/components/missions/ModeSwitch';
import { ClientInput } from '@/components/missions/ClientInput';
import { rankClients } from '@/lib/clientSuggestions';
import { DateInputFr, DatePickerButton, TimeSelectFr, todayIso } from '@/components/missions/FrInputs';
import { eur, hhmm, isoToFr, meal, missionTotal, plural } from '@/lib/format';
import { frError } from '@/lib/errors';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const fieldClass =
  'flex h-11 sm:h-10 w-full rounded-sm border border-slate-300 bg-white px-3 py-1 text-base sm:text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#1E3A8A]';

const MODES = [
  { id: 'hourly', label: "Interprète (à l'heure)" },
  { id: 'pages', label: 'Traduction écrite (à la page)' },
];

// Vue annuelle (recharts) chargée à la demande : n'alourdit pas le bundle de la vitrine
const YearlyCA = lazy(() => import('@/components/missions/YearlyCA').then((m) => ({ default: m.YearlyCA })));

const toIso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export const CACalculator = () => {
  const [mode, setMode] = useState('hourly');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [pages, setPages] = useState('');
  const [client, setClient] = useState('');
  const [notes, setNotes] = useState('');
  const [withMeal, setWithMeal] = useState(false);
  const [month, setMonth] = useState(currentMonth());
  const [refreshToken, setRefreshToken] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);
  const [editing, setEditing] = useState(null); // mission en cours de modification
  const [clientSuggestions, setClientSuggestions] = useState([]);
  const formRef = useRef(null);
  const session = useSession();
  const userId = session?.user?.id;
  const isAdmin = useIsAdmin(session);
  useDocumentTitle('Calculateur de CA');

  const isPagesMode = mode === 'pages';
  const result = useMemo(
    () => (isPagesMode ? computePagesCA({ pages }) : computeMissionCA({ date, startTime, endTime })),
    [isPagesMode, pages, date, startTime, endTime]
  );
  const mealAmount = !isPagesMode && withMeal ? MEAL_ALLOWANCE : 0;
  const formInput = { type: mode, date, startTime, endTime, pages, client, notes, mealAmount };
  // Modification : 'meta' (client / notes seuls, montants conservés) ou 'recalc' (nouvelle saisie au barème courant)
  const changeKind = editing ? missionChangeKind(editing, formInput) : null;
  // Le calcul à la page ne dépend pas de la date, mais l'enregistrement oui
  const canSave = editing
    ? changeKind === 'meta' || (changeKind === 'recalc' && Boolean(result && date))
    : Boolean(result && date);

  // Suggestions de clients : clients déjà saisis par l'utilisateur
  useEffect(() => {
    if (!userId) return undefined;
    let alive = true;
    listRecentClients(userId)
      .then((rows) => alive && setClientSuggestions(rankClients(rows)))
      .catch(() => alive && setClientSuggestions([]));
    return () => {
      alive = false;
    };
  }, [userId, refreshToken]);

  const resetForm = () => {
    setEditing(null);
    setClient('');
    setNotes('');
    setWithMeal(false);
    setPages('');
  };

  const startEdit = (m) => {
    const pagesType = m.mission_type === 'pages';
    setEditing(m);
    setMode(pagesType ? 'pages' : 'hourly');
    setDate(m.mission_date);
    setStartTime(pagesType ? '' : hhmm(m.start_time));
    setEndTime(pagesType ? '' : hhmm(m.end_time));
    setPages(pagesType ? String(m.pages_count ?? '') : '');
    setClient(m.client || '');
    setNotes(m.notes || '');
    setWithMeal(meal(m) > 0);
    setSaveMessage(null);
    formRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
  };

  const cancelEdit = () => {
    resetForm();
    setSaveMessage(null);
  };
  const sameTimes = !isPagesMode && date && startTime && endTime && startTime === endTime;
  const pagesInvalid = isPagesMode && pages !== '' && !result;

  const onSave = async () => {
    if (editing && changeKind === 'recalc' && !window.confirm(
      `Le CA de cette mission sera recalculé avec le barème actuel : ${eur(missionTotal(editing))} (enregistré) → ${eur(result.total + mealAmount)} (nouveau). Continuer ?`
    )) return;
    setSaving(true);
    setSaveMessage(null);
    try {
      if (editing) {
        await updateMission(editing, formInput, result);
        setSaveMessage({ ok: true, text: changeKind === 'recalc' ? 'Mission modifiée, CA recalculé.' : 'Mission modifiée, CA enregistré conservé.' });
        resetForm();
      } else {
        await createMission(formInput, result);
        setSaveMessage({ ok: true, text: 'Mission enregistrée.' });
        setClient('');
        setNotes('');
        setWithMeal(false);
        if (isPagesMode) setPages('');
      }
      setMonth(date.slice(0, 7));
      setRefreshToken((n) => n + 1);
    } catch (e) {
      setSaveMessage({ ok: false, text: `Enregistrement impossible : ${frError(e)}` });
    } finally {
      setSaving(false);
    }
  };

  const missingHint = isPagesMode
    ? 'Renseigne la date et le nombre de pages.'
    : "Renseigne la date, l'heure de début et l'heure de fin.";

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-[#0A192F] text-white py-4 sm:py-6 border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white text-[#0A192F] rounded-sm" aria-hidden="true">
                <Calculator className="h-5 w-5" />
              </div>
              <h1 className="font-headings font-bold text-lg sm:text-xl">Calculateur de CA de mission</h1>
            </div>
            {session && (
              <div className="flex items-center gap-2 sm:gap-3 text-sm text-slate-300">
                <span className="hidden lg:inline">{session.user.email}</span>
                {isAdmin && <ModeSwitch mode="user" />}
                <button type="button" onClick={signOutAndRedirect} aria-label="Déconnexion"
                  className="inline-flex items-center gap-1.5 px-3 h-10 border border-slate-600 rounded-sm hover:bg-white/10">
                  <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Déconnexion</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 space-y-6 sm:space-y-8">
        <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
          {isPagesMode ? (
            <>
              Estimez le chiffre d'affaires d'une traduction écrite, sur la base du barème officiel (Ministère de la
              Justice, missions réalisées à compter du 22 septembre 2023) : {eur(PAGE_TRANSLATION_RATE)} par page de
              texte en français de {PAGE_WORDS} mots, sans majoration de nuit ou de week-end.
            </>
          ) : (
            <>
              Estimez le chiffre d'affaires généré par une mission d'interprétariat oral, sur la base du
              barème officiel des missions d'interprétariat (Ministère de la Justice, missions réalisées à compter du 22
              septembre 2023). Le calcul applique la règle selon laquelle toute heure commencée est due
              dans sa totalité, et tient compte des majorations de nuit, week-end et jours fériés.
            </>
          )}
        </p>

        {/* Type de mission */}
        <div role="radiogroup" aria-label="Type de mission"
          className="grid grid-cols-2 border border-slate-300 rounded-sm overflow-hidden text-sm">
          {MODES.map((m) => (
            <button key={m.id} type="button" role="radio" aria-checked={mode === m.id}
              onClick={() => { setMode(m.id); setSaveMessage(null); }}
              className={`min-h-[44px] px-2 sm:px-4 py-2 font-semibold leading-tight transition-colors ${
                mode === m.id ? 'bg-[#1E3A8A] text-white' : 'bg-white text-[#0A192F] hover:bg-slate-50'
              }`}>
              {m.label}
            </button>
          ))}
        </div>

        {/* Formulaire */}
        <section ref={formRef} aria-label="Saisie de la mission"
          className={`scroll-mt-4 border rounded-sm p-4 sm:p-6 ${editing ? 'bg-amber-50/40 border-amber-300' : 'bg-slate-50 border-slate-200'}`}>
          {editing && (
            <div className="mb-4 pb-4 border-b border-amber-200 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-[#0A192F] inline-flex items-center gap-2">
                <Pencil className="h-4 w-4" /> Modification de la mission du {isoToFr(editing.mission_date)}
              </p>
              <button type="button" onClick={cancelEdit}
                className="inline-flex items-center gap-1.5 px-3 h-10 border border-slate-300 bg-white rounded-sm text-sm hover:bg-slate-50">
                <X className="h-4 w-4" /> Annuler la modification
              </button>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
              <label htmlFor="mission-date" className="text-sm font-semibold text-[#0A192F]">
                {isPagesMode ? 'Date de remise' : 'Date de la mission'}
              </label>
              <div className="flex gap-2">
                <DateInputFr id="mission-date" value={date} onChange={setDate} className={fieldClass} aria-describedby="mission-format-hint" />
                <DatePickerButton value={date} onChange={setDate} />
                <button type="button" onClick={() => setDate(todayIso())} aria-label="Date du jour" title="Date du jour"
                  className="px-3 min-w-[44px] text-sm border border-slate-300 rounded-sm bg-white hover:bg-slate-100 whitespace-nowrap">
                  Auj.
                </button>
              </div>
            </div>
            {isPagesMode ? (
              <div className="space-y-1.5">
                <label htmlFor="mission-pages" className="text-sm font-semibold text-[#0A192F]">
                  Nombre de pages
                </label>
                <input id="mission-pages" type="text" inputMode="numeric" autoComplete="off" placeholder="Ex. 12"
                  value={pages} maxLength={4}
                  onChange={(e) => setPages(e.target.value.replace(/\D/g, ''))}
                  aria-invalid={pagesInvalid} aria-describedby="mission-pages-hint"
                  className={`${fieldClass} ${pagesInvalid ? 'border-red-500' : ''}`} />
                <p id="mission-pages-hint" className={`text-xs ${pagesInvalid ? 'text-red-600' : 'text-slate-500'}`}>
                  Pages de {PAGE_WORDS} mots, nombre entier de 1 à {MAX_PAGES}.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-1.5">
                  <label htmlFor="mission-start" className="text-sm font-semibold text-[#0A192F]">
                    Heure de début
                  </label>
                  <TimeSelectFr id="mission-start" label="Heure de début" value={startTime} onChange={setStartTime} />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="mission-end" className="text-sm font-semibold text-[#0A192F]">
                    Heure de fin
                  </label>
                  <TimeSelectFr id="mission-end" label="Heure de fin" value={endTime} onChange={setEndTime} />
                </div>
              </>
            )}
          </div>
          {session && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div className="space-y-1.5">
                <label htmlFor="mission-client" className="text-sm font-semibold text-[#0A192F]">
                  Client / lieu (optionnel)
                </label>
                <ClientInput id="mission-client" value={client} maxLength={200} suggestions={clientSuggestions}
                  placeholder={isPagesMode ? 'Ex. Tribunal judiciaire de Paris' : 'Ex. Commissariat Paris 18e'}
                  onChange={setClient} className={fieldClass} />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="mission-notes" className="text-sm font-semibold text-[#0A192F]">
                  Notes (optionnel)
                </label>
                <input id="mission-notes" type="text" value={notes} maxLength={2000} placeholder="N° de procédure, langue…"
                  onChange={(e) => setNotes(e.target.value)} className={fieldClass} />
              </div>
            </div>
          )}
          {!isPagesMode && (
            <label className="mt-4 flex items-center gap-3 py-1 text-sm text-[#0A192F] cursor-pointer select-none">
              <input type="checkbox" checked={withMeal} onChange={(e) => setWithMeal(e.target.checked)}
                className="h-5 w-5 accent-[#1E3A8A]" />
              Ajouter les frais de repas ({eur(MEAL_ALLOWANCE)})
            </label>
          )}
          <p id="mission-format-hint" className="text-xs text-slate-500 mt-3">
            {isPagesMode
              ? 'Format : date en jj/mm/aaaa (saisie au clavier ou via le calendrier).'
              : "Format : date en jj/mm/aaaa (clavier ou calendrier), heures sur 24 h. Si l'heure de fin est antérieure à l'heure de début, la mission se termine le lendemain."}
          </p>
          {sameTimes && (
            <p role="alert" className="text-sm text-red-600 mt-2">
              L'heure de fin doit être différente de l'heure de début.
            </p>
          )}
          {editing && changeKind && (
            <div role="status" data-testid="edit-notice"
              className={`mt-4 text-sm rounded-sm border p-3 ${changeKind === 'recalc' ? 'border-amber-400 bg-amber-50 text-amber-900' : 'border-slate-200 bg-white text-slate-700'}`}>
              {changeKind === 'none' && 'Aucune modification pour le moment.'}
              {changeKind === 'meta' && (
                <>Seuls le client et/ou les notes changent : le CA enregistré ({eur(missionTotal(editing))}) et son détail sont conservés tels quels.</>
              )}
              {changeKind === 'recalc' && (
                <>
                  <strong>Date, horaires, type, nombre de pages ou repas modifiés :</strong> la mission sera enregistrée comme
                  une nouvelle saisie et son CA recalculé avec le barème actuel
                  {result ? <> : {eur(missionTotal(editing))} (enregistré) → <strong>{eur(result.total + mealAmount)}</strong> (nouveau).</> : '.'}
                </>
              )}
            </div>
          )}
          {session && (
            <div className="mt-5 pt-5 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center gap-3">
              <button type="button" onClick={onSave} disabled={saving || !canSave}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#1E3A8A] hover:bg-[#0A192F] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-sm transition-colors">
                <Save className="h-4 w-4" /> {saving ? 'Enregistrement…' : editing ? 'Enregistrer les modifications' : 'Ajouter la mission'}
              </button>
              {!canSave && !saveMessage && (!editing || changeKind === 'recalc') && <span className="text-sm text-slate-500">{missingHint}</span>}
              {saveMessage && (
                <span role={saveMessage.ok ? 'status' : 'alert'} className={`text-sm ${saveMessage.ok ? 'text-emerald-700' : 'text-red-600'}`}>
                  {saveMessage.text}
                </span>
              )}
            </div>
          )}
        </section>

        {/* Résultat */}
        {result && (
          <section className="space-y-6" aria-live="polite" aria-label="Résultat du calcul">
            <div className="bg-[#0A192F] text-white rounded-sm p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <p className="text-sm text-slate-300">CA estimé de la mission</p>
                <p className="text-2xl sm:text-3xl font-bold font-headings">{eur(result.total + mealAmount)}</p>
                {mealAmount > 0 && (
                  <p className="text-sm text-slate-300">
                    dont {isPagesMode ? 'traduction' : 'interprétariat'} {eur(result.total)} · dont repas {eur(mealAmount)}
                  </p>
                )}
              </div>
              {isPagesMode ? (
                <p className="text-sm text-slate-300">
                  {plural(result.pagesCount, 'page')} × {eur(PAGE_TRANSLATION_RATE)}
                </p>
              ) : (
                <div className="text-sm text-slate-300 sm:text-right space-y-1">
                  <p>
                    Durée retenue : {plural(result.hoursCount, 'heure')}{' '}
                    (règle « heure commencée due en totalité »)
                  </p>
                  {result.endsNextDay && (
                    <p className="font-semibold text-amber-300">
                      Se termine le lendemain, {isoToFr(toIso(result.end))} à {endTime.replace(':', 'h')}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Mobile : liste */}
            <ul className="sm:hidden border border-slate-200 rounded-sm divide-y divide-slate-200">
              {result.breakdown.map((row) => (
                <li key={row.index} className="p-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#0A192F]">
                      {row.label} <span className={`font-normal text-slate-500 ${isPagesMode ? '' : 'capitalize'}`}>· {row.clockLabel}</span>
                    </p>
                    <p className="text-xs text-slate-500">{row.regimeLabel}</p>
                  </div>
                  <p className="text-sm font-semibold text-[#0A192F] whitespace-nowrap">{eur(row.rate)}</p>
                </li>
              ))}
            </ul>
            {/* Tablette / desktop : tableau */}
            <div className="hidden sm:block">
              <table className="w-full text-sm border border-slate-200 rounded-sm overflow-hidden">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left px-4 py-2 font-semibold text-[#0A192F]">{isPagesMode ? 'Prestation' : 'Tranche'}</th>
                    <th className="text-left px-4 py-2 font-semibold text-[#0A192F]">{isPagesMode ? 'Quantité' : 'Heure'}</th>
                    <th className="text-left px-4 py-2 font-semibold text-[#0A192F]">{isPagesMode ? 'Base' : 'Régime applicable'}</th>
                    <th className="text-right px-4 py-2 font-semibold text-[#0A192F]">Montant</th>
                  </tr>
                </thead>
                <tbody>
                  {result.breakdown.map((row) => (
                    <tr key={row.index} className="border-t border-slate-200">
                      <td className="px-4 py-2">{row.label}</td>
                      <td className={`px-4 py-2 whitespace-nowrap ${isPagesMode ? '' : 'capitalize'}`}>{row.clockLabel}</td>
                      <td className="px-4 py-2 text-slate-600">{row.regimeLabel}</td>
                      <td className="px-4 py-2 text-right font-medium whitespace-nowrap">{eur(row.rate)}</td>
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
          <>
            <MissionHistory month={month} onMonthChange={setMonth} refreshToken={refreshToken}
              onEdit={startEdit} editingId={editing?.id}
              onDeleted={(m) => editing?.id === m.id && cancelEdit()} />
            <Suspense fallback={<p role="status" className="text-sm text-slate-500">Chargement du CA annuel…</p>}>
              <YearlyCA userId={userId} refreshToken={refreshToken} />
            </Suspense>
          </>
        )}

        {/* Barème de référence */}
        <section>
          <h2 className="text-lg font-headings font-bold text-[#0A192F] mb-3">
            Barème officiel de référence
          </h2>
          {/* Mobile : liste */}
          <ul className="sm:hidden border border-slate-200 rounded-sm divide-y divide-slate-200">
            {TARIF_REGIMES.map((r) => (
              <li key={r.id} className="p-3">
                <p className="text-sm font-medium text-[#0A192F]">{r.label}</p>
                <div className="mt-1.5 grid grid-cols-2 gap-2 text-sm">
                  <p className="text-slate-500">1ère heure <span className="block font-semibold text-[#0A192F]">{eur(r.firstHour)}</span></p>
                  <p className="text-slate-500 text-right">Heures suivantes <span className="block font-semibold text-[#0A192F]">{eur(r.nextHours)}</span></p>
                </div>
              </li>
            ))}
          </ul>
          {/* Tablette / desktop : tableau */}
          <div className="hidden sm:block">
            <table className="w-full text-sm border border-slate-200 rounded-sm overflow-hidden">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-4 py-2 font-semibold text-[#0A192F]">Régime</th>
                  <th className="text-right px-4 py-2 font-semibold text-[#0A192F]">1ère heure</th>
                  <th className="text-right px-4 py-2 font-semibold text-[#0A192F]">Heures suivantes</th>
                </tr>
              </thead>
              <tbody>
                {TARIF_REGIMES.map((r) => (
                  <tr key={r.id} className="border-t border-slate-200">
                    <td className="px-4 py-2">{r.label}</td>
                    <td className="px-4 py-2 text-right">{eur(r.firstHour)}</td>
                    <td className="px-4 py-2 text-right">{eur(r.nextHours)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm text-[#0A192F] border border-slate-200 rounded-sm p-3 flex flex-wrap justify-between gap-2">
            <span>Traduction écrite (par page de {PAGE_WORDS} mots en français)</span>
            <span className="font-semibold">{eur(PAGE_TRANSLATION_RATE)}</span>
          </p>
          <p className="text-xs text-slate-500 mt-3">
            Ce calculateur porte uniquement sur la rémunération de la mission d'interprétariat ou de traduction et
            n'inclut pas les indemnités de déplacement ou de nuitée ; les frais de repas peuvent être ajoutés forfaitairement. Il s'agit d'une
            estimation indicative ; seul le mémoire de frais déposé sur Chorus Pro fait foi.
          </p>
        </section>

        <div className="pt-4">
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#0A192F] hover:bg-[#1E3A8A] text-white font-semibold rounded-sm transition-colors"
          >
            ← Retour à l'accueil
          </Link>
        </div>
      </main>
    </div>
  );
};
