import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound } from 'lucide-react';
import { supabase, authLinkType } from '@/lib/supabase';
import { useSession } from '@/hooks/useSession';

const inputClass =
  'flex h-11 sm:h-10 w-full rounded-sm border border-slate-300 bg-white px-3 py-1 text-base sm:text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#1E3A8A]';

// Page atteinte depuis un email d'invitation ou de réinitialisation : l'utilisateur choisit son mot de passe
export const SetPasswordPage = () => {
  const session = useSession();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) return setError('Le mot de passe doit contenir au moins 8 caractères.');
    if (password !== confirm) return setError('Les deux mots de passe ne correspondent pas.');
    setSaving(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setSaving(false);
    if (err) return setError(`Erreur : ${err.message}`);
    navigate('/calculateur-ca', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-sm p-5 sm:p-8 space-y-5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#0A192F] text-white rounded-sm"><KeyRound className="h-5 w-5" /></div>
          <h1 className="font-headings font-bold text-lg sm:text-xl text-[#0A192F]">
            {authLinkType === 'recovery' ? 'Nouveau mot de passe' : 'Choisissez votre mot de passe'}
          </h1>
        </div>

        {session === undefined && <p className="text-slate-500">Vérification du lien…</p>}

        {session === null && (
          <div className="space-y-3">
            <p className="text-slate-700">Ce lien est invalide ou a expiré. Demandez une nouvelle invitation ou utilisez « Mot de passe oublié ».</p>
            <a href="/calculateur-ca" className="text-[#1E3A8A] hover:underline text-sm">Aller à la connexion</a>
          </div>
        )}

        {session && (
          <form onSubmit={onSubmit} className="space-y-4">
            <p className="text-sm text-slate-600">Compte : <span className="font-medium">{session.user.email}</span></p>
            <div className="space-y-1.5">
              <label htmlFor="new-password" className="text-sm font-semibold text-[#0A192F]">Mot de passe</label>
              <input id="new-password" type="password" autoComplete="new-password" required value={password}
                onChange={(e) => setPassword(e.target.value)} className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="confirm-password" className="text-sm font-semibold text-[#0A192F]">Confirmer le mot de passe</label>
              <input id="confirm-password" type="password" autoComplete="new-password" required value={confirm}
                onChange={(e) => setConfirm(e.target.value)} className={inputClass} />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button type="submit" disabled={saving}
              className="w-full px-6 py-3 bg-[#0A192F] hover:bg-[#1E3A8A] disabled:opacity-60 text-white font-semibold rounded-sm transition-colors">
              {saving ? 'Enregistrement…' : 'Enregistrer et continuer'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
