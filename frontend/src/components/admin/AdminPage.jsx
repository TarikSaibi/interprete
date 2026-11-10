import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, Download, LogOut, Send, ShieldCheck, UserPlus, Users } from 'lucide-react';
import { isSupabaseConfigured, signOutAndRedirect } from '@/lib/supabase';
import { adminListMissionsForMonth, currentMonth, shiftMonth, inviteUser } from '@/lib/missionsApi';
import { eur, hhmm, formatDate, isoToFr, monthLabel, meal, missionTotal, csvNum, downloadCsv } from '@/lib/format';
import { useSession } from '@/hooks/useSession';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { LoginForm } from '@/components/missions/LoginForm';
import { MissionCard, MissionBreakdown, MobileTotal } from '@/components/missions/MissionCards';
import { ModeSwitch } from '@/components/missions/ModeSwitch';

const th = 'px-3 py-2 font-semibold text-[#0A192F]';
const navBtn = 'h-10 w-10 shrink-0 inline-flex items-center justify-center border border-slate-300 rounded-sm hover:bg-slate-50';

function summarize(missions) {
  const byUser = new Map();
  for (const m of missions) {
    const u = byUser.get(m.user_id) || {
      userId: m.user_id, email: m.user_email, count: 0, hours: 0, amount: 0, meals: 0,
    };
    u.count += 1;
    u.hours += m.hours_count;
    u.amount += Number(m.amount);
    u.meals += meal(m);
    byUser.set(m.user_id, u);
  }
  const users = [...byUser.values()].sort((a, b) => a.email.localeCompare(b.email));
  const total = users.reduce(
    (t, u) => ({ count: t.count + u.count, hours: t.hours + u.hours, amount: t.amount + u.amount, meals: t.meals + u.meals }),
    { count: 0, hours: 0, amount: 0, meals: 0 }
  );
  return { users, total };
}

function exportCsv(month, missions) {
  downloadCsv(`missions-tous-utilisateurs-${month}.csv`, [
    ['Utilisateur', 'Date', 'Début', 'Fin', 'Heures facturées', 'CA (EUR)', 'Repas (EUR)', 'Total (EUR)', 'Client / lieu', 'Notes'],
    ...missions.map((m) => [
      m.user_email, isoToFr(m.mission_date), hhmm(m.start_time), hhmm(m.end_time), m.hours_count,
      csvNum(m.amount), csvNum(meal(m)), csvNum(missionTotal(m)), m.client, m.notes,
    ]),
  ]);
}

