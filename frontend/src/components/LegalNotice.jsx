import React from 'react';
import { Scale } from 'lucide-react';

export const LegalNotice = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header simplifié */}
      <header className="bg-[#0A192F] text-white py-6 border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white text-[#0A192F] rounded-sm">
              <Scale className="h-5 w-5" />
            </div>
            <h1 className="font-headings font-bold text-xl">Mentions Légales</h1>
          </div>
        </div>
      </header>

      {/* Contenu */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-slate max-w-none space-y-8">
          
          {/* Présentation du site */}
          <section>
            <h2 className="text-2xl font-headings font-bold text-[#0A192F] mb-4">1. Présentation du site</h2>
            <p className="text-slate-700 leading-relaxed">
              Conformément aux dispositions de la loi n° 2004-575 du 21 juin 2004 pour la confiance en l'économie numérique, 
              il est précisé aux utilisateurs du site l'identité des différents intervenants dans le cadre de sa réalisation et de son suivi.
            </p>
          </section>

          {/* Éditeur du site */}
          <section>
            <h2 className="text-2xl font-headings font-bold text-[#0A192F] mb-4">2. Éditeur du site</h2>
            <div className="bg-slate-50 border border-slate-200 p-6 rounded-sm space-y-2">
              <p><strong>Nom :</strong> Kenza ALIM</p>
              <p><strong>Statut :</strong> Interprète-Traducteur Judiciaire Assermenté</p>
              <p><strong>Forme juridique :</strong> </p>
              <p><strong>SIRET :</strong> [À compléter une fois obtenu]</p>
              <p><strong>Inscription au registre :</strong> </p>
              <p><strong>Email :</strong> contact@example.com</p>
              <p><strong>Téléphone :</strong> 06 71 42 24 92</p>
              <p><strong>Adresse professionnelle :</strong> [À compléter]</p>
            </div>
          </section>

          {/* Hébergement */}
          <section>
            <h2 className="text-2xl font-headings font-bold text-[#0A192F] mb-4">3. Hébergement</h2>
            <div className="bg-slate-50 border border-slate-200 p-6 rounded-sm space-y-2">
              <p><strong>Hébergeur :</strong> GitHub Pages</p>
              <p><strong>Société :</strong> GitHub, Inc.</p>
              <p><strong>Adresse :</strong> 88 Colin P Kelly Jr St, San Francisco, CA 94107, États-Unis</p>
              <p><strong>Site web :</strong> <a href="https://github.com" className="text-[#1E3A8A] hover:underline" target="_blank" rel="noopener noreferrer">https://github.com</a></p>
            </div>
          </section>

          {/* Propriété intellectuelle */}
          <section>
            <h2 className="text-2xl font-headings font-bold text-[#0A192F] mb-4">4. Propriété intellectuelle</h2>
            <p className="text-slate-700 leading-relaxed mb-3">
              L'ensemble de ce site relève de la législation française et internationale sur le droit d'auteur et la propriété intellectuelle.
            </p>
            <p className="text-slate-700 leading-relaxed mb-3">
              Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.
            </p>
            <p className="text-slate-700 leading-relaxed">
              La reproduction de tout ou partie de ce site sur un support électronique ou autre quel qu'il soit est formellement interdite 
              sauf autorisation expresse de l'éditeur, conformément à l'article L.122-4 du Code de la Propriété Intellectuelle.
            </p>
          </section>

          {/* Responsabilité */}
          <section>
            <h2 className="text-2xl font-headings font-bold text-[#0A192F] mb-4">5. Responsabilité</h2>
            <p className="text-slate-700 leading-relaxed mb-3">
              Les informations contenues sur ce site sont aussi précises que possible et le site est périodiquement remis à jour, 
              mais peut toutefois contenir des inexactitudes, des omissions ou des lacunes.
            </p>
            <p className="text-slate-700 leading-relaxed mb-3">
              Si vous constatez une lacune, erreur ou ce qui paraît être un dysfonctionnement, merci de bien vouloir le signaler 
              par email à l'adresse contact@example.com en décrivant le problème de la manière la plus précise possible.
            </p>
            <p className="text-slate-700 leading-relaxed">
              L'éditeur ne saurait être tenu responsable des dommages directs et indirects causés au matériel de l'utilisateur 
              lors de l'accès au site, et résultant soit de l'utilisation d'un matériel ne répondant pas aux spécifications, 
              soit de l'apparition d'un bug ou d'une incompatibilité.
            </p>
          </section>

          {/* Liens hypertextes */}
          <section>
            <h2 className="text-2xl font-headings font-bold text-[#0A192F] mb-4">6. Liens hypertextes</h2>
            <p className="text-slate-700 leading-relaxed mb-3">
              Le site peut contenir des liens hypertextes vers d'autres sites présents sur le réseau Internet. 
              Les liens vers ces autres ressources vous font quitter le site.
            </p>
            <p className="text-slate-700 leading-relaxed">
              Il est possible de créer un lien vers ce site sans autorisation expresse de l'éditeur. 
              Néanmoins, l'éditeur se réserve le droit de demander la suppression d'un lien qu'il estime non conforme à son objet.
            </p>
          </section>

          {/* Protection des données personnelles (RGPD) */}
          <section>
            <h2 className="text-2xl font-headings font-bold text-[#0A192F] mb-4">7. Protection des données personnelles (RGPD)</h2>
            <p className="text-slate-700 leading-relaxed mb-3">
              Conformément au Règlement Général sur la Protection des Données (RGPD) entré en application le 25 mai 2018 et à la loi Informatique et Libertés du 6 janvier 1978 modifiée, 
              vous disposez d'un droit d'accès, de rectification, de suppression et d'opposition aux données personnelles vous concernant.
            </p>
            <p className="text-slate-700 leading-relaxed mb-3">
              <strong>Collecte de données :</strong> Ce site ne collecte aucune donnée personnelle automatiquement. 
              Aucun cookie analytique ou publicitaire n'est utilisé.
            </p>
            <p className="text-slate-700 leading-relaxed mb-3">
              <strong>Communication directe :</strong> Lorsque vous contactez l'interprète par téléphone, email ou WhatsApp, 
              vos coordonnées sont utilisées uniquement dans le cadre de la prestation d'interprétariat et ne sont jamais transmises à des tiers 
              sans votre consentement explicite, sauf obligation légale.
            </p>
            <p className="text-slate-700 leading-relaxed">
              Pour exercer vos droits, vous pouvez adresser votre demande à : contact@example.com
            </p>
          </section>

          {/* Secret professionnel */}
          <section>
            <h2 className="text-2xl font-headings font-bold text-[#0A192F] mb-4">8. Secret professionnel</h2>
            <p className="text-slate-700 leading-relaxed mb-3">
            </p>
            <p className="text-slate-700 leading-relaxed">
              Toutes les informations échangées dans le cadre des missions d'interprétariat judiciaire sont strictement confidentielles 
              et protégées par le secret de l'instruction et le secret professionnel.
            </p>
          </section>

          {/* Droit applicable */}
          <section>
            <h2 className="text-2xl font-headings font-bold text-[#0A192F] mb-4">9. Droit applicable et juridiction compétente</h2>
            <p className="text-slate-700 leading-relaxed">
              Tout litige en relation avec l'utilisation du site est soumis au droit français. 
              En cas de litige, les tribunaux français seront seuls compétents.
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
