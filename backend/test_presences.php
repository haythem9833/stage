<?php

// Test script to verify presences table structure

$dbPath = __DIR__;
require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use App\Models\Presence;
use App\Models\Formation;
use App\Models\Inscription;
use App\Models\User;

echo "=== Presences Table Structure ===\n";
$columns = Schema::getColumnListing('presences');
echo "Columns: " . implode(", ", $columns) . "\n\n";

echo "=== Test Data ===\n";
echo "Formations count: " . Formation::count() . "\n";
echo "Inscriptions count: " . Inscription::count() . "\n";
echo "Presences count: " . Presence::count() . "\n";

echo "\n=== Sample Formation with Inscriptions ===\n";
$formation = Formation::with('inscriptions.user')->first();
if ($formation) {
    echo "Formation: " . $formation->titre . "\n";
    echo "Formateur: " . ($formation->formateur?->prenom ?? 'N/A') . "\n";
    echo "Date début: " . $formation->date_debut . "\n";
    echo "Inscriptions: " . $formation->inscriptions->count() . "\n";
    echo "First 3 inscriptions:\n";
    foreach ($formation->inscriptions->take(3) as $i => $inscription) {
        echo "  " . ($i+1) . ". " . $inscription->user->prenom . " " . $inscription->user->nom . "\n";
    }
}

echo "\n=== Create Test Presence ===\n";
if ($formation && $formation->inscriptions->count() > 0) {
    $inscription = $formation->inscriptions->first();
    $presence = Presence::updateOrCreate(
        [
            'inscription_id' => $inscription->id,
            'formation_id' => $formation->id,
            'date_session' => now()->toDateString(),
        ],
        [
            'statut' => 'present',
            'is_active' => true,
        ]
    );
    echo "Created/Updated presence: " . $presence->id . "\n";
    echo "Inscription: " . $presence->inscription_id . "\n";
    echo "Formation: " . $presence->formation_id . "\n";
    echo "Date: " . $presence->date_session . "\n";
    echo "Status: " . $presence->statut . "\n";
}

echo "\n=== Success! ===\n";