const Shell = ({ session, isAdmin, children }) => (
  <div className="min-h-screen bg-white">
    <header className="bg-[#0A192F] text-white py-4 sm:py-6 border-b border-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white text-[#0A192F] rounded-sm"><ShieldCheck className="h-5 w-5" /></div>
          <h1 className="font-headings font-bold text-lg sm:text-xl">Administration des missions</h1>
        </div>
        {session && (
          <div className="flex items-center gap-3 text-sm text-slate-300">
            <span className="hidden lg:inline">{session.user.email}</span>
            {isAdmin && <ModeSwitch mode="admin" />}
            <button type="button" onClick={signOutAndRedirect} aria-label="Déconnexion"
              className="inline-flex items-center gap-1.5 px-3 h-10 border border-slate-600 rounded-sm hover:bg-white/10">
              <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </div>
        )}
      </div>
    </header>
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8">
      {children}
      <div className="pt-2 flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <a href="/calculateur-ca" className="text-[#1E3A8A] hover:underline">← Calculateur</a>
        <a href="/" className="text-[#1E3A8A] hover:underline">Accueil</a>
      </div>
    </main>
  </div>
);

export const AdminPage = () => {
  const session = useSession();
  const isAdmin = useIsAdmin(session);

  if (!isSupabaseConfigured) {
    return <Shell session={null}><p className="text-red-600">Supabase n'est pas configuré.</p></Shell>;
  }
  if (session === undefined || (session && isAdmin === undefined)) {
    return <Shell session={session}><p className="text-slate-500">Chargement…</p></Shell>;
  }
  if (!session) {
    return <Shell session={null}><LoginForm /></Shell>;
  }
  if (!isAdmin) {
    return (
      <Shell session={session}>
        <p className="text-slate-700">Accès refusé : ce compte n'a pas les droits administrateur.</p>
      </Shell>
    );
  }
  return <Shell session={session} isAdmin><AdminDashboard /></Shell>;
};

const InviteUserForm = () => {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setMessage(null);
    try {
      const { email: sent } = await inviteUser(email);
      setMessage({ ok: true, text: `Invitation envoyée à ${sent}.` });
      setEmail('');
    } catch (err) {
      setMessage({ ok: false, text: err.message });
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="bg-slate-50 border border-slate-200 rounded-sm p-4 sm:p-5 space-y-3">
      <h2 className="flex items-center gap-2 text-lg font-headings font-bold text-[#0A192F]">
        <UserPlus className="h-5 w-5" /> Inviter un utilisateur
      </h2>
      <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-3">
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="email@exemple.fr" aria-label="Email à inviter" autoComplete="off"
          className="h-11 sm:h-10 w-full sm:flex-1 rounded-sm border border-slate-300 bg-white px-3 text-base sm:text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#1E3A8A]" />
        <button type="submit" disabled={sending}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 h-11 sm:h-10 bg-[#0A192F] hover:bg-[#1E3A8A] disabled:opacity-60 text-white font-semibold rounded-sm transition-colors">
          <Send className="h-4 w-4" /> {sending ? 'Envoi…' : "Envoyer l'invitation"}
        </button>
      </form>
      {message && <p className={`text-sm ${message.ok ? 'text-emerald-700' : 'text-red-600'}`}>{message.text}</p>}
      <p className="text-xs text-slate-500">
        La personne reçoit un email pour choisir son mot de passe, puis accède à son propre historique de missions.
      </p>
    </section>
  );
};

const AdminDashboard = () => {
  const [month, setMonth] = useState(currentMonth());
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userFilter, setUserFilter] = useState('all');
  const [expanded, setExpanded] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setMissions(await adminListMissionsForMonth(month));
    } catch (e) {
      setError(`Chargement impossible : ${e.message}`);
      setMissions([]);
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setUserFilter('all');
    setExpanded(null);
  }, [month]);

  const { users, total } = useMemo(() => summarize(missions), [missions]);
  const visible = useMemo(
    () => (userFilter === 'all' ? missions : missions.filter((m) => m.user_id === userFilter)),
    [missions, userFilter]
  );
  const visibleTotal = useMemo(() => summarize(visible).total, [visible]);

  return (
    <>
      <InviteUserForm />

      {/* Navigation mois + export */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <button type="button" aria-label="Mois précédent" onClick={() => setMonth(shiftMonth(month, -1))} className={navBtn}>
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="flex-1 sm:flex-none sm:min-w-[9rem] text-center text-sm font-semibold text-[#0A192F] capitalize">{monthLabel(month)}</span>
          <button type="button" aria-label="Mois suivant" onClick={() => setMonth(shiftMonth(month, 1))} className={navBtn}>
            <ChevronRight className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => setMonth(currentMonth())}
            className="px-3 h-10 border border-slate-300 rounded-sm text-sm hover:bg-slate-50 whitespace-nowrap">Mois en cours</button>
        </div>
        <button type="button" disabled={!visible.length} onClick={() => exportCsv(month, visible)}
          className="inline-flex items-center justify-center gap-1.5 px-3 h-10 border border-slate-300 rounded-sm text-sm hover:bg-slate-50 disabled:opacity-50">
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      {/* Indicateurs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <Stat label="Utilisateurs actifs" value={users.length} />
        <Stat label="Missions" value={total.count} />
        <Stat label="Heures facturées" value={`${total.hours} h`} />
        <Stat label="Frais de repas" value={eur(total.meals)} />
        <Stat label="Total du mois" value={eur(total.amount + total.meals)} sub={`dont CA ${eur(total.amount)}`} dark
          className="col-span-2 sm:col-span-1" />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Récapitulatif par utilisateur */}
      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-lg font-headings font-bold text-[#0A192F]">
          <Users className="h-5 w-5" /> Récapitulatif par utilisateur
        </h2>
        <div className="md:hidden space-y-2">
          {loading && <p className="py-4 text-center text-slate-500">Chargement…</p>}
          {!loading && !users.length && <p className="py-4 text-center text-slate-500">Aucune mission ce mois-ci.</p>}
          {!loading && users.map((u) => (
            <button key={u.userId} type="button"
              onClick={() => setUserFilter(userFilter === u.userId ? 'all' : u.userId)}
              className={`w-full text-left border rounded-sm p-3 flex items-start justify-between gap-3 ${userFilter === u.userId ? 'border-[#1E3A8A] bg-blue-50' : 'border-slate-200 bg-white'}`}>
              <span className="min-w-0">
                <span className="block font-medium text-[#0A192F] truncate">{u.email}</span>
                <span className="block text-sm text-slate-600">{u.count} mission{u.count > 1 ? 's' : ''} · {u.hours} h</span>
              </span>
              <span className="text-right shrink-0">
                <span className="block font-bold text-[#0A192F] whitespace-nowrap">{eur(u.amount + u.meals)}</span>
                <span className="block text-xs text-slate-500 whitespace-nowrap">CA {eur(u.amount)} · repas {eur(u.meals)}</span>
              </span>
            </button>
          ))}
          {!loading && users.length > 0 && (
            <MobileTotal label="Total" hours={total.hours} amount={total.amount} meals={total.meals} />
          )}
        </div>
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm border border-slate-200 rounded-sm overflow-hidden">
            <thead className="bg-slate-50">
              <tr>
                <th className={`${th} text-left`}>Utilisateur</th>
                <th className={`${th} text-right`}>Missions</th>
                <th className={`${th} text-right`}>Heures</th>
                <th className={`${th} text-right`}>CA</th>
                <th className={`${th} text-right`}>Repas</th>
                <th className={`${th} text-right`}>Total</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-500">Chargement…</td></tr>}
              {!loading && !users.length && (
                <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-500">Aucune mission ce mois-ci.</td></tr>
              )}
              {!loading && users.map((u) => (
                <tr key={u.userId}
                  onClick={() => setUserFilter(userFilter === u.userId ? 'all' : u.userId)}
                  className={`border-t border-slate-200 cursor-pointer hover:bg-slate-50 ${userFilter === u.userId ? 'bg-blue-50' : ''}`}>
                  <td className="px-4 py-2">{u.email}</td>
                  <td className="px-4 py-2 text-right">{u.count}</td>
                  <td className="px-4 py-2 text-right">{u.hours} h</td>
                  <td className="px-4 py-2 text-right whitespace-nowrap">{eur(u.amount)}</td>
                  <td className="px-4 py-2 text-right whitespace-nowrap">{eur(u.meals)}</td>
                  <td className="px-4 py-2 text-right font-medium whitespace-nowrap">{eur(u.amount + u.meals)}</td>
                </tr>
              ))}
            </tbody>
            {!loading && users.length > 0 && (
              <tfoot className="bg-slate-50 font-semibold text-[#0A192F]">
                <tr className="border-t-2 border-slate-300">
                  <td className="px-4 py-2">Total</td>
                  <td className="px-4 py-2 text-right">{total.count}</td>
                  <td className="px-4 py-2 text-right">{total.hours} h</td>
                  <td className="px-4 py-2 text-right whitespace-nowrap">{eur(total.amount)}</td>
                  <td className="px-4 py-2 text-right whitespace-nowrap">{eur(total.meals)}</td>
                  <td className="px-4 py-2 text-right whitespace-nowrap">{eur(total.amount + total.meals)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
        <p className="text-xs text-slate-500">Clique (ou touche) un utilisateur pour filtrer le détail ci-dessous.</p>
      </section>

      {/* Détail des missions */}
      <section className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-lg font-headings font-bold text-[#0A192F]">Détail des missions</h2>
          <select value={userFilter} onChange={(e) => setUserFilter(e.target.value)}
            className="h-11 sm:h-10 w-full sm:w-auto rounded-sm border border-slate-300 bg-white px-2 text-base sm:text-sm" aria-label="Filtrer par utilisateur">
            <option value="all">Tous les utilisateurs</option>
            {users.map((u) => <option key={u.userId} value={u.userId}>{u.email}</option>)}
          </select>
        </div>
        <div className="md:hidden space-y-3">
          {!loading && !visible.length && <p className="py-4 text-center text-slate-500">Aucune mission.</p>}
          {!loading && visible.map((m) => (
            <MissionCard key={m.id} mission={m} showUser expanded={expanded === m.id}
              onToggle={() => setExpanded(expanded === m.id ? null : m.id)} />
          ))}
          {!loading && visible.length > 0 && (
            <MobileTotal
              label={userFilter === 'all' ? 'Total tous utilisateurs' : `Total ${users.find((u) => u.userId === userFilter)?.email ?? ''}`}
              hours={visibleTotal.hours} amount={visibleTotal.amount} meals={visibleTotal.meals} />
          )}
        </div>
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm border border-slate-200 rounded-sm overflow-hidden">
            <thead className="bg-slate-50">
              <tr>
                <th className="w-8" />
                <th className={`${th} text-left`}>Utilisateur</th>
                <th className={`${th} text-left`}>Date</th>
                <th className={`${th} text-left`}>Horaires</th>
                <th className={`${th} text-left`}>Client / lieu</th>
                <th className={`${th} text-right`}>Heures</th>
                <th className={`${th} text-right`}>CA</th>
                <th className={`${th} text-right`}>Repas</th>
                <th className={`${th} text-right`}>Total</th>
              </tr>
            </thead>
            <tbody>
              {!loading && !visible.length && (
                <tr><td colSpan={9} className="px-4 py-6 text-center text-slate-500">Aucune mission.</td></tr>
              )}
              {!loading && visible.map((m) => (
                <Fragment key={m.id}>
                  <tr className="border-t border-slate-200">
                    <td className="pl-2">
                      <button type="button" aria-label="Détail" onClick={() => setExpanded(expanded === m.id ? null : m.id)}
                        className="p-1 text-slate-500 hover:text-[#0A192F]">
                        <ChevronDown className={`h-4 w-4 transition-transform ${expanded === m.id ? 'rotate-180' : ''}`} />
                      </button>
                    </td>
                    <td className="px-4 py-2 text-slate-600">{m.user_email}</td>
                    <td className="px-4 py-2 capitalize whitespace-nowrap">{formatDate(m.mission_date)}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{hhmm(m.start_time)} → {hhmm(m.end_time)}</td>
                    <td className="px-4 py-2 text-slate-600">{m.client || '—'}</td>
                    <td className="px-4 py-2 text-right">{m.hours_count} h</td>
                    <td className="px-4 py-2 text-right whitespace-nowrap">{eur(m.amount)}</td>
                    <td className="px-4 py-2 text-right whitespace-nowrap text-slate-600">{meal(m) ? eur(meal(m)) : '—'}</td>
                    <td className="px-4 py-2 text-right font-medium whitespace-nowrap">{eur(missionTotal(m))}</td>
                  </tr>
                  {expanded === m.id && (
                    <tr className="bg-slate-50/60">
                      <td />
                      <td colSpan={8} className="px-4 py-3">
                        <MissionBreakdown mission={m} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
            {!loading && visible.length > 0 && (
              <tfoot className="bg-slate-50 font-semibold text-[#0A192F]">
                <tr className="border-t-2 border-slate-300">
                  <td />
                  <td colSpan={4} className="px-4 py-2">
                    Total {userFilter === 'all' ? 'tous utilisateurs' : users.find((u) => u.userId === userFilter)?.email}
                  </td>
                  <td className="px-4 py-2 text-right">{visibleTotal.hours} h</td>
                  <td className="px-4 py-2 text-right whitespace-nowrap">{eur(visibleTotal.amount)}</td>
                  <td className="px-4 py-2 text-right whitespace-nowrap">{eur(visibleTotal.meals)}</td>
                  <td className="px-4 py-2 text-right whitespace-nowrap">{eur(visibleTotal.amount + visibleTotal.meals)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </section>
    </>
  );
};

const Stat = ({ label, value, sub, dark, className = '' }) => (
  <div className={`${dark ? 'bg-[#0A192F] text-white' : 'bg-slate-50 border border-slate-200'} rounded-sm p-3 sm:p-4 ${className}`}>
    <p className={`text-xs ${dark ? 'text-slate-300' : 'text-slate-500'}`}>{label}</p>
    <p className={`text-xl sm:text-2xl font-bold whitespace-nowrap ${dark ? '' : 'text-[#0A192F]'}`}>{value}</p>
    {sub && <p className="text-xs text-slate-300">{sub}</p>}
  </div>
);
