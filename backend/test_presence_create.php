<?php

require_once __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Test création d'une presence
try {
    $presence = new \App\Models\Presence();
    $presence->inscription_id = 1;
    $presence->date_session = now();
    $presence->statut = 'present';
    $presence->save();
    
    echo "✓ Presence créée avec succès!\n";
    echo "  ID: " . $presence->id . "\n";
    echo "  Inscription ID: " . $presence->inscription_id . "\n";
    echo "  Date session: " . $presence->date_session . "\n";
    echo "  Statut: " . $presence->statut . "\n";
} catch (Exception $e) {
    echo "✗ Erreur: " . $e->getMessage() . "\n";
    echo "  Code: " . $e->getCode() . "\n";
}
