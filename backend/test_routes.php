<?php

// Test rapide avec Tinker
require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

// Afficher les routes presence
$routes = \Illuminate\Support\Facades\Route::getRoutes();

echo "Routes de presence trouvées:\n";
foreach ($routes as $route) {
    if (strpos($route->uri, 'presences') !== false) {
        echo sprintf("  %-6s %s\n", implode('|', $route->methods), $route->uri);
    }
}

echo "\nTest de connexion formation 1 inscription 1:\n";
try {
    $formation = \App\Models\Formation::find(1);
    if ($formation) {
        echo "✓ Formation 1: " . $formation->titre . "\n";
        $inscriptions = $formation->inscriptions()->get();
        echo "  Inscriptions: " . $inscriptions->count() . "\n";
        if ($inscriptions->count() > 0) {
            echo "  Première inscription ID: " . $inscriptions->first()->id . "\n";
        }
    } else {
        echo "✗ Formation 1 non trouvée\n";
    }
} catch (Exception $e) {
    echo "✗ Erreur: " . $e->getMessage() . "\n";
}
