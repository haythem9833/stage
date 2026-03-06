<?php

namespace Database\Factories;

use App\Models\Ressource;
use Illuminate\Database\Eloquent\Factories\Factory;

class RessourceFactory extends Factory
{
    protected $model = Ressource::class;

    public function definition(): array
    {
        $types = ['equipement', 'mobilier', 'logiciel', 'autre'];

        return [
            'salle_id' => null,
            'nom' => $this->faker->word(),
            'type' => $this->faker->randomElement($types),
            'quantite' => $this->faker->numberBetween(1, 20),
            'etat' => 'operational',
        ];
    }

    public function maintenance(): self
    {
        return $this->state(fn (array $attributes) => [
            'etat' => 'maintenance',
        ]);
    }

    public function hors_service(): self
    {
        return $this->state(fn (array $attributes) => [
            'etat' => 'hors_service',
        ]);
    }
}
