import React from 'react';
import { Scale, Shield, Landmark, FileText, CheckCircle2 } from 'lucide-react';
import { INTERPRETER } from '@/constants/testIds';

export const Services = () => {
  const servicesList = [
    {
      icon: <Shield className="h-6 w-6 text-[#1E3A8A]" />,
      title: 'Gardes à Vue (GAV) & Retentions',
      desc: 'Notification immédiate des droits à la personne gardée à vue. Interprétariat de haute fidélité lors des auditions par l’OPJ (Officier de Police Judiciaire) et lors des confrontations.',
      bullets: [
        'Notification de garde à vue et droits',
        'Auditions de suspects et de témoins',
        'Confrontations et reconstitutions',
        'Visites et entretiens de rétention administrative'
      ]
    },
    {
      icon: <Scale className="h-6 w-6 text-[#1E3A8A]" />,
      title: 'Auditions Libres & Enquêtes',
      desc: 'Assistance aux personnes convoquées dans le cadre d’une audition libre au commissariat ou en gendarmerie. Fidélité absolue et respect strict de la procédure pénale.',
      bullets: [
        'Assistance lors d’auditions libres',
        'Interrogatoires préliminaires',
        'Enquêtes sociales et de personnalité',
        'Auditions pour la gendarmerie nationale'
      ]
    },
    {
      icon: <Landmark className="h-6 w-6 text-[#1E3A8A]" />,
      title: 'Comparutions Immédiates & Tribunaux',
      desc: 'Interprétariat d’audience en comparution immédiate, devant le Tribunal Correctionnel, le Tribunal de Police ou le Juge d’Instruction.',
      bullets: [
        'Défèrements devant le Procureur de la République',
        'Audiences devant le JLD (Juge des libertés et de la détention)',
        'Procès et comparutions correctionnelles immédiates',
        'Instruction criminelle et confrontations de cabinets'
      ]
    },
    {
      icon: <FileText className="h-6 w-6 text-[#1E3A8A]" />,
      title: 'Interprétariat Administratif & Pénitentiaire',
      desc: 'Missions d’interprétariat auprès des administrations publiques, maisons d’arrêt (parloirs avocats, commissions de discipline) et préfectures.',
      bullets: [
        'Auditions à la Préfecture de Police',
        'Interprétariat en milieu pénitentiaire (maisons d’arrêt)',
        'Entretiens d’asile (OFPRA, CNDA)',
        'Traduction de documents de procédure (ordonnances, PV)'
      ]
    }
  ];

  return (
    <section id="services" className="py-16 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            Nos Prestations Réglées
          </p>
          <h2 className="text-3xl sm:text-4xl font-headings font-bold tracking-tight text-[#0A192F]">
            Prestations d’Interprétariat Judiciaire
          </h2>
          <p className="text-slate-600 text-lg">
            Des services rigoureux, conformes à la déontologie des experts de justice, garantissant une communication irréprochable entre l’institution et la personne mise en cause.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8" data-testid={INTERPRETER.servicesList}>
          {servicesList.map((service, idx) => (
            <div 
              key={idx}
              className="bg-[#F8FAFC] border border-slate-200 p-8 hover:shadow-md transition-all duration-300 rounded-sm hover:border-[#1E3A8A] flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="p-3 bg-white border border-slate-200 inline-block rounded-sm">
                  {service.icon}
                </div>
                <h3 className="text-2xl font-headings font-semibold text-[#0A192F]">
                  {service.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {service.desc}
                </p>
                <div className="border-t border-slate-200/60 my-4" />
                <ul className="space-y-2.5">
                  {service.bullets.map((bullet, bIdx) => (
                    <li key={bIdx} className="flex items-start gap-2.5 text-sm text-slate-600">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
