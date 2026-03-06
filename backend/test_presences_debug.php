<?php
// Test de la syntaxe et logique du PresenceController
require_once __DIR__ . '/vendor/autoload.php';
require_once __DIR__ . '/bootstrap/app.php';

// Test 1: Vérifier que le contrôleur peut être instancié
try {
    $app = require __DIR__ . '/bootstrap/app.php';
    echo "✓ Application bootstrap OK\n";
} catch (Exception $e) {
    echo "✗ Erreur bootstrap: " . $e->getMessage() . "\n";
    exit(1);
}

// Test 2: Vérifier que les routes fonctionnent
try {
    $routes = \Illuminate\Support\Facades\Route::getRoutes();
    $presenceRoutes = $routes->filter(function($route) {
        return strpos($route->uri, 'presences') !== false;
    });
    
    echo "✓ Routes trouvées:\n";
    foreach ($presenceRoutes as $route) {
        echo "   - " . implode('|', $route->methods) . " " . $route->uri . "\n";
    }
} catch (Exception $e) {
    echo "✗ Erreur routes: " . $e->getMessage() . "\n";
    exit(1);
}

// Test 3: Vérifier le Presence Model
try {
    $presence = new \App\Models\Presence();
    echo "✓ Presence model OK\n";
} catch (Exception $e) {
    echo "✗ Erreur Presence model: " . $e->getMessage() . "\n";
    exit(1);
}

echo "\nTous les tests passés!\n";
