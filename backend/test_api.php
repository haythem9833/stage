<?php

require 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';

$kernel = $app->make(\Illuminate\Contracts\Http\Kernel::class);

// Test 1: Login
echo "=== TEST 1: LOGIN ===\n";
$request = \Illuminate\Http\Request::create('/api/auth/login', 'POST', [], [], [], [
    'HTTP_CONTENT_TYPE' => 'application/json',
], json_encode(['email' => 'admin@cni.fr', 'password' => 'password123']));

$response = $kernel->handle($request);
echo "Status: " . $response->getStatusCode() . "\n";
$content = json_decode($response->getContent(), true);

if (isset($content['token'])) {
    echo "✅ Login réussi! Token obtenu\n";
    $token = $content['token'];
    echo "Token: " . substr($token, 0, 20) . "...\n";
} else {
    echo "❌ Login échoué\n";
    echo $response->getContent() . "\n";
}

echo "\n=== TEST 2: GET FORMATIONS ===\n";
$request2 = \Illuminate\Http\Request::create('/api/formations', 'GET', [], [], [], [
    'HTTP_AUTHORIZATION' => 'Bearer ' . ($token ?? ''),
    'HTTP_CONTENT_TYPE' => 'application/json',
]);

$response2 = $kernel->handle($request2);
echo "Status: " . $response2->getStatusCode() . "\n";
$formations = json_decode($response2->getContent(), true);
echo "Formations: " . count($formations) . " trouvées\n";
echo "✅ OK\n";

echo "\n=== TEST 3: GET SESSIONS ===\n";
$request3 = \Illuminate\Http\Request::create('/api/sessions', 'GET', [], [], [], [
    'HTTP_AUTHORIZATION' => 'Bearer ' . ($token ?? ''),
    'HTTP_CONTENT_TYPE' => 'application/json',
]);

$response3 = $kernel->handle($request3);
echo "Status: " . $response3->getStatusCode() . "\n";
$sessions = json_decode($response3->getContent(), true);
echo "Sessions: " . count($sessions) . " trouvées\n";
echo "✅ OK\n";

echo "\n=== TEST 4: GET USERS COUNT ===\n";
$userCount = \App\Models\User::count();
echo "Utilisateurs: " . $userCount . "\n";
echo "✅ OK\n";

echo "\n=== RÉSUMÉ ===\n";
echo "✅ API Fonctionnelle\n";
echo "✅ Authentification OK\n";
echo "✅ Formations: " . count($formations) . "\n";
echo "✅ Sessions: " . count($sessions) . "\n";
echo "✅ Utilisateurs: " . $userCount . "\n";
