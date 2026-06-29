import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header simplifié */}
      <header className="bg-[#0A192F] text-white py-6 border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white text-[#0A192F] rounded-sm">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h1 className="font-headings font-bold text-xl">Politique de Confidentialité</h1>
          </div>
        </div>
      </header>

      {/* Contenu */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-slate max-w-none space-y-8">
          
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-headings font-bold text-[#0A192F] mb-4">Introduction</h2>
            <p className="text-slate-700 leading-relaxed">
              La présente Politique de Confidentialité décrit la façon dont vos données personnelles sont collectées, 
              utilisées et protégées lorsque vous utilisez ce site web et les services d'interprétariat proposés.
            </p>
            <p className="text-slate-700 leading-relaxed mt-3">
              Cette politique est conforme au Règlement Général sur la Protection des Données (RGPD - UE 2016/679) 
              et à la loi Informatique et Libertés modifiée.
            </p>
          </section>

          {/* Responsable du traitement */}
          <section>
            <h2 className="text-2xl font-headings font-bold text-[#0A192F] mb-4">1. Responsable du traitement des données</h2>
            <div className="bg-slate-50 border border-slate-200 p-6 rounded-sm space-y-2">
              <p><strong>Nom :</strong> Kenza ALIM</p>
              <p><strong>Qualité :</strong> Interprète-Traducteur Judiciaire Assermenté</p>
              <p><strong>Email :</strong> contact@example.com</p>
              <p><strong>Téléphone :</strong> 06 71 42 24 92</p>
            </div>
          </section>

          {/* Données collectées */}
          <section>
            <h2 className="text-2xl font-headings font-bold text-[#0A192F] mb-4">2. Données personnelles collectées</h2>
            
            <h3 className="text-xl font-semibold text-[#0A192F] mt-6 mb-3">2.1 Navigation sur le site</h3>
            <p className="text-slate-700 leading-relaxed mb-3">
              <strong>Aucune donnée personnelle n'est collectée automatiquement lors de votre navigation sur ce site.</strong>
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-700">
              <li>Aucun cookie analytique ou publicitaire</li>
              <li>Aucun tracker ou script de suivi</li>
              <li>Aucune collecte d'adresse IP</li>
              <li>Aucun formulaire de contact en ligne</li>
            </ul>

            <h3 className="text-xl font-semibold text-[#0A192F] mt-6 mb-3">2.2 Contact direct</h3>
            <p className="text-slate-700 leading-relaxed mb-3">
              Lorsque vous contactez l'interprète par téléphone, email ou WhatsApp, les données suivantes peuvent être collectées :
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-700">
              <li>Nom et prénom</li>
              <li>Fonction et organisme (police, gendarmerie, tribunal, etc.)</li>
              <li>Numéro de téléphone</li>
              <li>Adresse email</li>
              <li>Informations relatives à la mission d'interprétariat (date, heure, lieu, langue requise)</li>
            </ul>
          </section>

          {/* Finalités du traitement */}
          <section>
            <h2 className="text-2xl font-headings font-bold text-[#0A192F] mb-4">3. Finalités du traitement</h2>
            <p className="text-slate-700 leading-relaxed mb-3">
              Vos données personnelles sont collectées et traitées uniquement pour les finalités suivantes :
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-700">
              <li><strong>Gestion des missions d'interprétariat :</strong> Organisation, planification et exécution des prestations</li>
              <li><strong>Communication professionnelle :</strong> Réponses aux demandes de renseignements et coordination</li>
              <li><strong>Obligations légales et comptables :</strong> Facturation, archivage légal (experts de justice)</li>
              <li><strong>Amélioration de la qualité de service :</strong> Gestion de la relation client</li>
            </ul>
          </section>

          {/* Base légale */}
          <section>
            <h2 className="text-2xl font-headings font-bold text-[#0A192F] mb-4">4. Base légale du traitement</h2>
            <p className="text-slate-700 leading-relaxed mb-3">
              Le traitement de vos données personnelles repose sur les bases légales suivantes :
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-700">
              <li><strong>Exécution d'un contrat :</strong> Fourniture de prestations d'interprétariat</li>
              <li><strong>Obligation légale :</strong> Respect des obligations comptables et fiscales (conservation des factures, registres)</li>
              <li><strong>Intérêt légitime :</strong> Gestion de la relation client et amélioration des services</li>
            </ul>
          </section>

          {/* Destinataires des données */}
          <section>
            <h2 className="text-2xl font-headings font-bold text-[#0A192F] mb-4">5. Destinataires des données</h2>
            <p className="text-slate-700 leading-relaxed mb-3">
              Vos données personnelles sont destinées uniquement à :
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-700">
              <li>L'interprète responsable du traitement</li>
              <li>Les autorités judiciaires et services de police dans le cadre strict de leurs missions légales</li>
              <li>Le cabinet d'expertise comptable (uniquement données de facturation)</li>
            </ul>
            <p className="text-slate-700 leading-relaxed mt-3">
              <strong>Aucune donnée n'est vendue, louée ou transmise à des tiers à des fins commerciales.</strong>
            </p>
          </section>

          {/* Durée de conservation */}
          <section>
            <h2 className="text-2xl font-headings font-bold text-[#0A192F] mb-4">6. Durée de conservation</h2>
            <ul className="list-disc pl-6 space-y-2 text-slate-700">
              <li><strong>Coordonnées de contact :</strong> Durée de la relation professionnelle + 3 ans</li>
              <li><strong>Données de facturation :</strong> 10 ans (obligation légale comptable)</li>
              <li><strong>Archives judiciaires :</strong> Conformément aux obligations légales des experts de justice</li>
            </ul>
          </section>

          {/* Sécurité des données */}
          <section>
            <h2 className="text-2xl font-headings font-bold text-[#0A192F] mb-4">7. Sécurité des données</h2>
            <p className="text-slate-700 leading-relaxed mb-3">
              Des mesures techniques et organisationnelles appropriées sont mises en œuvre pour protéger vos données personnelles :
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-700">
              <li>Chiffrement des communications (HTTPS)</li>
              <li>Accès limité aux seules personnes habilitées</li>
              <li>Stockage sécurisé sur supports protégés</li>
              <li>Respect du secret professionnel (article 226-13 du Code pénal)</li>
            </ul>
          </section>

          {/* Vos droits */}
          <section>
            <h2 className="text-2xl font-headings font-bold text-[#0A192F] mb-4">8. Vos droits (RGPD)</h2>
            <p className="text-slate-700 leading-relaxed mb-3">
              Conformément au RGPD, vous disposez des droits suivants :
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-700">
              <li><strong>Droit d'accès :</strong> Obtenir une copie de vos données personnelles</li>
              <li><strong>Droit de rectification :</strong> Corriger des données inexactes ou incomplètes</li>
              <li><strong>Droit à l'effacement :</strong> Demander la suppression de vos données (sauf obligations légales)</li>
              <li><strong>Droit à la limitation :</strong> Limiter le traitement dans certaines conditions</li>
              <li><strong>Droit d'opposition :</strong> S'opposer au traitement pour des raisons légitimes</li>
              <li><strong>Droit à la portabilité :</strong> Recevoir vos données dans un format structuré</li>
            </ul>
            
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-sm mt-4">
              <p className="text-slate-700 leading-relaxed">
                <strong>Pour exercer vos droits :</strong> Envoyez un email à <strong>contact@example.com</strong> 
                en précisant votre identité et le droit que vous souhaitez exercer.
              </p>
            </div>

            <p className="text-slate-700 leading-relaxed mt-4">
              <strong>Droit de réclamation :</strong> Vous disposez également du droit d'introduire une réclamation 
              auprès de la Commission Nationale de l'Informatique et des Libertés (CNIL) : 
              <a href="https://www.cnil.fr" className="text-[#1E3A8A] hover:underline ml-1" target="_blank" rel="noopener noreferrer">www.cnil.fr</a>
            </p>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-2xl font-headings font-bold text-[#0A192F] mb-4">9. Cookies</h2>
            <p className="text-slate-700 leading-relaxed">
              <strong>Ce site n'utilise aucun cookie.</strong> Aucun tracker analytique, publicitaire ou de réseaux sociaux n'est présent.
            </p>
          </section>

          {/* Modifications */}
          <section>
            <h2 className="text-2xl font-headings font-bold text-[#0A192F] mb-4">10. Modifications de la politique</h2>
            <p className="text-slate-700 leading-relaxed">
              Cette politique de confidentialité peut être modifiée ou mise à jour à tout moment. 
              La version en vigueur est celle publiée sur cette page avec la date de mise à jour ci-dessous.
            </p>
          </section>

          {/* Date de mise à jour */}
          <section className="border-t border-slate-200 pt-6">
            <p className="text-sm text-slate-500">
              <strong>Dernière mise à jour :</strong> {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </section>

          {/* Bouton retour */}
          <div className="pt-8">
            <a 
              href="/" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#0A192F] hover:bg-[#1E3A8A] text-white font-semibold rounded-sm transition-colors"
            >
              ← Retour à l'accueil
            </a>
          </div>

        </div>
      </main>
    </div>
  );
};
