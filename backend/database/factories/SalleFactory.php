<?php

namespace Database\Factories;

use App\Models\Salle;
use Illuminate\Database\Eloquent\Factories\Factory;

class SalleFactory extends Factory
{
    protected $model = Salle::class;

    public function definition(): array
    {
        return [
            'nom' => $this->faker->unique()->word() . ' Room',
            'capacite_max' => $this->faker->numberBetween(10, 100),
            'equipements' => json_encode([
                'videoprojecteur' => $this->faker->boolean(),
                'tableau_blanc' => $this->faker->boolean(),
                'wifi' => true,
                'climatisation' => true,
            ]),
            'localisation' => $this->faker->address(),
        ];
    }
}
