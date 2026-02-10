<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';

// Bootstrap Laravel
$app->make(\Illuminate\Contracts\Http\Kernel::class)->bootstrap();

use App\Models\Certificat;

// Get a certificate
$cert = Certificat::with('etudiant', 'formation')->first();

if (!$cert) {
    echo "Aucun certificat trouvé\n";
    exit(1);
}

echo "Tentative de génération du PDF pour certificat ID: " . $cert->id . "\n";

try {
    // Try to render the view first
    echo "\n1. Tentative de rendu de la vue...\n";
    $html = \view('certificats.template', ['certificat' => $cert])->render();
    echo "✅ Vue rendue avec succès (" . strlen($html) . " bytes)\n";
    
    // Try to create PDF
    echo "\n2. Tentative de création du PDF...\n";
    $pdf = \App::make('dompdf.wrapper');
    $pdf->loadHTML($html);
    echo "✅ PDF créé avec succès\n";
    
    // Try to get PDF output
    echo "\n3. Tentative d'obtenir la sortie PDF...\n";
    $output = $pdf->output();
    echo "✅ Sortie PDF générée (" . strlen($output) . " bytes)\n";
    
    echo "\n✅ Le téléchargement devrait fonctionner!\n";
    
} catch (\Exception $e) {
    echo "❌ Erreur: " . $e->getMessage() . "\n";
    echo "Fichier: " . $e->getFile() . ":" . $e->getLine() . "\n";
    echo "\nStack trace:\n";
    echo $e->getTraceAsString() . "\n";
}
