<?php
require 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';

use App\Models\Formation;
use App\Models\User;

// Récupérer un formateur
$formateur = User::where('role', 'formateur')->first();
$formation = Formation::with('inscriptions')->first();

echo "=== TEST DE L'ENDPOINT ===\n\n";
echo "Formateur trouvé: " . ($formateur ? "Oui (ID: {$formateur->id})" : "Non") . "\n";
echo "Formation trouvée: " . ($formation ? "Oui (ID: {$formation->id})" : "Non") . "\n";

if ($formation) {
    echo "Inscriptions pour cette formation: " . $formation->inscriptions->count() . "\n";
    foreach ($formation->inscriptions as $insc) {
        echo "  - Inscription {$insc->id}: Étudiant {$insc->etudiant_id}, Statut: {$insc->statut}\n";
    }
}

// Tester le endpoint
if ($formateur && $formation) {
    // Créer un token
    $token = $formateur->createToken('test-token')->plainTextToken;
    
    echo "\n\n=== APPEL API (Test manuel) ===\n";
    echo "URL: http://localhost:8000/api/formations/{$formation->id}/complete-all\n";
    echo "Méthode: POST\n";
    echo "Token: Bearer " . substr($token, 0, 20) . "...\n";
    echo "\nVeuillez faire un POST à cette URL avec ce token pour tester.\n";
}
