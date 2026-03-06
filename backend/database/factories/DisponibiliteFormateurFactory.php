<?php

namespace Database\Factories;

use App\Models\DisponibiliteFormateur;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\Factory;

class DisponibiliteFormateurFactory extends Factory
{
    protected $model = DisponibiliteFormateur::class;

    public function definition(): array
    {
        $dateDebut = Carbon::now()->addDays($this->faker->numberBetween(1, 30))->startOfDay();
        $dateFin = $dateDebut->clone()->addHours($this->faker->numberBetween(2, 8));

        $types = ['disponibilite', 'indisponibilite', 'preferee'];

        return [
            'formateur_id' => null,
            'date_debut' => $dateDebut,
            'date_fin' => $dateFin,
            'type' => $this->faker->randomElement($types),
            'raison' => $this->faker->sentence(),
            'recurrence' => null,
        ];
    }

    public function unavailable(): self
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'indisponibilite',
            'raison' => $this->faker->randomElement(['Congé', 'Maladie', 'Réunion', 'Formation']),
        ]);
    }

    public function preferred(): self
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'preferee',
            'raison' => 'Horaire préféré',
        ]);
    }

    public function available(): self
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'disponibilite',
            'raison' => 'Disponible',
        ]);
    }
}
