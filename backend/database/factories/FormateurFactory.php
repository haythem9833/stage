<?php

namespace Database\Factories;

use App\Models\Formateur;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Formateur>
 */
class FormateurFactory extends Factory
{
    protected $model = Formateur::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nom' => fake()->lastName(),
            'prenom' => fake()->firstName(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => bcrypt('password'),
            'role' => 'formateur',
            'account_status' => 'approved',
            'is_formateur' => true,
            'jours_disponibles' => ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi'],
            'heure_debut_prefere' => '08:00',
            'heure_fin_prefere' => '17:00',
        ];
    }
}
