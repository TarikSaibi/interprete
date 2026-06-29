# Script d'initialisation Git et push vers GitHub
# Utilisation: .\init-git.ps1

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  Initialisation Git et GitHub   " -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# 1. Vérifier si git est initialisé
$gitExists = Test-Path ".git"

if ($gitExists) {
    Write-Host "[OK] Git est déjà initialisé" -ForegroundColor Green
} else {
    Write-Host "[INFO] Initialisation de Git..." -ForegroundColor Yellow
    git init
    Write-Host "[OK] Git initialisé" -ForegroundColor Green
}

Write-Host ""

# 2. Demander les informations utilisateur
Write-Host "Configuration Git locale :" -ForegroundColor Cyan
$userName = Read-Host "Entrez votre nom (ex: Jean Dupont)"
$userEmail = Read-Host "Entrez votre email (ex: jean@example.com)"

git config user.name "$userName"
git config user.email "$userEmail"

Write-Host "[OK] Configuration Git enregistrée" -ForegroundColor Green
Write-Host ""

# 3. Demander l'URL du repository GitHub
Write-Host "Repository GitHub :" -ForegroundColor Cyan
Write-Host "Créez d'abord un repository sur https://github.com/new" -ForegroundColor Yellow
Write-Host ""
$repoUrl = Read-Host "Entrez l'URL du repository (ex: https://github.com/username/repo.git)"

# Vérifier si remote existe déjà
$remoteExists = git remote | Select-String "origin"

if ($remoteExists) {
    Write-Host "[INFO] Remote 'origin' existe déjà, mise à jour..." -ForegroundColor Yellow
    git remote set-url origin $repoUrl
} else {
    Write-Host "[INFO] Ajout du remote 'origin'..." -ForegroundColor Yellow
    git remote add origin $repoUrl
}

Write-Host "[OK] Remote configuré" -ForegroundColor Green
Write-Host ""

# 4. Ajouter tous les fichiers
Write-Host "Ajout des fichiers au staging..." -ForegroundColor Cyan
git add .
Write-Host "[OK] Fichiers ajoutés" -ForegroundColor Green
Write-Host ""

# 5. Créer le commit
Write-Host "Création du commit..." -ForegroundColor Cyan
git commit -m "Initial commit: Site vitrine interprète judiciaire"
Write-Host "[OK] Commit créé" -ForegroundColor Green
Write-Host ""

# 6. Pousser vers GitHub
Write-Host "Push vers GitHub..." -ForegroundColor Cyan
Write-Host "Note: Vous devrez peut-être vous authentifier" -ForegroundColor Yellow
Write-Host ""

git branch -M main
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "==================================" -ForegroundColor Green
    Write-Host "  SUCCÈS !                        " -ForegroundColor Green
    Write-Host "==================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Prochaines étapes :" -ForegroundColor Cyan
    Write-Host "1. Allez sur votre repository GitHub" -ForegroundColor White
    Write-Host "2. Settings > Pages > Source: GitHub Actions" -ForegroundColor White
    Write-Host "3. Attendez le déploiement (onglet Actions)" -ForegroundColor White
    Write-Host "4. Votre site sera disponible sous quelques minutes !" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "==================================" -ForegroundColor Red
    Write-Host "  ERREUR                          " -ForegroundColor Red
    Write-Host "==================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Le push a échoué. Vérifiez :" -ForegroundColor Yellow
    Write-Host "- Que le repository GitHub existe" -ForegroundColor White
    Write-Host "- Que l'URL est correcte" -ForegroundColor White
    Write-Host "- Vos identifiants GitHub" -ForegroundColor White
    Write-Host ""
    Write-Host "Consultez DEPLOY_GUIDE.md pour plus d'aide" -ForegroundColor Cyan
}

Write-Host ""
Read-Host "Appuyez sur Entrée pour fermer"
