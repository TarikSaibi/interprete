# ✅ Checklist avant déploiement

## 📝 Informations à personnaliser

Avant de pousser le site sur GitHub, **remplacez les informations d'exemple** par les vraies :

### 1. Coordonnées professionnelles

- [ ] **Nom** : Remplacer "Kenza ALIM" par le vrai nom
  - Fichiers : `Header.jsx`, `Footer.jsx`, `LegalNotice.jsx`, `PrivacyPolicy.jsx`

- [ ] **Téléphone** : Remplacer "06 71 42 24 92" par le vrai numéro
  - Fichiers : `Header.jsx`, `Hero.jsx`, `Footer.jsx`, `EmergencyFab.jsx`, `Contact.jsx`, `LegalNotice.jsx`, `PrivacyPolicy.jsx`

- [ ] **Email** : Remplacer "contact@example.com" par le vrai email
  - Fichiers : `Contact.jsx`, `LegalNotice.jsx`, `PrivacyPolicy.jsx`

- [ ] **WhatsApp** : Remplacer "+33612345678" dans les liens WhatsApp
  - Fichiers : `Hero.jsx`, `Contact.jsx`

### 2. Mentions légales (obligatoire)

Dans `frontend/src/components/LegalNotice.jsx` :

- [ ] SIRET (une fois obtenu)
- [ ] Adresse professionnelle complète
- [ ] Vérifier toutes les coordonnées

### 3. Politique de confidentialité

Dans `frontend/src/components/PrivacyPolicy.jsx` :

- [ ] Email de contact
- [ ] Vérifier toutes les informations

### 4. SEO et métadonnées

Dans `frontend/public/index.html` :

- [ ] Modifier le `<title>` si nécessaire
- [ ] Vérifier la meta `description`
- [ ] Ajouter votre nom dans la description

### 5. Langues (optionnel)

Dans `frontend/src/components/Languages.jsx` :

- [ ] Modifier les langues si différentes de : Anglais, Arabe, Amazigh/Berbère/Kabyle

### 6. Services (optionnel)

Dans `frontend/src/components/Services.jsx` :

- [ ] Vérifier que les services listés correspondent à votre offre

### 7. Zone d'intervention (optionnel)

Dans `frontend/src/components/InterventionZone.jsx` :

- [ ] Vérifier la zone géographique (actuellement : Paris + Île-de-France)

## 🚀 Déploiement

### Avant de pousser sur GitHub

- [ ] Toutes les informations personnelles sont à jour
- [ ] Les mentions légales sont complètes
- [ ] Le numéro de téléphone fonctionne
- [ ] L'email est valide
- [ ] Tester en local : `cd frontend && npm start`
- [ ] Vérifier que le site s'affiche correctement
- [ ] Tester les liens de navigation
- [ ] Tester le bouton d'appel d'urgence (FAB)

### Créer le repository GitHub

- [ ] Créer un compte GitHub si vous n'en avez pas
- [ ] Créer un nouveau repository (Public)
- [ ] Noter l'URL du repository

### Pousser le code

**Option 1 : Script automatique (recommandé)**
```bash
.\init-git.ps1
```

**Option 2 : Manuel**
```bash
git init
git config user.name "Votre Nom"
git config user.email "votre-email@example.com"
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/USERNAME/REPO.git
git branch -M main
git push -u origin main
```

### Activer GitHub Pages

- [ ] Aller dans Settings > Pages
- [ ] Source : Sélectionner "GitHub Actions"
- [ ] Attendre le déploiement (onglet Actions)
- [ ] Vérifier que le site fonctionne

## 🔍 Tests post-déploiement

Une fois le site en ligne :

- [ ] Le site s'affiche correctement
- [ ] Les liens de navigation fonctionnent
- [ ] Le bouton d'appel fonctionne sur mobile
- [ ] Les mentions légales sont accessibles
- [ ] La politique de confidentialité est accessible
- [ ] Les numéros de téléphone sont cliquables
- [ ] L'email est cliquable (mailto:)
- [ ] Le lien WhatsApp fonctionne
- [ ] Le site est responsive (tester sur mobile)

## 📱 Tests mobile

- [ ] Header fixe visible
- [ ] Bouton FAB (appel d'urgence) visible en bas
- [ ] Navigation mobile fonctionnelle
- [ ] Tous les boutons cliquables
- [ ] Texte lisible

## ⚖️ Conformité légale

- [ ] Mentions légales présentes et complètes
- [ ] Politique de confidentialité présente
- [ ] RGPD : Droit d'accès, rectification, suppression mentionnés
- [ ] Secret professionnel mentionné
- [ ] Aucune collecte de données sans consentement

## 📧 Communication

Après le déploiement, vous pouvez communiquer l'URL :

```
https://VOTRE-USERNAME.github.io/NOM-DU-REPO/
```

## 🔄 Mises à jour futures

Pour mettre à jour le site après modifications :

```bash
git add .
git commit -m "Description des changements"
git push
```

Le site se mettra à jour automatiquement en 2-3 minutes.

---

## ✨ Le projet est prêt !

Tous les fichiers nécessaires sont configurés :
- ✅ Frontend React optimisé
- ✅ Mentions légales complètes
- ✅ Politique de confidentialité RGPD
- ✅ Workflow GitHub Actions
- ✅ Configuration GitHub Pages
- ✅ README.md détaillé
- ✅ Guide de déploiement
- ✅ Routing côté client configuré

**Il ne reste plus qu'à personnaliser les coordonnées et déployer !**
