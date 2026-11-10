import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const inputClass =
  'flex h-10 w-full rounded-sm border border-slate-300 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#1E3A8A]';

// Connexion uniquement : les comptes sont créés depuis le dashboard Supabase (inscriptions publiques désactivées)
export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) setError('Identifiants invalides.');
    setLoading(false);
  };

  return (
    <form onSubmit={onSubmit} className="bg-slate-50 border border-slate-200 rounded-sm p-6 space-y-4 max-w-md">
      <div className="flex items-center gap-2 text-[#0A192F] font-semibold">
        <Lock className="h-4 w-4" /> Connexion pour accéder à l'historique des missions
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
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={loading}
        className="px-6 py-2 bg-[#0A192F] hover:bg-[#1E3A8A] disabled:opacity-60 text-white font-semibold rounded-sm transition-colors">
        {loading ? 'Connexion…' : 'Se connecter'}
      </button>
    </form>
  );
};
