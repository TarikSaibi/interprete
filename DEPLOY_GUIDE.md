# Guide de Déploiement GitHub Pages

Ce guide vous explique comment pousser le projet sur GitHub et le déployer automatiquement.

## 📋 Prérequis

- Un compte GitHub
- Git installé sur votre machine
- Node.js v20+ et npm installés

## 🚀 Étapes de déploiement

### 1. Créer un repository GitHub

1. Connectez-vous sur [GitHub.com](https://github.com)
2. Cliquez sur le bouton **"New repository"** (ou **"+"** en haut à droite > New repository)
3. Remplissez les informations :
   - **Repository name** : `interprete-judiciaire` (ou le nom de votre choix)
   - **Description** : "Site vitrine interprète judiciaire Paris Île-de-France"
   - **Visibility** : Public (obligatoire pour GitHub Pages gratuit)
   - **Ne cochez PAS** "Initialize this repository with a README"
4. Cliquez sur **"Create repository"**

### 2. Initialiser Git localement (si ce n'est pas déjà fait)

Ouvrez PowerShell ou le terminal dans le dossier du projet et exécutez :

```bash
# Vérifier si git est déjà initialisé
git status

# Si pas initialisé, exécuter :
git init
```

### 3. Configurer Git avec vos informations

```bash
git config user.email "votre-email@example.com"
git config user.name "Votre Nom"
```

### 4. Ajouter tous les fichiers au staging

```bash
git add .
```

### 5. Faire le premier commit

```bash
git commit -m "Initial commit: Site vitrine interprète judiciaire"
```

### 6. Lier votre repository local au repository GitHub

Remplacez `VOTRE-USERNAME` par votre nom d'utilisateur GitHub et `interprete-judiciaire` par le nom de votre repository :

```bash
git remote add origin https://github.com/VOTRE-USERNAME/interprete-judiciaire.git
```

### 7. Pousser le code sur GitHub

```bash
git branch -M main
git push -u origin main
```

Si demandé, entrez vos identifiants GitHub (ou utilisez un Personal Access Token).

### 8. Activer GitHub Pages

1. Allez sur votre repository GitHub dans le navigateur
2. Cliquez sur **Settings** (en haut à droite)
3. Dans le menu de gauche, cliquez sur **Pages**
4. Sous **"Build and deployment"** :
   - **Source** : Sélectionnez **"GitHub Actions"**
5. Le workflow se déclenchera automatiquement

### 9. Attendre le déploiement

1. Allez dans l'onglet **Actions** de votre repository
2. Vous verrez le workflow "Deploy to GitHub Pages" en cours d'exécution
3. Attendez que le workflow soit terminé (environ 2-3 minutes)
4. Une fois terminé, un ✅ vert apparaîtra

### 10. Accéder à votre site

Votre site sera accessible à l'adresse :

```
https://VOTRE-USERNAME.github.io/interprete-judiciaire/
```

(Remplacez `VOTRE-USERNAME` par votre nom d'utilisateur GitHub)

## 🔄 Mettre à jour le site

Pour mettre à jour le site après des modifications :

```bash
# 1. Ajouter les fichiers modifiés
git add .

# 2. Créer un nouveau commit
git commit -m "Description de vos modifications"

# 3. Pousser les changements
git push
```

Le workflow GitHub Actions se déclenchera automatiquement et mettra à jour le site en quelques minutes.

## ⚙️ Personnaliser avant le déploiement

### Informations à modifier

Avant de déployer, pensez à remplacer les informations d'exemple par les vraies :

1. **Coordonnées** (dans les composants) :
   - Nom : "Kenza ALIM" → Votre nom
   - Téléphone : "06 71 42 24 92" → Votre numéro
   - Email : "contact@example.com" → Votre email

2. **Mentions légales** (`frontend/src/components/LegalNotice.jsx`) :
   - SIRET
   - Adresse professionnelle
   - Coordonnées complètes

3. **Métadonnées SEO** (`frontend/public/index.html`) :
   - Balise `<title>`
   - Meta description
   - Ajoutez votre nom dans le contenu

### Fichiers à éditer

- `frontend/src/components/Header.jsx` - Nom et titre
- `frontend/src/components/Hero.jsx` - Téléphone et WhatsApp
- `frontend/src/components/Footer.jsx` - Nom et téléphone
- `frontend/src/components/Contact.jsx` - Email et téléphone
- `frontend/src/components/EmergencyFab.jsx` - Téléphone
- `frontend/src/components/LegalNotice.jsx` - Toutes les infos légales
- `frontend/src/components/PrivacyPolicy.jsx` - Email de contact

## 🌐 Utiliser un nom de domaine personnalisé (optionnel)

Si vous avez un nom de domaine (ex: `www.mon-site.fr`) :

1. Dans les paramètres GitHub Pages, ajoutez votre domaine personnalisé
2. Configurez les enregistrements DNS chez votre hébergeur :
   - Type `CNAME` pointant vers `VOTRE-USERNAME.github.io`
3. GitHub générera automatiquement un certificat SSL gratuit

## 🐛 Résolution de problèmes

### Le workflow échoue

- Vérifiez les logs dans l'onglet Actions
- Assurez-vous que `package-lock.json` est bien présent dans `frontend/`

### Le site affiche une page blanche

- Vérifiez que `"homepage": "."` est bien dans `frontend/package.json`
- Vérifiez la console du navigateur pour voir les erreurs

### Les routes ne fonctionnent pas (404)

- GitHub Pages ne supporte pas le routing côté client par défaut
- Solution : Ajoutez un fichier `404.html` qui redirige vers `index.html`

### Le site ne se met pas à jour

- Videz le cache du navigateur (Ctrl+Shift+R)
- Attendez quelques minutes (propagation CDN)

## 📞 Support

Pour toute question sur le déploiement :
- Consultez la [documentation GitHub Pages](https://docs.github.com/en/pages)
- Consultez la [documentation GitHub Actions](https://docs.github.com/en/actions)

---

**Note** : Ce projet est prêt pour le déploiement ! Tous les fichiers nécessaires sont configurés.
