import React from 'react';
import { Phone, Mail, Clock, ShieldAlert } from 'lucide-react';
import { INTERPRETER } from '@/constants/testIds';

export const Contact = () => {
  return (
    <section id="contact" className="py-16 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12 space-y-3">
            <p className="text-xs font-bold text-red-600 uppercase tracking-widest">
              {"Ligne d'Urgence Dédiée"}
            </p>
            <h2 className="text-3xl sm:text-4xl font-headings font-bold tracking-tight text-[#0A192F]">
              {"Contact Immédiat 24h/24 & 7j/7"}
            </h2>
            <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto">
              {"Pour toute demande de réquisition, de garde à vue urgente ou d'assistance en audience, joignez-moi directement via les canaux ci-dessous."}
            </p>
          </div>

          {/* Contact Box Details (High-contrast Institutional Layout) */}
          <div className="bg-[#0A192F] text-white p-8 sm:p-12 shadow-xl border border-slate-800 space-y-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-800">
              <div className="flex items-center gap-4 text-center sm:text-left">
                <div className="p-3 bg-red-600/10 text-red-500 border border-red-500/20 rounded-full shrink-0 hidden sm:block">
                  <Clock className="h-6 w-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-headings font-semibold text-lg text-white">
                    {"Disponibilité Opérationnelle"}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400">
                    {"Les appels de nuit, de week-end et de garde à vue sont prioritaires."}
                  </p>
                </div>
              </div>
              
              <div className="px-4 py-2 bg-red-600/20 text-red-500 border border-red-500/20 text-xs font-bold uppercase tracking-wider rounded-full flex items-center gap-2">
                <ShieldAlert className="h-3.5 w-3.5" />
                <span>{"Urgences prioritaires"}</span>
              </div>
            </div>

            {/* Direct Connections Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              {/* Phone connection */}
              <a
                href="tel:+33612345678"
                data-testid={INTERPRETER.phoneContactLink}
                className="bg-slate-900/50 hover:bg-slate-900 border border-slate-800 p-6 flex flex-col items-center justify-center text-center space-y-3 transition-colors duration-200 group"
              >
                <div className="p-3.5 bg-red-600 text-white rounded-full group-hover:scale-105 transition-transform duration-200">
                  <Phone className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                    {"Par Téléphone (24/7)"}
                  </p>
                  <p className="text-lg font-bold text-white font-headings">
                    {"06 12 34 56 78"}
                  </p>
                </div>
              </a>

              {/* WhatsApp Connection */}
              <a
                href="https://wa.me/33612345678"
                target="_blank"
                rel="noopener noreferrer"
                data-testid={INTERPRETER.whatsappContactLink}
                className="bg-slate-900/50 hover:bg-slate-900 border border-slate-800 p-6 flex flex-col items-center justify-center text-center space-y-3 transition-colors duration-200 group"
              >
                <div className="p-3.5 bg-emerald-600 text-white rounded-full group-hover:scale-105 transition-transform duration-200">
                  <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.731-1.456L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.963C16.528 2.019 14.074 1 11.996 1c-5.441 0-9.864 4.37-9.868 9.8-.001 1.77.473 3.5 1.372 5.015L2.516 21.57l6.13-1.603z" />
                  </svg>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                    {"Via WhatsApp"}
                  </p>
                  <p className="text-lg font-bold text-white font-headings">
                    {"Message Direct"}
                  </p>
                </div>
              </a>

              {/* Email Connection */}
              <a
                href="mailto:m.laurent.interprete@gmail.com"
                data-testid={INTERPRETER.emailContactLink}
                className="bg-slate-900/50 hover:bg-slate-900 border border-slate-800 p-6 flex flex-col items-center justify-center text-center space-y-3 transition-colors duration-200 group"
              >
                <div className="p-3.5 bg-blue-600 text-white rounded-full group-hover:scale-105 transition-transform duration-200">
                  <Mail className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                    {"Par Courriel"}
                  </p>
                  <p className="text-sm font-bold text-white font-headings break-all">
                    {"m.laurent.interprete@gmail.com"}
                  </p>
                </div>
              </a>
            </div>

            {/* Note on requisition */}
            <div className="p-4 bg-slate-900/80 border border-slate-800 text-center text-slate-400 text-xs leading-relaxed">
              {"Pour l'envoi de réquisitions officielles, veuillez utiliser l'adresse courriel ci-dessus en joignant l'arrêté ou l'acte de réquisition signé par l'OPJ ou le magistrat compétent."}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
