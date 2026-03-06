<?php

namespace Database\Seeders;

use App\Models\Formation;
use App\Models\SessionFormation;
use App\Models\User;
use App\Models\Inscription;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Créer un admin
        User::firstOrCreate(
            ['email' => 'admin@cni.fr'],
            [
                'nom' => 'Admin',
                'prenom' => 'CNI',
                'password' => Hash::make('Password-123'),
                'role' => 'admin',
            ]
        );

        // Créer des formateurs
        $formateur1 = User::firstOrCreate(
            ['email' => 'formateur1@cni.fr'],
            [
                'nom' => 'Dupont',
                'prenom' => 'Jean',
                'password' => Hash::make('password123'),
                'role' => 'formateur',
            ]
        );

        $formateur2 = User::firstOrCreate(
            ['email' => 'formateur2@cni.fr'],
            [
                'nom' => 'Martin',
                'prenom' => 'Marie',
                'password' => Hash::make('password123'),
                'role' => 'formateur',
            ]
        );

        // Créer des étudiants (au moins 17 pour validation auto)
        $etudiants = [];
        for ($i = 1; $i <= 20; $i++) {
            $etudiants[] = User::firstOrCreate(
                ['email' => "etudiant{$i}@cni.fr"],
                [
                    'nom' => "Etudiant{$i}",
                    'prenom' => "Prénom{$i}",
                    'password' => Hash::make('password123'),
                    'role' => 'etudiant',
                ]
            );
        }

        // Créer des formations avec formateur_id
        $formations = [
            Formation::firstOrCreate(
                ['titre' => 'Laravel Avancé'],
                [
                    'description' => 'Formation complète sur les concepts avancés de Laravel',
                    'duree' => 40,
                    'objectifs' => 'Maîtriser les patterns avancés de Laravel, les middlewares, les tests unitaires',
                    'formateur_id' => $formateur1->id,
                    'date_debut' => now()->subDays(2)->toDateString(),
                    'date_fin' => now()->addDays(18)->toDateString(),
                    'lieu' => 'Paris',
                    'nombre_places' => 25,
                    'statut' => 'en_cours',
                ]
            ),
            Formation::firstOrCreate(
                ['titre' => 'React JS'],
                [
                    'description' => 'Développement d\'applications web modernes avec React',
                    'duree' => 36,
                    'objectifs' => 'Comprendre les composants, les hooks, la gestion d\'état avec Redux',
                    'formateur_id' => $formateur2->id,
                    'date_debut' => now()->subDays(5)->toDateString(),
                    'date_fin' => now()->addDays(20)->toDateString(),
                    'lieu' => 'Lyon',
                    'nombre_places' => 30,
                    'statut' => 'en_cours',
                ]
            ),
            Formation::firstOrCreate(
                ['titre' => 'API REST avec Node.js'],
                [
                    'description' => 'Création d\'APIs RESTful performantes avec Node.js et Express',
                    'duree' => 32,
                    'objectifs' => 'Développer des APIs sécurisées, scalables et bien documentées',
                    'formateur_id' => $formateur1->id,
                    'date_debut' => now()->subDays(10)->toDateString(),
                    'date_fin' => now()->addDays(5)->toDateString(),
                    'lieu' => 'Marseille',
                    'nombre_places' => 20,
                    'statut' => 'en_cours',
                ]
            ),
        ];

        // Inscrire les étudiants aux formations
        // Formation 1: Laravel Avancé (formateur1) - inscrire 15 étudiants
        for ($i = 0; $i < 15; $i++) {
            Inscription::firstOrCreate(
                ['etudiant_id' => $etudiants[$i]->id, 'formation_id' => $formations[0]->id],
                ['statut' => 'acceptee']
            );
        }

        // Formation 2: React JS (formateur2) - inscrire 18 étudiants
        for ($i = 0; $i < 18; $i++) {
            Inscription::firstOrCreate(
                ['etudiant_id' => $etudiants[$i]->id, 'formation_id' => $formations[1]->id],
                ['statut' => 'acceptee']
            );
        }

        // Formation 3: API REST (formateur1) - inscrire 12 étudiants
        for ($i = 0; $i < 12; $i++) {
            Inscription::firstOrCreate(
                ['etudiant_id' => $etudiants[$i]->id, 'formation_id' => $formations[2]->id],
                ['statut' => 'acceptee']
            );
        }

        // Créer des sessions de formation (legacy, pour compatibilité)
        SessionFormation::firstOrCreate(
            ['formation_id' => $formations[0]->id, 'titre' => 'Laravel Avancé - Session 1'],
            [
                'description' => 'Première session de formation Laravel',
                'date_debut' => now()->subDays(2)->toDateString(),
                'date_fin' => now()->addDays(18)->toDateString(),
                'lieu' => 'Paris',
                'nombre_places' => 25,
                'statut' => 'en_cours',
            ]
        );

        SessionFormation::firstOrCreate(
            ['formation_id' => $formations[1]->id, 'titre' => 'React JS - Session 1'],
            [
                'description' => 'Première session de formation React',
                'date_debut' => now()->subDays(5)->toDateString(),
                'date_fin' => now()->addDays(20)->toDateString(),
                'lieu' => 'Lyon',
                'nombre_places' => 30,
                'statut' => 'en_cours',
            ]
        );

        SessionFormation::firstOrCreate(
            ['formation_id' => $formations[2]->id, 'titre' => 'API REST - Session 1'],
            [
                'description' => 'Première session de formation API REST',
                'date_debut' => now()->subDays(10)->toDateString(),
                'date_fin' => now()->addDays(5)->toDateString(),
                'lieu' => 'Marseille',
                'nombre_places' => 20,
                'statut' => 'en_cours',
            ]
        );
    }
}
