<?php

namespace Tests\Feature;

use App\Models\Presence;
use App\Models\SessionFormation;
use App\Models\Inscription;
use App\Models\User;
use Carbon\Carbon;
use Tests\TestCase;

class PresenceControllerTest extends TestCase
{
    protected User $formateur;
    protected SessionFormation $session;
    protected Inscription $inscription1;
    protected Inscription $inscription2;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->formateur = User::factory()->create(['role' => 'formateur']);
        $this->session = SessionFormation::factory()->create();
        
        $etudiant1 = User::factory()->create(['role' => 'etudiant']);
        $etudiant2 = User::factory()->create(['role' => 'etudiant']);
        
        $this->inscription1 = Inscription::factory()->create([
            'etudiant_id' => $etudiant1->id,
            'session_formation_id' => $this->session->id,
        ]);
        
        $this->inscription2 = Inscription::factory()->create([
            'etudiant_id' => $etudiant2->id,
            'session_formation_id' => $this->session->id,
        ]);
    }

    /** @test */
    public function can_batch_record_presences()
    {
        $date = Carbon::now()->format('Y-m-d');

        $response = $this->actingAs($this->formateur)
            ->postJson("/api/sessions/{$this->session->id}/presences/batch", [
                'date' => $date,
                'presences' => [
                    ['inscription_id' => $this->inscription1->id, 'statut' => 'present'],
                    ['inscription_id' => $this->inscription2->id, 'statut' => 'absent'],
                ],
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('count', 2);

        $this->assertDatabaseHas('presences', [
            'inscription_id' => $this->inscription1->id,
            'statut' => 'present',
        ]);
        
        $this->assertDatabaseHas('presences', [
            'inscription_id' => $this->inscription2->id,
            'statut' => 'absent',
        ]);
    }

    /** @test */
    public function can_list_presences()
    {
        Presence::factory()->count(5)->create([
            'session_id' => $this->session->id,
        ]);

        $response = $this->actingAs($this->formateur)
            ->getJson("/api/sessions/{$this->session->id}/presences");

        $response->assertStatus(200)
            ->assertJsonCount(5);
    }

    /** @test */
    public function can_get_presence_synthese()
    {
        Presence::factory()->create([
            'inscription_id' => $this->inscription1->id,
            'session_id' => $this->session->id,
            'statut' => 'present',
        ]);
        Presence::factory()->create([
            'inscription_id' => $this->inscription1->id,
            'session_id' => $this->session->id,
            'statut' => 'absent',
        ]);

        $response = $this->actingAs($this->formateur)
            ->getJson("/api/sessions/{$this->session->id}/presences/synthese");

        $response->assertStatus(200)
            ->assertJsonIsArray();
    }

    /** @test */
    public function can_justify_absence()
    {
        $presence = Presence::factory()->create([
            'session_id' => $this->session->id,
            'statut' => 'absent',
        ]);

        $response = $this->actingAs($this->formateur)
            ->putJson("/api/presences/{$presence->id}/justifier", [
                'raison' => 'Maladie avec certificat médical',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('presence.statut', 'justifie');

        $presence->refresh();
        $this->assertEquals('justifie', $presence->statut);
    }

    /** @test */
    public function cannot_record_presences_without_auth()
    {
        $response = $this->postJson("/api/sessions/{$this->session->id}/presences/batch", [
            'date' => Carbon::now()->format('Y-m-d'),
            'presences' => [],
        ]);

        $response->assertStatus(401);
    }

    /** @test */
    public function validation_invalid_statut()
    {
        $response = $this->actingAs($this->formateur)
            ->postJson("/api/sessions/{$this->session->id}/presences/batch", [
                'date' => Carbon::now()->format('Y-m-d'),
                'presences' => [
                    ['inscription_id' => $this->inscription1->id, 'statut' => 'invalid_statut'],
                ],
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors('presences.0.statut');
    }
}
