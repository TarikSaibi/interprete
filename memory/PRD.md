# Product Requirement Document (PRD) - Site Vitrine Interprète Judiciaire

## 1. Description du Projet
Création d'un site vitrine professionnel d'une seule page (one-page) avec défilement vertical, optimisé pour mobile, pour un interprète-traducteur indépendant basé à Paris et spécialisé en interprétariat judiciaire et policier en Île-de-France (garde à vue, auditions, comparutions).

## 2. Public Cible & Persona
- **Public Cible** : Officiers de Police Judiciaire (OPJ), commissariats de police, gendarmeries, tribunaux, greffiers, services de la Préfecture de Police de Paris.
- **Besoin Clé** : Contacter en extrême urgence (parfois de nuit ou le week-end) un interprète assermenté et réactif pour assister aux auditions ou notifier des droits de garde à vue.

## 3. Spécifications Fonctionnelles & Exigences Clés (Statiques)
- **Identité Professionnelle** : Nom fictif "Marc LAURENT", "Interprète-Traducteur Judiciaire Assermenté".
- **Disponibilité & Réactivité** : En astreinte d'urgence 24h/24 & 7j/7, avec engagement d'arrivée rapide (30-45 minutes).
- **Services Clairs** : Gardes à Vue (GAV), Auditions libres, Comparutions immédiates, Interprétariat administratif & pénitentiaire.
- **Langues d'Expertise** : Anglais, Arabe (Standard & Dialectal), Amazigh / Berbère / Kabyle (langue rare et recherchée).
- **Légitimité et Moralité** : Inscription sur liste d'experts près la Cour d'appel, statut auto-entrepreneur, secret professionnel strict et charte déontologique (neutralité, impartialité).
- **Zone de Couverture** : Paris et l'ensemble de l'Île-de-France (75, 92, 93, 94, 77, 78, 91, 95).
- **Canaux de Communication Directs** : Téléphone, e-mail, WhatsApp (aucun formulaire de contact, conformément au choix de l'utilisateur).
- **Optimisation Mobile** : Header fixe avec bouton d'appel cliquable, bouton flottant d'appel d'urgence (FAB) persistant en bas d'écran sur mobile.

## 4. Architecture Technique Implémentée (Date: 29 Décembre 2025)
- **Frontend** : Application React moderne utilisant Tailwind CSS, Lucide Icons, et des polices typographiques hautement institutionnelles (Outfit pour les titres, IBM Plex Sans pour le corps).
- **Design Archetype** : Swiss & High-Contrast (Institutional Variant) utilisant un bleu marine profond, du blanc et des accents de rouge d'urgence pour assurer le sérieux et la solennité.
- **Rapport de Tests** : 100% de taux de réussite aux tests automatiques E2E via Playwright et de statut de route via Pytest.

## 5. Backlog Priorisé (P0/P1/P2)
- **P0** : Remplacement des coordonnées d'exemple par les coordonnées réelles du client final (langues, nom de praticien, numéro de téléphone, e-mail). *À effectuer par l'utilisateur lors du déploiement.*
- **P1** : Ajout du numéro SIRET officiel dans le footer dès son attribution par l'URSSAF.
- **P1** : Optimisation SEO supplémentaire sur les métadonnées géolocalisées pour chaque département d'Île-de-France.
- **P2** : Ajout d'un sélecteur de langue d'interface FR/EN pour les magistrats internationaux.
