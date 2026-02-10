# Test API Script
Write-Host "================================" -ForegroundColor Cyan
Write-Host "🧪 TEST COMPLET DE L'API" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

$API_URL = "http://127.0.0.1:8000/api"

# Test 1: Login
Write-Host "TEST 1: POST /api/auth/login" -ForegroundColor Yellow
$loginJson = @{
    email = "admin@cni.fr"
    password = "password123"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$API_URL/auth/login" `
        -Method Post `
        -Body $loginJson `
        -ContentType 'application/json' `
        -TimeoutSec 10
    
    $data = $response.Content | ConvertFrom-Json
    Write-Host "✅ Login réussi!" -ForegroundColor Green
    Write-Host "Token: $($data.token.Substring(0, 40))..."
    Write-Host "Utilisateur: $($data.user.nom) $($data.user.prenom) ($($data.user.role))"
    Write-Host ""
    
    $TOKEN = $data.token
    
    # Test 2: Formations
    Write-Host "TEST 2: GET /api/formations" -ForegroundColor Yellow
    $response2 = Invoke-WebRequest -Uri "$API_URL/formations" `
        -Headers @{Authorization = "Bearer $TOKEN"} `
        -TimeoutSec 10
    $formations = $response2.Content | ConvertFrom-Json
    Write-Host "✅ $($formations.Count) formations trouvées" -ForegroundColor Green
    $formations | ForEach-Object { Write-Host "  - $($_.titre) ($($_.duree)h)" }
    Write-Host ""
    
    # Test 3: Sessions
    Write-Host "TEST 3: GET /api/sessions" -ForegroundColor Yellow
    $response3 = Invoke-WebRequest -Uri "$API_URL/sessions" `
        -Headers @{Authorization = "Bearer $TOKEN"} `
        -TimeoutSec 10
    $sessions = $response3.Content | ConvertFrom-Json
    Write-Host "✅ $($sessions.Count) sessions trouvées" -ForegroundColor Green
    $sessions | ForEach-Object { Write-Host "  - $($_.titre) (statut: $($_.statut))" }
    Write-Host ""
    
    # Test 4: Profil
    Write-Host "TEST 4: GET /api/auth/profil" -ForegroundColor Yellow
    $response4 = Invoke-WebRequest -Uri "$API_URL/auth/profil" `
        -Headers @{Authorization = "Bearer $TOKEN"} `
        -TimeoutSec 10
    $profil = $response4.Content | ConvertFrom-Json
    Write-Host "✅ Profil récupéré" -ForegroundColor Green
    Write-Host "  Email: $($profil.email)"
    Write-Host "  Rôle: $($profil.role)"
    Write-Host ""
    
    # Test 5: Dashboard
    Write-Host "TEST 5: GET /api/admin/dashboard" -ForegroundColor Yellow
    $response5 = Invoke-WebRequest -Uri "$API_URL/admin/dashboard" `
        -Headers @{Authorization = "Bearer $TOKEN"} `
        -TimeoutSec 10
    $dashboard = $response5.Content | ConvertFrom-Json
    Write-Host "✅ Dashboard récupéré" -ForegroundColor Green
    Write-Host "  Utilisateurs: $($dashboard.total_utilisateurs)"
    Write-Host "  Formations: $($dashboard.total_formations)"
    Write-Host "  Sessions: $($dashboard.total_sessions)"
    Write-Host "  Inscriptions: $($dashboard.total_inscriptions)"
    Write-Host ""
    
    Write-Host "================================" -ForegroundColor Green
    Write-Host "✅ TOUS LES TESTS RÉUSSIS!" -ForegroundColor Green
    Write-Host "================================" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Erreur: $_" -ForegroundColor Red
    Write-Host "Assurez-vous que le serveur est actif sur http://127.0.0.1:8000" -ForegroundColor Yellow
}
