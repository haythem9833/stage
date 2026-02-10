<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\SessionFormation;

class AddMissingSessinsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ajouter des sessions pour les formations sans sessions
        
        // CSS - Formation ID 1
        SessionFormation::create([
            'formation_id' => 1,
            'titre' => 'CSS Avancé - Session 1',
            'date_debut' => now()->addDays(7),
            'date_fin' => now()->addDays(14),
            'lieu' => 'Casablanca',
            'nombre_places' => 25,
            'statut' => 'planifiee'
        ]);
        
        // JS - Formation ID 2
        SessionFormation::create([
            'formation_id' => 2,
            'titre' => 'JavaScript - Session 1',
            'date_debut' => now()->addDays(10),
            'date_fin' => now()->addDays(17),
            'lieu' => 'Rabat',
            'nombre_places' => 30,
            'statut' => 'planifiee'
        ]);
        
        echo "✅ Sessions créées pour les formations sans sessions\n";
    }
}
