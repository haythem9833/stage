<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\DisponibiliteFormateur;
use Carbon\Carbon;
use Tests\TestCase;

class PlanningControllerTest extends TestCase
{
    protected User $formateur;
    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->formateur = User::factory()->create(['role' => 'formateur']);
        $this->admin = User::factory()->create(['role' => 'admin']);
    }

    /** @test */
    public function can_list_formateurs()
    {
        User::factory()->count(5)->create(['role' => 'formateur']);

        $response = $this->actingAs($this->formateur)
            ->getJson('/api/formateurs');

        $response->assertStatus(200)
            ->assertJsonIsArray();
    }

    /** @test */
    public function can_get_formateur_planning()
    {
        $response = $this->actingAs($this->formateur)
            ->getJson("/api/formateurs/{$this->formateur->id}/planning");

        $response->assertStatus(200)
            ->assertJsonIsObject();
    }

    /** @test */
    public function can_add_unavailability()
    {
        $dateDebut = Carbon::now()->addDay();
        $dateFin = $dateDebut->clone()->addHours(2);

        $response = $this->actingAs($this->formateur)
            ->postJson("/api/formateurs/{$this->formateur->id}/disponibilites", [
                'date_debut' => $dateDebut->format('Y-m-d H:i'),
                'date_fin' => $dateFin->format('Y-m-d H:i'),
                'type' => 'indisponibilite',
                'raison' => 'Congé personnel',
            ]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('disponibilites_formateurs', [
            'formateur_id' => $this->formateur->id,
            'raison' => 'Congé personnel',
        ]);
    }

    /** @test */
    public function can_check_availability()
    {
        $dateDebut = Carbon::now()->addDay();
        $dateFin = $dateDebut->clone()->addHours(2);

        $response = $this->actingAs($this->formateur)
            ->postJson('/api/formateurs/check-disponibilite', [
                'formateur_id' => $this->formateur->id,
                'date_debut' => $dateDebut->format('Y-m-d H:i'),
                'date_fin' => $dateFin->format('Y-m-d H:i'),
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('disponible', true);
    }

    /** @test */
    public function check_availability_detects_conflicts()
    {
        $dateDebut = Carbon::now()->addDay();
        $dateFin = $dateDebut->clone()->addHours(2);

        DisponibiliteFormateur::create([
            'formateur_id' => $this->formateur->id,
            'date_debut' => $dateDebut,
            'date_fin' => $dateFin,
            'type' => 'indisponibilite',
            'raison' => 'Meeting',
        ]);

        $response = $this->actingAs($this->formateur)
            ->postJson('/api/formateurs/check-disponibilite', [
                'formateur_id' => $this->formateur->id,
                'date_debut' => $dateDebut->addMinutes(30)->format('Y-m-d H:i'),
                'date_fin' => $dateFin->format('Y-m-d H:i'),
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('disponible', false)
            ->assertJsonIsArray('conflits');
    }

    /** @test */
    public function cannot_add_availability_without_auth()
    {
        $response = $this->postJson("/api/formateurs/{$this->formateur->id}/disponibilites", [
            'date_debut' => Carbon::now()->addDay()->format('Y-m-d H:i'),
            'date_fin' => Carbon::now()->addDay()->addHours(2)->format('Y-m-d H:i'),
            'type' => 'indisponibilite',
            'raison' => 'Test',
        ]);

        $response->assertStatus(401);
    }
}
