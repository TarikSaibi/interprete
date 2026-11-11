import React from 'react';
import { Phone, Clock, ShieldCheck } from 'lucide-react';
import { INTERPRETER } from '@/constants/testIds';
import { PHONE_DISPLAY, PHONE_HREF, WHATSAPP_HREF } from '@/constants/contact';
import { WhatsAppIcon } from '@/components/WhatsAppIcon';

export const Hero = () => {
  return (
    <section className="relative bg-slate-900 min-h-[75vh] md:min-h-[85vh] flex items-center justify-start overflow-hidden">
      {/* Background Image with Dark Overlay */}
      <div 
        aria-hidden="true"
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: 'url("https://images.pexels.com/photos/30754785/pexels-photo-30754785.jpeg?auto=compress&cs=tinysrgb&w=1600")' 
        }}
      />
      <div className="absolute inset-0 bg-[#0A192F]/85 mix-blend-multiply" />

      {/* Hero Content */}
      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 z-10 text-white">
        <div className="max-w-3xl space-y-6 sm:space-y-8">
          {/* Emergency Badge */}
          <div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-600/10 text-red-500 border border-red-500/20 font-semibold text-sm animate-pulse"
            data-testid={INTERPRETER.emergencyBadge}
          >
            <Clock className="h-4 w-4" />
            <span>{"DISPONIBLE 24h/24 & 7j/7 — URGENCES JUDICIAIRES"}</span>
          </div>

          {/* Title */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-headings font-bold tracking-tight text-white leading-tight">
              {"Interprète-Traducteur Judiciaire Assermenté"}
            </h1>
            <p className="text-lg sm:text-xl text-slate-300 font-medium tracking-wide max-w-2xl">
              {"Collaborateur occasionnel du service public près la Cour d’appel. Interventions en urgence (jour, nuit et week-end) en Île-de-France."}
            </p>
          </div>

          {/* Languages spoken quick list */}
          <div className="flex flex-wrap gap-3 py-1">
            <span className="px-3 py-1 bg-white/10 text-slate-200 text-sm font-semibold rounded-none uppercase tracking-wider">
              {"Anglais"}
            </span>
            <span className="px-3 py-1 bg-white/10 text-slate-200 text-sm font-semibold rounded-none uppercase tracking-wider">
              {"Arabe (Standard & Dialectal)"}
            </span>
            <span className="px-3 py-1 bg-white/10 text-slate-200 text-sm font-semibold rounded-none uppercase tracking-wider">
              {"Amazigh / Berbère / Kabyle"}
            </span>
          </div>

          {/* Legitimacies check */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 text-sm text-slate-300">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0" />
              <span>{"Inscrit sur la liste des experts de justice"}</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0" />
              <span>{"Habilité Garde à vue & Auditions libres"}</span>
            </div>
          </div>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <a
              href={PHONE_HREF}
              data-testid={INTERPRETER.heroPhoneCta}
              className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold text-lg transition-all duration-200 shadow-lg hover:scale-[1.01]"
            >
              <Phone className="h-5 w-5 animate-bounce" />
              <span>{`Appel d'Urgence : ${PHONE_DISPLAY}`}</span>
            </a>
            
            <a
              href={WHATSAPP_HREF}
              target="_blank"
              rel="noopener noreferrer"
              data-testid={INTERPRETER.heroWhatsappCta}
              className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg transition-all duration-200 shadow-lg hover:scale-[1.01]"
            >
              <WhatsAppIcon />
              <span>{"Contacter sur WhatsApp"}</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
