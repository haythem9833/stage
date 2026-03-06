<?php

// Test API calls for presences

$headers = [
    'Content-Type: application/json',
    'Accept: application/json'
];

$baseUrl = 'http://localhost:8000/api';

// 1. Login as formateur
echo "=== 1. LOGIN AS FORMATEUR ===\n";
$loginData = json_encode([
    'email' => 'formateur1@cni.fr',
    'password' => 'password123'
]);

$ch = curl_init($baseUrl . '/login');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_POSTFIELDS, $loginData);
$response = curl_exec($ch);
curl_close($ch);

$loginResponse = json_decode($response, true);
$token = $loginResponse['data']['token'] ?? null;

if (!$token) {
    echo "Login failed!\n";
    print_r($loginResponse);
    exit(1);
}

echo "Token: " . substr($token, 0, 20) . "...\n\n";

// 2. Get formations for this formateur
echo "=== 2. GET FORMATIONS ===\n";
$headers[] = "Authorization: Bearer $token";

$ch = curl_init($baseUrl . '/formations');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
$response = curl_exec($ch);
curl_close($ch);

$formations = json_decode($response, true);
$formation = $formations[0] ?? null;

if (!$formation) {
    echo "No formations found!\n";
    print_r($formations);
    exit(1);
}

echo "Formation: " . $formation['titre'] . " (ID: " . $formation['id'] . ")\n";
echo "Inscriptions: " . count($formation['inscriptions'] ?? []) . "\n\n";

// 3. Record presences
if (count($formation['inscriptions'] ?? []) > 0) {
    echo "=== 3. RECORD PRESENCES ===\n";
    
    $presences = [];
    foreach (array_slice($formation['inscriptions'], 0, 5) as $inscription) {
        $presences[] = [
            'inscription_id' => $inscription['id'],
            'statut' => 'present'
        ];
    }
    
    $batchData = json_encode([
        'date' => now()->toDateString(),
        'presences' => $presences
    ]);
    
    echo "Posting " . count($presences) . " presences...\n";
    
    $ch = curl_init($baseUrl . '/formations/' . $formation['id'] . '/presences/batch');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $batchData);
    curl_setopt($ch, CURLOPT_HTTP_VERSION, CURL_HTTP_VERSION_1_1);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    echo "HTTP Code: $httpCode\n";
    $batchResponse = json_decode($response, true);
    print_r($batchResponse);
    
    if ($httpCode === 200) {
        echo "\n✅ Presences recorded successfully!\n";
    } else {
        echo "\n❌ Failed to record presences\n";
    }
}

echo "\n=== Test Complete ===\n";
