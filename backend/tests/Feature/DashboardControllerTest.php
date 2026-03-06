<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Formation;
use App\Models\SessionFormation;
use App\Models\Inscription;
use App\Models\Presence;
use Carbon\Carbon;
use Tests\TestCase;

class DashboardControllerTest extends TestCase
{
    protected User $admin;
    protected User $formateur;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->admin = User::factory()->create(['role' => 'admin']);
        $this->formateur = User::factory()->create(['role' => 'formateur']);
    }

    /** @test */
    public function can_get_dashboard_stats()
    {
        $formation = Formation::factory()->create();
        $session = SessionFormation::factory()->create(['formation_id' => $formation->id]);
        
        $etudiant = User::factory()->create(['role' => 'etudiant']);
        Inscription::factory()->create([
            'etudiant_id' => $etudiant->id,
            'session_formation_id' => $session->id,
        ]);

        $response = $this->actingAs($this->admin)
            ->getJson('/api/admin/dashboard-v2/stats');

        $response->assertStatus(200)
            ->assertJsonIsObject()
            ->assertJsonStructure([
                'kpis' => ['total_formations', 'total_participants'],
                'sessions' => ['total'],
            ]);
    }

    /** @test */
    public function can_get_formations_stats()
    {
        Formation::factory()->count(3)->create();
        
        $response = $this->actingAs($this->admin)
            ->getJson('/api/admin/dashboard-v2/formations-stats');

        $response->assertStatus(200)
            ->assertJsonIsArray();
    }

    /** @test */
    public function can_get_presences_stats()
    {
        $formation = Formation::factory()->create();
        $session = SessionFormation::factory()->create(['formation_id' => $formation->id]);
        
        $etudiant = User::factory()->create(['role' => 'etudiant']);
        $inscription = Inscription::factory()->create([
            'etudiant_id' => $etudiant->id,
            'session_formation_id' => $session->id,
        ]);
        
        Presence::factory()->count(10)->create([
            'inscription_id' => $inscription->id,
            'session_id' => $session->id,
            'statut' => 'present',
        ]);

        $response = $this->actingAs($this->admin)
            ->getJson('/api/admin/dashboard-v2/presences-stats');

        $response->assertStatus(200)
            ->assertJsonIsObject()
            ->assertJsonStructure(['total_enregistrements', 'par_statut', 'taux_presence']);
    }

    /** @test */
    public function cannot_access_dashboard_without_auth()
    {
        $response = $this->getJson('/api/admin/dashboard-v2/stats');

        $response->assertStatus(401);
    }

    /** @test */
    public function cannot_access_dashboard_as_formateur()
    {
        $response = $this->actingAs($this->formateur)
            ->getJson('/api/admin/dashboard-v2/stats');

        $response->assertStatus(403);
    }
}
