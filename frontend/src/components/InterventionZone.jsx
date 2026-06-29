import React from 'react';
import { MapPin, Navigation, Compass } from 'lucide-react';
import { INTERPRETER } from '@/constants/testIds';

export const InterventionZone = () => {
  const departments = [
    { code: '75', name: 'Paris', desc: 'Arrivée immédiate au Palais de Justice, DRPJ, et tous commissariats d’arrondissements.', time: '30-40 min' },
    { code: '92', name: 'Hauts-de-Seine', desc: 'Intervention Nanterre, Boulogne-Billancourt, Colombes, Clichy, Courbevoie, Antony.', time: '40-50 min' },
    { code: '93', name: 'Seine-Saint-Denis', desc: 'Bobigny, Saint-Denis, Montreuil, Aubervilliers, Aulnay-sous-Bois, Noisy-le-Grand.', time: '35-45 min' },
    { code: '94', name: 'Val-de-Marne', desc: 'Créteil, Vitry-sur-Seine, Champigny, Saint-Maur-des-Fossés, Ivry-sur-Seine.', time: '35-45 min' },
    { code: '77', name: 'Seine-et-Marne', desc: 'Melun, Meaux, Chelles, Pontault-Combault, Champs-sur-Marne, Torcy.', time: '50-60 min' },
    { code: '78', name: 'Yvelines', desc: 'Versailles, Sartrouville, Mantes-la-Jolie, Saint-Germain-en-Laye, Poissy.', time: '50-60 min' },
    { code: '91', name: 'Essonne', desc: 'Évry-Courcouronnes, Corbeil-Essonnes, Massy, Savigny-sur-Orge, Sainte-Geneviève.', time: '45-55 min' },
    { code: '95', name: 'Val-d\'Oise', desc: 'Pontoise, Cergy, Argenteuil, Sarcelles, Garges-lès-Gonesse, Franconville.', time: '45-55 min' }
  ];

  return (
    <section id="zones" className="py-16 sm:py-24 bg-slate-50 border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <p className="text-xs font-bold text-red-600 uppercase tracking-widest">
            Mobilité Francilienne
          </p>
          <h2 className="text-3xl sm:text-4xl font-headings font-bold tracking-tight text-[#0A192F]">
            Zone d’Intervention — Île-de-France
          </h2>
          <p className="text-slate-600 text-lg">
            Déplacements immédiats dans toute la région. Une couverture complète pour répondre aux réquisitions des parquets et des services d’enquête.
          </p>
        </div>

        {/* Departments Grid */}
        <div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" 
          data-testid={INTERPRETER.zoneList}
        >
          {departments.map((dept, idx) => (
            <div 
              key={idx}
              className="bg-white border border-slate-200 p-6 flex flex-col justify-between hover:border-[#1E3A8A] hover:shadow-sm transition-all duration-300"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-headings font-extrabold text-3xl text-[#1E3A8A]">
                    {dept.code}
                  </span>
                  <div className="p-1.5 bg-slate-100 text-slate-500 rounded-sm">
                    <MapPin className="h-4 w-4" />
                  </div>
                </div>
                
                <h3 className="text-lg font-headings font-bold text-[#0A192F]">
                  {dept.name}
                </h3>
                
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                  {dept.desc}
                </p>
              </div>

              <div className="border-t border-slate-100 pt-3 mt-4 flex items-center justify-between text-xs font-semibold text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Navigation className="h-3.5 w-3.5 text-red-600" />
                  <span>Temps moyen d’arrivée :</span>
                </div>
                <span className="text-[#0A192F] font-bold bg-slate-100 px-2 py-0.5 rounded-sm">
                  {dept.time}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile transport disclaimer */}
        <div className="mt-12 bg-white border border-slate-200 p-6 flex flex-col sm:flex-row items-center gap-4 max-w-4xl mx-auto">
          <div className="p-3 bg-red-50 text-red-600 rounded-full shrink-0">
            <Compass className="h-6 w-6 animate-spin" style={{ animationDuration: '8s' }} />
          </div>
          <div className="space-y-1">
            <h4 className="font-headings font-bold text-[#0A192F] text-sm sm:text-base">
              Réseau routier et transports optimisés
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Grâce à l’utilisation d’applications de navigation en temps réel et d’un véhicule motorisé léger, les retards liés au trafic routier sont anticipés pour garantir une arrivée dans le strict respect des réquisitions.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
