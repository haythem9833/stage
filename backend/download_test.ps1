$token = "51|9cqmTzwNoBbdtGkbEIqPNDUG4BbVulUPDDNtoB3jc8191728"
$url = "http://127.0.0.1:8000/api/certificats/1/download"

$headers = @{
    "Authorization" = "Bearer $token"
    "Accept" = "application/pdf"
}

try {
    $response = Invoke-WebRequest -Uri $url -Headers $headers -OutFile "test_certificate.pdf" -PassThru
    Write-Host "Status: $($response.StatusCode)"
    Write-Host "✅ PDF téléchargé avec succès!"
    Write-Host "Fichier: test_certificate.pdf"
    Get-Item "test_certificate.pdf" | Select-Object Length
} catch {
    Write-Host "❌ Erreur: $_"
}
