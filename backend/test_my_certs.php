<?php
// Test if we can connect to API and get my certificats
$url = "http://127.0.0.1:8000/api/my-certificats";

// We need a token - let's create one for testing
// First, let's get a user and create a token

require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';

// Bootstrap Laravel
$app->make(\Illuminate\Contracts\Http\Kernel::class)->bootstrap();

use App\Models\User;

// Find a user with etudiant role
$etudiant = User::where('role', 'etudiant')->first();

if (!$etudiant) {
    echo "Aucun étudiant trouvé en base de données\n";
    exit(1);
}

echo "Étudiant trouvé: ID={$etudiant->id}, Nom={$etudiant->nom}\n";

// Create a token
$token = $etudiant->createToken('test')->plainTextToken;

echo "Token créé: " . substr($token, 0, 20) . "...\n\n";

// Now test the API
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $token,
    'Content-Type: application/json',
    'Accept: application/json'
]);

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "Status Code: $http_code\n";
echo "Response:\n";
echo json_encode(json_decode($response), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
echo "\n\n";

// Also check what certificats exist for this etudiant
echo "=== Certificats pour cet étudiant en base ===\n";
$certs = \App\Models\Certificat::where('etudiant_id', $etudiant->id)->get();
echo "Total: " . $certs->count() . "\n";
foreach ($certs as $cert) {
    echo "- ID: {$cert->id}, Étudiant: {$cert->etudiant_id}, Formation: {$cert->formation_id}\n";
}
