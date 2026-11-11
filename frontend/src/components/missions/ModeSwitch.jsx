import React from 'react';
import { Link } from 'react-router-dom';
import { Calculator, ShieldCheck } from 'lucide-react';

// Bascule Mode utilisateur / Mode admin (affichée uniquement pour les admins)
export const ModeSwitch = ({ mode }) => {
  const item = (active) =>
    `inline-flex items-center gap-1.5 px-3 h-10 text-sm transition-colors ${
      active ? 'bg-white text-[#0A192F] font-semibold' : 'text-slate-300 hover:bg-white/10'
    }`;
  return (
    <nav aria-label="Changer de mode" className="inline-flex border border-slate-600 rounded-sm overflow-hidden">
      <Link to="/calculateur-ca" aria-current={mode === 'user' ? 'page' : undefined} className={item(mode === 'user')}>
        <Calculator className="h-4 w-4" /> <span className="hidden sm:inline">Mode utilisateur</span><span className="sm:hidden">Saisie</span>
      </Link>
      <Link to="/admin" aria-current={mode === 'admin' ? 'page' : undefined} className={item(mode === 'admin')}>
        <ShieldCheck className="h-4 w-4" /> <span className="hidden sm:inline">Mode admin</span><span className="sm:hidden">Admin</span>
      </Link>
    </nav>
  );
};
