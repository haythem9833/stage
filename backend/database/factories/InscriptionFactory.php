<?php

namespace Database\Factories;

use App\Models\Inscription;
use App\Models\User;
use App\Models\SessionFormation;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Inscription>
 */
class InscriptionFactory extends Factory
{
    protected $model = Inscription::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'session_formation_id' => SessionFormation::factory(),
            'etudiant_id' => User::factory()->create(['role' => 'etudiant']),
            'statut' => 'acceptee',
            'note' => null,
            'date_inscription' => fake()->dateTime(),
        ];
    }
}

