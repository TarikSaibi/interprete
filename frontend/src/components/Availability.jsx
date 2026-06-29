import React from 'react';
import { Clock, ShieldAlert, Phone, MapPin } from 'lucide-react';
import { INTERPRETER } from '@/constants/testIds';

export const Availability = () => {
  return (
    <section id="disponibilite" className="py-16 sm:py-24 bg-slate-50 border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <p className="text-xs font-bold text-red-600 uppercase tracking-widest">
            {"Opérationnel 7j/7 - 24h/24"}
          </p>
          <h2 className="text-3xl sm:text-4xl font-headings font-bold tracking-tight text-[#0A192F]">
            {"Disponibilité d'Urgence Judiciaire"}
          </h2>
          <p className="text-slate-600 text-lg">
            {"Les procédures judiciaires et policières n'attendent pas. Ma réactivité garantit le bon respect des délais de procédure légaux (GAV, auditions, défèrements)."}
          </p>
        </div>

        {/* Bento/Grid style cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: 24/7 Availability */}
          <div className="bg-white border border-slate-200 p-8 shadow-sm relative group hover:border-[#1E3A8A] transition-all duration-300">
            <div className="p-3 bg-red-50 text-red-600 inline-block rounded-sm mb-6">
              <Clock className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-headings font-semibold text-[#0A192F] mb-3">
              {"Permanence H24 & Week-end"}
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              {"Disponible en astreinte continue la nuit, les week-ends et les jours fériés. Idéal pour les notifications de droits tardives et les auditions en garde à vue nocturnes."}
            </p>
          </div>

          {/* Card 2: Ultra-rapid reaction */}
          <div className="bg-white border border-slate-200 p-8 shadow-sm relative group hover:border-[#1E3A8A] transition-all duration-300">
            <div className="p-3 bg-blue-50 text-blue-600 inline-block rounded-sm mb-6">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-headings font-semibold text-[#0A192F] mb-3">
              {"Départ en Urgence (30-45 min)"}
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              {"Dès votre appel, je m'engage à me déplacer immédiatement. Arrivée rapide sur site (commissariats, gendarmeries de Paris et petite couronne) en moins de 45 minutes."}
            </p>
          </div>

          {/* Card 3: Administrative compliance */}
          <div className="bg-white border border-slate-200 p-8 shadow-sm relative group hover:border-[#1E3A8A] transition-all duration-300">
            <div className="p-3 bg-slate-50 text-[#0A192F] inline-block rounded-sm mb-6">
              <MapPin className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-headings font-semibold text-[#0A192F] mb-3">
              {"Mobilité Île-de-France"}
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              {"Équipé d'un véhicule personnel et connaissant parfaitement le réseau francilien, j'interviens sans encombre dans tous les départements (75, 92, 93, 94, 77, 78, 91, 95)."}
            </p>
          </div>
        </div>

        {/* Dynamic Trust Banner */}
        <div className="mt-12 bg-[#0A192F] text-white p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <div className="font-headings font-bold text-lg sm:text-xl">
              {"Besoin immédiat d'un interprète sur place ?"}
            </div>
            <p className="text-sm text-slate-300">
              {"Appelez directement mon numéro d'urgence. Réponse immédiate assurée."}
            </p>
          </div>
          <a
            href="tel:+33612345678"
            data-testid="availability-phone-cta"
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-base transition-colors duration-200 shadow whitespace-nowrap"
          >
            {"Appeler le 06 71 42 24 92"}
          </a>
        </div>
      </div>
    </section>
  );
};
