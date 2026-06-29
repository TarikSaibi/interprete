import React from 'react';
import { ShieldCheck, BookOpen, Receipt, Scale } from 'lucide-react';
import { INTERPRETER } from '@/constants/testIds';

export const ProfessionalStatus = () => {
  return (
    <section id="statut" className="relative py-16 sm:py-24 bg-white overflow-hidden">
      {/* Marble Texture Background with low opacity */}
      <div 
        className="absolute inset-0 opacity-[0.04] pointer-events-none bg-cover bg-center"
        style={{ 
          backgroundImage: 'url("https://images.pexels.com/photos/4049752/pexels-photo-4049752.jpeg")' 
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            {"Garantie de Légitimité"}
          </p>
          <h2 
            className="text-3xl sm:text-4xl font-headings font-bold tracking-tight text-[#0A192F]"
            data-testid={INTERPRETER.expertStatus}
          >
            {"Statut Professionnel & Déontologie"}
          </h2>
          <p className="text-slate-600 text-lg">
            {"Un auxiliaire de justice indépendant, soumis au secret professionnel le plus strict et engagé au service de la vérité et de l’équité des procédures."}
          </p>
        </div>

        {/* Content layout - Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column: Authority cards */}
          <div className="space-y-6">
            <div className="flex gap-4 p-5 bg-slate-50 border border-slate-200">
              <div className="p-3 bg-white text-[#1E3A8A] border border-slate-200 inline-block h-fit rounded-sm shadow-xs">
                <Scale className="h-6 w-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-headings font-bold text-lg text-[#0A192F]">
                  {"Inscrit sur Liste d'Experts près la Cour d'Appel"}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {"Garantie officielle de compétences, d'expérience et de probité morale. Reconnu par les magistrats, greffiers et officiers de police judiciaire (OPJ) de toute l'Île-de-France."}
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-5 bg-slate-50 border border-slate-200">
              <div className="p-3 bg-white text-[#1E3A8A] border border-slate-200 inline-block h-fit rounded-sm shadow-xs">
                <Receipt className="h-6 w-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-headings font-bold text-lg text-[#0A192F]">
                  {"Facturation Simplifiée (Auto-entrepreneur)"}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {"Entreprise individuelle déclarée, permettant l'émission de factures immédiates et de mémoires de frais pour les réquisitions de justice ou frais de traduction."}
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-5 bg-slate-50 border border-slate-200">
              <div className="p-3 bg-white text-[#1E3A8A] border border-slate-200 inline-block h-fit rounded-sm shadow-xs">
                <BookOpen className="h-6 w-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-headings font-bold text-lg text-[#0A192F]">
                  {"Respect Absolu du Code de Déontologie"}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {"Respect rigoureux du secret professionnel (article 226-13 du Code Pénal), neutralité totale vis-à-vis des parties, probité intellectuelle et exactitude de traduction."}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Code of Conduct & Authority statement */}
          <div className="bg-[#0A192F] text-white p-8 sm:p-10 shadow-xl border border-slate-800">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-8 w-8 text-emerald-500 shrink-0" />
                <h3 className="font-headings font-bold text-xl sm:text-2xl text-white">
                  {"Charte Déontologique"}
                </h3>
              </div>
              
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed italic">
                {"\"Je jure d'apporter mon concours à la justice, d'accomplir ma mission, de faire mon rapport et de donner mon avis en mon honneur et en ma conscience.\""}
              </p>

              <div className="border-t border-slate-800 my-4" />

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 shrink-0" />
                  <p className="text-xs sm:text-sm text-slate-300">
                    <span className="font-bold text-white">{"Impartialité"}</span> : {"Refus systématique de toute mission en cas de conflit d'intérêts direct ou indirect."}
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 shrink-0" />
                  <p className="text-xs sm:text-sm text-slate-300">
                    <span className="font-bold text-white">{"Exactitude"}</span> : {"Fidélité complète dans la restitution des dépositions, sans interprétation personnelle."}
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 shrink-0" />
                  <p className="text-xs sm:text-sm text-slate-300">
                    <span className="font-bold text-white">{"Confidentialité"}</span> : {"Secret de l'enquête policière et secret d'instruction préservés indéfiniment."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
