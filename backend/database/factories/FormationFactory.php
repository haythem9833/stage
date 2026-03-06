<?php

namespace Database\Factories;

use App\Models\Formation;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Formation>
 */
class FormationFactory extends Factory
{
    protected $model = Formation::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $dateDebut = fake()->dateTimeBetween('+1 day', '+30 days');
        $dateFin = (clone $dateDebut)->modify('+30 days');

        return [
            'formateur_id' => User::factory()->create(['role' => 'formateur']),
            'titre' => fake()->sentence(),
            'description' => fake()->paragraph(),
            'duree' => fake()->numberBetween(1, 40),
            'statut' => 'planifiee',
            'date_debut' => $dateDebut,
            'date_fin' => $dateFin,
            'date_debut_evaluation' => (clone $dateFin)->modify('+1 day'),
            'date_fin_evaluation' => (clone $dateFin)->modify('+5 days'),
        ];
    }
}
