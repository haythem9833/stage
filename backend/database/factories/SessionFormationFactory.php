<?php

namespace Database\Factories;

use App\Models\SessionFormation;
use App\Models\Formation;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\SessionFormation>
 */
class SessionFormationFactory extends Factory
{
    protected $model = SessionFormation::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $dateDebut = fake()->dateTimeBetween('+1 day', '+30 days');
        $dateFin = (clone $dateDebut)->modify('+3 hours');

        return [
            'formation_id' => Formation::factory(),
            'titre' => fake()->sentence(),
            'description' => fake()->paragraph(),
            'date_debut' => $dateDebut,
            'date_fin' => $dateFin,
            'lieu' => fake()->city(),
            'nombre_places' => fake()->numberBetween(10, 50),
            'statut' => 'planifiee',
        ];
    }
}
