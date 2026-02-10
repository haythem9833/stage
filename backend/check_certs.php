<?php
require 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';

$container = $app->make(Illuminate\Contracts\Container\Container::class);

$app->make(Illuminate\Contracts\Http\Kernel::class)->bootstrap();

use App\Models\Certificat;
use App\Models\Formation;
use App\Models\Inscription;

echo "=== VÉRIFICATION DES CERTIFICATS ===\n\n";

echo "Total Certificats: " . Certificat::count() . "\n";
echo "Total Formations: " . Formation::count() . "\n";
echo "Total Inscriptions: " . Inscription::count() . "\n\n";

// Afficher les derniers certificats
$lastCerts = Certificat::latest()->take(5)->get();
echo "Derniers certificats:\n";
foreach ($lastCerts as $cert) {
    echo "- ID: {$cert->id}, Etudiant: {$cert->etudiant_id}, Formation: {$cert->formation_id}, Date: {$cert->date_emission}\n";
}

// Vérifier les formations avec inscriptions
echo "\n\nFormations avec inscriptions:\n";
$formations = Formation::with('inscriptions')->get();
foreach ($formations as $formation) {
    echo "- Formation {$formation->id} ({$formation->nom}): {$formation->inscriptions->count()} inscriptions\n";
    foreach ($formation->inscriptions as $insc) {
        echo "  - Inscription {$insc->id} (Étudiant {$insc->etudiant_id}): statut = {$insc->statut}\n";
    }
}
