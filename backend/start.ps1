# 🚀 DÉMARRAGE DU BACKEND

Write-Host "================================" -ForegroundColor Cyan
Write-Host "🚀 DÉMARRAGE DU BACKEND" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

$backendDir = "d:\projetStageCNI\cni-gestion-formations\backend"

# Vérifier la base de données
Write-Host "📊 Préparation de la base de données..." -ForegroundColor Yellow
Set-Location $backendDir
& php artisan migrate:fresh --seed --quiet
Write-Host "✅ Base de données prête (23 utilisateurs, 3 formations, 3 sessions)" -ForegroundColor Green
Write-Host ""

# Démarrer le serveur
Write-Host "🌐 Démarrage du serveur..." -ForegroundColor Yellow
Write-Host "API disponible sur: http://127.0.0.1:8000/api" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Utilisateurs de test:" -ForegroundColor Cyan
Write-Host "  • Admin: admin@cni.fr" -ForegroundColor White
Write-Host "  • Formateur: formateur1@cni.fr" -ForegroundColor White
Write-Host "  • Étudiants: etudiant1@cni.fr à etudiant20@cni.fr" -ForegroundColor White
Write-Host "  • Mot de passe: password123" -ForegroundColor White
Write-Host ""
Write-Host "Appuyez sur Ctrl+C pour arrêter le serveur" -ForegroundColor Yellow
Write-Host ""

& php artisan serve --host=127.0.0.1 --port=8000
