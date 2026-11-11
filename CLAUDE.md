*66# Interprète judiciaire — site vitrine + outil de suivi des missions

Site vitrine (kenzaalim-interprete.fr) + pages privées de suivi du CA des missions d'interprétariat.
Dépôt **public** sur GitHub.

## Stack
- Front : React 19 (CRA + craco), Tailwind, lucide-react — tout dans `frontend/`
- Back : Supabase (Postgres + Auth + RLS + Edge Functions) — projet `fqhvxpvxtivkerwflewg`
- Hébergement : GitHub Pages, déploiement auto à chaque push sur `main` (`.github/workflows/deploy.yml`)
- Alias d'import : `@/` = `frontend/src/`

## Commandes (depuis `frontend/`)
- Installer : `npm install --legacy-peer-deps` (et commiter `package-lock.json`, sinon `npm ci` casse la CI)
- Dev : `npm start` → http://localhost:3000
- Build (vérif) : `CI=true npm run build 2>&1 | grep -E "Compiled|Failed|rror|arning"` (CI=true : warnings = erreurs)

## Pages
- `/` vitrine · `/calculateur-ca` calculatrice + historique (connexion) · `/admin` (admins) · `/definir-mot-de-passe` (lien d'invitation/reset)

## Fichiers clés
- Calcul du CA (barème officiel, majorations nuit/WE/fériés, heure commencée due) : `src/lib/caCalculator.js`
- Accès données : `src/lib/missionsApi.js` · client : `src/lib/supabase.js` · formats FR : `src/lib/format.js`
- SQL : `supabase/migrations/NNN_*.sql` · Edge Function invitation : `supabase/functions/invite-user/`

## Règles impératives
- **Sécurité** : seule la clé publique (`sb_publishable_…`) va dans le front. Jamais de clé `service_role`/`sb_secret_`, de mot de passe DB ni de `.env*` dans le dépôt (public).
- **Base de données** : toute modif = nouveau fichier `supabase/migrations/NNN_*.sql` (jamais modifier une migration existante). Nouvelle table → RLS activée + policies. Fonctions `security definer` → `set search_path = ''`. Le SQL est exécuté **par l'utilisateur** dans le SQL Editor : lui fournir le script.
- **Montants figés** : `amount` / `breakdown` / `meal_amount` sont enregistrés à la saisie ; un changement de barème ne doit pas modifier l'historique.
- **UI en français** : dates `jj/mm/aaaa`, heures 24 h, montants `fr-FR` (`eur()` de `format.js`). Libellé « CA » (pas « vacations »).
- **Responsive obligatoire** : mobile (390 px) = listes/cartes, ≥ md = tableaux ; champs `text-base sm:text-sm` (pas de zoom iOS) ; cibles tactiles ≥ 40 px.
- **Git** : ne pas pousser directement sur `main` sans validation de l'utilisateur (push = mise en production).

## Style de travail
- Répondre en français, de façon concise.
- Filtrer les sorties longues (`grep`, `tail`) ; ne pas lire `node_modules/`, `build/`, `package-lock.json`.
