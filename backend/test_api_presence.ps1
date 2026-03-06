# Test the presence endpoint using PowerShell

# 1. Get a valid token by logging in as formateur
$loginResponse = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/login" `
  -Method POST `
  -Headers @{"Content-Type" = "application/json"} `
  -Body (@{
    "email" = "formateur1@cni.fr"
    "password" = "password123"
  } | ConvertTo-Json)

Write-Host "Login response:" -ForegroundColor Green
$loginResponse | ConvertTo-Json | Write-Host

if (-not $loginResponse.token) {
  Write-Host "Failed to get token" -ForegroundColor Red
  exit 1
}

$token = $loginResponse.token
Write-Host "`nToken: $token" -ForegroundColor Yellow

# 2. Test the presences batch endpoint
Write-Host "`nTesting presences/batch endpoint..." -ForegroundColor Cyan

$body = @{
  "date" = "2026-03-04"
  "presences" = @(
    @{
      "inscription_id" = 1
      "statut" = "present"
    }
  )
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/formations/1/presences/batch" `
  -Method POST `
  -Headers @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $token"
  } `
  -Body $body

Write-Host "Response:" -ForegroundColor Green
$response | ConvertTo-Json | Write-Host
