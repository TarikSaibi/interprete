# Historique des missions (Supabase)

La page cachée `/calculateur-ca` enregistre les missions dans Supabase. Le site restant statique
(GitHub Pages), le front parle directement à Supabase. La sécurité repose sur
l'authentification et sur les règles RLS : chaque utilisateur ne voit que ses missions.

## Mise en place

1. Créer un projet sur https://supabase.com (région UE, par ex. Paris / Frankfurt).
2. **SQL Editor** : exécuter `migrations/001_missions.sql`.
3. **Authentication > Providers > Email** : désactiver *Allow new users to sign up*
   (sinon n'importe qui pourrait créer un compte).
4. **Authentication > Users > Add user** : créer chaque utilisateur (email + mot de passe, cocher *Auto confirm*).
5. **Project Settings > API** : récupérer `Project URL` et la clé `anon public`.
6. En local : copier `frontend/.env.example` en `frontend/.env.local` et remplir les deux valeurs.
7. GitHub : **Settings > Secrets and variables > Actions** et ajouter les secrets
   `REACT_APP_SUPABASE_URL` et `REACT_APP_SUPABASE_ANON_KEY` (utilisés par `deploy.yml`).

> La clé `anon` se retrouve dans le bundle JS ; c'est prévu par Supabase. Ne jamais utiliser la clé `service_role` côté front.

## Modèle

Table `missions` : date, heures de début/fin, client/lieu, notes, `hours_count`, `amount`, `breakdown` (détail
heure par heure). Le montant est **figé à la saisie** : une future évolution du barème ne modifie pas l'historique.
