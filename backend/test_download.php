<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';

// Bootstrap Laravel
$app->make(\Illuminate\Contracts\Http\Kernel::class)->bootstrap();

use App\Models\User;
use App\Models\Certificat;

// Get a certificate
$cert = Certificat::first();

if (!$cert) {
    echo "Aucun certificat trouvé\n";
    exit(1);
}

$user = User::find($cert->etudiant_id);
if (!$user) {
    echo "Utilisateur non trouvé\n";
    exit(1);
}

$token = $user->createToken('test')->plainTextToken;

echo "Test du téléchargement de certificat\n";
echo "Certificate ID: " . $cert->id . "\n";
echo "URL: http://127.0.0.1:8000/api/certificats/{$cert->id}/download\n";
echo "Token: " . substr($token, 0, 20) . "...\n\n";

// Test the download endpoint
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "http://127.0.0.1:8000/api/certificats/{$cert->id}/download");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $token,
    'Accept: application/pdf'
]);

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$content_type = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
curl_close($ch);

echo "HTTP Status: $http_code\n";
echo "Content-Type: $content_type\n";
echo "Response length: " . strlen($response) . " bytes\n\n";

if ($http_code == 200) {
    echo "✅ PDF téléchargé avec succès!\n";
    // Save PDF for testing
    file_put_contents(__DIR__ . '/test_certificate.pdf', $response);
    echo "Fichier sauvegardé: " . __DIR__ . '/test_certificate.pdf' . "\n";
} else {
    echo "❌ Erreur:\n";
    echo substr($response, 0, 500) . "\n";
}
