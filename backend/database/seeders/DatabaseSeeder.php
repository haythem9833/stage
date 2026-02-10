<?php

namespace Database\Seeders;

use App\Models\Formation;
use App\Models\SessionFormation;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Créer un admin
        User::create([
            'nom' => 'Admin',
            'prenom' => 'CNI',
            'email' => 'admin@cni.fr',
            'password' => Hash::make('Password-123'),
            'role' => 'admin',
        ]);

        // Créer des formateurs
        User::create([
            'nom' => 'Dupont',
            'prenom' => 'Jean',
            'email' => 'formateur1@cni.fr',
            'password' => Hash::make('password123'),
            'role' => 'formateur',
        ]);

        User::create([
            'nom' => 'Martin',
            'prenom' => 'Marie',
            'email' => 'formateur2@cni.fr',
            'password' => Hash::make('password123'),
            'role' => 'formateur',
        ]);

        // Créer des étudiants (au moins 17 pour validation auto)
        for ($i = 1; $i <= 20; $i++) {
            User::create([
                'nom' => "Etudiant{$i}",
                'prenom' => "Prénom{$i}",
                'email' => "etudiant{$i}@cni.fr",
                'password' => Hash::make('password123'),
                'role' => 'etudiant',
            ]);
        }

        // Créer des formations
        $formations = [
            Formation::create([
                'titre' => 'Laravel Avancé',
                'description' => 'Formation complète sur les concepts avancés de Laravel',
                'duree' => 40,
                'objectifs' => 'Maîtriser les patterns avancés de Laravel, les middlewares, les tests unitaires',
            ]),
            Formation::create([
                'titre' => 'React JS',
                'description' => 'Développement d\'applications web modernes avec React',
                'duree' => 36,
                'objectifs' => 'Comprendre les composants, les hooks, la gestion d\'état avec Redux',
            ]),
            Formation::create([
                'titre' => 'API REST avec Node.js',
                'description' => 'Création d\'APIs RESTful performantes avec Node.js et Express',
                'duree' => 32,
                'objectifs' => 'Développer des APIs sécurisées, scalables et bien documentées',
            ]),
        ];

        // Créer des sessions de formation
        SessionFormation::create([
            'formation_id' => $formations[0]->id,
            'titre' => 'Laravel Avancé - Session 1',
            'description' => 'Première session de formation Laravel',
            'date_debut' => now()->addDays(5)->toDateString(),
            'date_fin' => now()->addDays(20)->toDateString(),
            'lieu' => 'Paris',
            'nombre_places' => 25,
            'statut' => 'planifiee',
        ]);

        SessionFormation::create([
            'formation_id' => $formations[1]->id,
            'titre' => 'React JS - Session 1',
            'description' => 'Première session de formation React',
            'date_debut' => now()->addDays(10)->toDateString(),
            'date_fin' => now()->addDays(25)->toDateString(),
            'lieu' => 'Lyon',
            'nombre_places' => 30,
            'statut' => 'planifiee',
        ]);

        SessionFormation::create([
            'formation_id' => $formations[2]->id,
            'titre' => 'API REST - Session 1',
            'description' => 'Première session de formation API REST',
            'date_debut' => now()->subDays(20)->toDateString(),
            'date_fin' => now()->subDays(5)->toDateString(),
            'lieu' => 'Marseille',
            'nombre_places' => 20,
            'statut' => 'validee',
        ]);
    }
}
