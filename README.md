# Interprète Judiciaire Paris — Île-de-France

Site vitrine professionnel pour un interprète-traducteur judiciaire assermenté basé à Paris, spécialisé en interprétariat judiciaire et policier en Île-de-France.

## 📋 À propos

Site one-page moderne et responsive présentant les services d'un interprète judiciaire assermenté près la Cour d'appel, disponible 24h/24 et 7j/7 pour les urgences judiciaires (gardes à vue, auditions, comparutions).

### Caractéristiques

- ✅ Design Swiss & High-Contrast (Institutional)
- ✅ Optimisé mobile-first avec bouton d'appel d'urgence flottant (FAB)
- ✅ 100% statique (pas de backend requis)
- ✅ React + Tailwind CSS + shadcn/ui
- ✅ Déployable sur GitHub Pages

### Services présentés

- Gardes à Vue (GAV) & Retentions
- Auditions Libres & Enquêtes
- Comparutions Immédiates & Tribunaux
- Interprétariat Administratif & Pénitentiaire

### Langues d'expertise

- Anglais
- Arabe (Standard & Dialectal)
- Amazigh / Berbère / Kabyle

## 🚀 Installation

### Prérequis

- Node.js v20+ (LTS recommandé)
- npm v10+

### Installation locale

```bash
# Cloner le repository
git clone https://github.com/VOTRE-USERNAME/interprete.git
cd interprete/frontend

# Installer les dépendances
npm install --legacy-peer-deps

# Lancer le serveur de développement
npm start
```

Le site sera accessible sur `http://localhost:3000`

## 📦 Build de production

```bash
cd frontend
npm run build
```

Les fichiers optimisés seront générés dans le dossier `frontend/build/`

## 🌐 Déploiement sur GitHub Pages

### Configuration automatique via GitHub Actions

1. **Activer GitHub Pages** dans les paramètres du repository :
   - Allez dans Settings > Pages
   - Source : GitHub Actions

2. **Pusher votre code** :
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

3. Le workflow GitHub Actions se déclenchera automatiquement et déploiera le site.

### Configuration manuelle

Si vous préférez déployer manuellement :

```bash
cd frontend
npm run build
npx gh-pages -d build
```

## 🛠️ Technologies utilisées

- **Frontend** : React 19
- **Styling** : Tailwind CSS 3.4
- **UI Components** : Radix UI (shadcn/ui)
- **Icons** : Lucide React
- **Routing** : React Router 7
- **Build** : Craco (Create React App Configuration Override)
- **Fonts** : Outfit (headings), IBM Plex Sans (body)

## 📁 Structure du projet

```
interprete/
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── Hero.jsx
│   │   │   ├── Availability.jsx
│   │   │   ├── Services.jsx
│   │   │   ├── Languages.jsx
│   │   │   ├── ProfessionalStatus.jsx
│   │   │   ├── InterventionZone.jsx
│   │   │   ├── Contact.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── EmergencyFab.jsx
│   │   │   └── ui/
│   │   ├── constants/
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── tailwind.config.js
├── .github/
│   └── workflows/
│       └── deploy.yml
└── README.md
```

## 🎨 Personnalisation

### Modifier les coordonnées

Éditez les composants suivants pour personnaliser les informations :

- **Nom et titre** : `frontend/src/components/Header.jsx`
- **Téléphone** : `frontend/src/components/Header.jsx`, `Hero.jsx`, `EmergencyFab.jsx`, `Footer.jsx`
- **Email** : `frontend/src/components/Contact.jsx`
- **Langues** : `frontend/src/components/Languages.jsx`

### Couleurs et typographie

Les couleurs principales sont définies dans :
- Bleu marine : `#0A192F`
- Rouge urgence : `#DC2626` (red-600)
- Blanc : `#FFFFFF`

Police d'affichage : **Outfit** (Google Fonts)  
Police de corps : **IBM Plex Sans** (Google Fonts)

## 📝 Licence

Ce projet est un template de site vitrine. Libre de droits pour usage personnel ou commercial.

## 👤 Auteur

Site développé pour un interprète judiciaire professionnel basé à Paris.

---

**Note** : Avant de déployer en production, pensez à :
- Remplacer les coordonnées fictives par les vraies
- Ajouter le numéro SIRET une fois obtenu
- Vérifier les mentions légales
- Personnaliser les métadonnées SEO dans `public/index.html`
