import React from 'react';
import { Globe, Check, Award } from 'lucide-react';
import { INTERPRETER } from '@/constants/testIds';

export const Languages = () => {
  const languages = [
    {
      lang: 'Anglais',
      nativeName: 'English',
      subtitle: 'Maîtrise bilingue & Vocabulaire juridique complexe',
      desc: 'Parfaite connaissance du vocabulaire de la procédure pénale anglo-saxonne (Common Law vs Civil Law). Assistance lors d’interrogatoires ou d’auditions impliquant des ressortissants étrangers.',
      points: [
        'Anglais juridique et commercial',
        'Traduction assermentée certifiée',
        'Terminologie pénale internationale',
        'Niveau d’excellence académique (C2)'
      ]
    },
    {
      lang: 'Arabe',
      nativeName: 'العربية',
      subtitle: 'Arabe Littéral & Dialectes régionaux (Moyen-Orient / Maghreb)',
      desc: 'Maîtrise de l’arabe standard moderne (littéraire) ainsi que des principaux dialectes (maghrébins, égyptiens, levantins), essentiels pour les auditions policières au quotidien.',
      points: [
        'Arabe Standard Moderne (Fusha)',
        'Dialectes maghrébins (Algérien, Marocain, Tunisien)',
        'Dialectes égyptien et levantin',
        'Fidélité et nuances culturelles intégrées'
      ]
    },
    {
      lang: 'Amazigh (Berbère)',
      nativeName: 'ⵜⴰⵎⴰⵣⵉⵖⵜ / Kabyle',
      subtitle: 'Langue Kabyle & Variantes Berbères d’Afrique du Nord',
      desc: 'Compétence rare et très recherchée en Île-de-France. Parfaite maîtrise du kabyle (variante majeure de l’amazigh) et compréhension des dynamiques régionales.',
      points: [
        'Langue Kabyle fluide et naturelle',
        'Variantes dialectales berbères d’Afrique du Nord',
        'Expertise culturelle et linguistique',
        'Prestation réactive en urgence'
      ]
    }
  ];

  return (
    <section id="langues" className="py-16 sm:py-24 bg-slate-50 border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <p className="text-xs font-bold text-[#1E3A8A] uppercase tracking-widest">
            Combinaisons Linguistiques
          </p>
          <h2 className="text-3xl sm:text-4xl font-headings font-bold tracking-tight text-[#0A192F]">
            Langues de Spécialité
          </h2>
          <p className="text-slate-600 text-lg">
            Une expertise trilingue assurant une retransmission exacte, sans altération ni omission des nuances essentielles au dossier judiciaire.
          </p>
        </div>

        {/* Languages Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" data-testid={INTERPRETER.languagesList}>
          {languages.map((language, idx) => (
            <div 
              key={idx}
              className="bg-white border border-slate-200 p-8 shadow-sm flex flex-col justify-between hover:border-[#1E3A8A] hover:shadow-md transition-all duration-300"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3.5 bg-blue-50 text-[#1E3A8A] rounded-sm">
                    <Globe className="h-6 w-6" />
                  </div>
                  <span className="font-headings font-bold text-lg text-slate-400">
                    {language.nativeName}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-2xl font-headings font-bold text-[#0A192F]">
                    {language.lang}
                  </h3>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    {language.subtitle}
                  </p>
                </div>

                <p className="text-slate-600 text-sm leading-relaxed">
                  {language.desc}
                </p>

                <div className="border-t border-slate-100 my-4" />

                <ul className="space-y-2">
                  {language.points.map((pt, pIdx) => (
                    <li key={pIdx} className="flex items-center gap-2 text-sm text-slate-600">
                      <Check className="h-4 w-4 text-[#1E3A8A] shrink-0" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Assermentation Trust Seal */}
        <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-4 p-6 border border-dashed border-[#1E3A8A]/30 bg-blue-50/20 max-w-3xl mx-auto rounded-sm">
          <Award className="h-10 w-10 text-[#1E3A8A] shrink-0" />
          <div className="text-center sm:text-left space-y-1">
            <h4 className="font-headings font-bold text-slate-950 text-sm sm:text-base">
              Prestation sous Serment devant la Cour
            </h4>
            <p className="text-xs sm:text-sm text-slate-600">
              Toutes les traductions et interventions font foi de manière officielle auprès de la Police, de la Gendarmerie et des différentes instances juridictionnelles françaises.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
