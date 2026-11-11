import React from 'react';
import { Link } from 'react-router-dom';
import { PHONE_DISPLAY } from '@/constants/contact';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0A192F] text-slate-400 border-t border-slate-800 pt-12 pb-28 md:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center border-b border-slate-800 pb-8">
          {/* Identity */}
          <div className="space-y-2 text-center md:text-left">
            <span className="font-headings font-bold text-lg text-white tracking-wide">
              {"Kenza ALIM"}
            </span>
            <p className="text-xs text-slate-400">
              {"Interprète-Traducteur Judiciaire Assermenté près la Cour d’appel."}
              <br />
              {"Spécialiste de l'interprétariat pénal, de police et gendarmerie en Île-de-France."}
            </p>
          </div>

          {/* Emergency note */}
          <div className="text-center md:text-right space-y-1">
            <span className="text-xs font-semibold text-red-500 uppercase tracking-widest">
              {"LIGNE D'URGENCE 24/7"}
            </span>
            <p className="text-lg font-bold text-white font-headings">
              {PHONE_DISPLAY}
            </p>
          </div>
        </div>

        {/* Legal notice and details */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="text-center sm:text-left space-y-1">
            <p>© {currentYear} {"Alim. Tous droits réservés."}</p>
            <p className="text-slate-400">
              {"SIRET : En cours d'obtention (Collaborateur occasionnel du service public — COSP)."}
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 text-slate-400">
            <Link to="/mentions-legales" className="inline-flex items-center min-h-[40px] hover:text-white transition-colors duration-200">
              {"Mentions Légales"}
            </Link>
            <Link to="/politique-confidentialite" className="inline-flex items-center min-h-[40px] hover:text-white transition-colors duration-200">
              {"Politique de Confidentialité"}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
