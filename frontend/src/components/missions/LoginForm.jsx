import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { frError } from '@/lib/errors';

const inputClass =
  'flex h-11 sm:h-10 w-full rounded-sm border border-slate-300 bg-white px-3 py-1 text-base sm:text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#1E3A8A]';

// Connexion + mot de passe oublié (les comptes sont créés / invités depuis le dashboard Supabase)
export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setInfo('');
    try {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) setError(frError(err));
    } catch (err) {
      setError(frError(err));
    } finally {
      setLoading(false);
    }
  };

  const onForgot = async () => {
    setError('');
    setInfo('');
    if (!email) return setError("Saisis d'abord ton email ci-dessus.");
    // Le lien de l'email ramène sur le site, puis vers /definir-mot-de-passe
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
    if (err) return setError(`Envoi impossible : ${frError(err)}`);
    setInfo('Si ce compte existe, un email de réinitialisation vient d\'être envoyé.');
  };

  return (
    <form onSubmit={onSubmit} className="bg-slate-50 border border-slate-200 rounded-sm p-4 sm:p-6 space-y-4 w-full max-w-md">
      <div className="flex items-center gap-2 text-[#0A192F] font-semibold">
        <Lock className="h-4 w-4 shrink-0" /> Connexion pour accéder à l'historique des missions
      </div>
      <div className="space-y-1.5">
        <label htmlFor="login-email" className="text-sm font-semibold text-[#0A192F]">Email</label>
        <input id="login-email" type="email" autoComplete="email" required value={email}
          onChange={(e) => setEmail(e.target.value)} className={inputClass} />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="login-password" className="text-sm font-semibold text-[#0A192F]">Mot de passe</label>
        <input id="login-password" type="password" autoComplete="current-password" required value={password}
          onChange={(e) => setPassword(e.target.value)} className={inputClass} />
      </div>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      {info && <p role="status" className="text-sm text-emerald-700">{info}</p>}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <button type="submit" disabled={loading}
          className="w-full sm:w-auto px-6 py-3 bg-[#0A192F] hover:bg-[#1E3A8A] disabled:opacity-60 text-white font-semibold rounded-sm transition-colors">
          {loading ? 'Connexion…' : 'Se connecter'}
        </button>
        <button type="button" onClick={onForgot} className="text-sm text-[#1E3A8A] hover:underline min-h-[40px] px-1 self-start sm:self-auto">
          Mot de passe oublié ?
        </button>
      </div>
    </form>
  );
};
