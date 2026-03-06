<?php

namespace Database\Factories;

use App\Models\Presence;
use App\Models\Inscription;
use Illuminate\Database\Eloquent\Factories\Factory;

class PresenceFactory extends Factory
{
    protected $model = Presence::class;

    public function definition(): array
    {
        $statuts = ['present', 'absent', 'retard', 'justifie'];

        return [
            'inscription_id' => Inscription::factory(),
            'session_id' => null,
            'date_session' => $this->faker->dateTime(),
            'statut' => $this->faker->randomElement($statuts),
        ];
    }

    public function present(): self
    {
        return $this->state(fn (array $attributes) => [
            'statut' => 'present',
        ]);
    }

    public function absent(): self
    {
        return $this->state(fn (array $attributes) => [
            'statut' => 'absent',
        ]);
    }

    public function late(): self
    {
        return $this->state(fn (array $attributes) => [
            'statut' => 'retard',
        ]);
    }

    public function justified(): self
    {
        return $this->state(fn (array $attributes) => [
            'statut' => 'justifie',
        ]);
    }
}
