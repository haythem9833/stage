<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Http\Kernel::class)->bootstrap();

use App\Models\User;

$etudiant = User::where('role', 'etudiant')->first();
if ($etudiant) {
    $token = $etudiant->createToken('test')->plainTextToken;
    echo "Test pour étudiant ID: " . $etudiant->id . "\n";
    echo "Token: " . substr($token, 0, 30) . "...\n\n";
    
    // Simuler la requête
    $_SERVER['REQUEST_METHOD'] = 'GET';
    $_SERVER['REQUEST_URI'] = '/api/my-certificats';
    $_SERVER['HTTP_AUTHORIZATION'] = 'Bearer ' . $token;
    $_SERVER['HTTP_ACCEPT'] = 'application/json';
    $_SERVER['REMOTE_ADDR'] = '127.0.0.1';
    
    // Créer une requête simulée
    $request = \Illuminate\Http\Request::create('/api/my-certificats', 'GET', [], [], [], [
        'HTTP_AUTHORIZATION' => 'Bearer ' . $token,
        'HTTP_ACCEPT' => 'application/json',
    ]);
    
    // Exécuter l'action directement
    $controller = new \App\Http\Controllers\CertificatController();
    
    // Authentifier l'utilisateur
    auth()->setUser($etudiant);
    
    try {
        $response = $controller->mesCertificats();
        $json = json_encode(json_decode($response->getContent()), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        echo "Status: " . $response->status() . "\n";
        echo "Response:\n" . substr($json, 0, 500) . "\n";
    } catch (\Exception $e) {
        echo "❌ Exception: " . $e->getMessage() . "\n";
        echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
        echo "\nStack:\n" . $e->getTraceAsString() . "\n";
    }
} else {
    echo "Aucun étudiant trouvé\n";
}
