<?php

namespace Tests\Unit;

use App\Models\SessionFormation;
use App\Models\Inscription;
use App\Models\Presence;
use App\Models\User;
use App\Services\PresenceService;
use Carbon\Carbon;
use Tests\TestCase;

class PresenceServiceTest extends TestCase
{
    protected PresenceService $service;
    protected SessionFormation $session;
    protected Inscription $inscription;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->service = app(PresenceService::class);
        
        $this->session = SessionFormation::factory()->create();
        
        $etudiant = User::factory()->create(['role' => 'etudiant']);
        $this->inscription = Inscription::factory()->create([
            'etudiant_id' => $etudiant->id,
            'session_formation_id' => $this->session->id,
        ]);
    }

    /** @test */
    public function getTauxPresence_calculates_attendance_rate()
    {
        Presence::factory()->create([
            'inscription_id' => $this->inscription->id,
            'session_id' => $this->session->id,
            'statut' => 'present',
        ]);
        Presence::factory()->create([
            'inscription_id' => $this->inscription->id,
            'session_id' => $this->session->id,
            'statut' => 'absent',
        ]);

        $taux = $this->service->getTauxPresence($this->inscription->id, $this->session->id);

        $this->assertEquals(50.0, $taux);
    }

    /** @test */
    public function getTauxPresence_includes_justified_absences()
    {
        Presence::factory()->create([
            'inscription_id' => $this->inscription->id,
            'session_id' => $this->session->id,
            'statut' => 'present',
        ]);
        Presence::factory()->create([
            'inscription_id' => $this->inscription->id,
            'session_id' => $this->session->id,
            'statut' => 'justifie',
        ]);

        $taux = $this->service->getTauxPresence($this->inscription->id, $this->session->id);

        $this->assertEquals(100.0, $taux);
    }

    /** @test */
    public function getFeuillePresence_returns_attendance_sheet()
    {
        Presence::factory()->count(5)->create([
            'session_id' => $this->session->id,
        ]);

        $feuille = $this->service->getFeuillePresence($this->session->id);

        $this->assertIsArray($feuille);
        $this->assertNotEmpty($feuille);
    }

    /** @test */
    public function marquerPresences_records_attendance()
    {
        $date = Carbon::now();
        $presences = [
            $this->inscription->id => 'present',
        ];

        $results = $this->service->marquerPresences($this->session->id, $date, $presences);

        $this->assertIsArray($results);
        $this->assertNotEmpty($results);
        
        $this->assertDatabaseHas('presences', [
            'inscription_id' => $this->inscription->id,
            'statut' => 'present',
        ]);
    }

    /** @test */
    public function justifierAbsence_updates_status()
    {
        $presence = Presence::factory()->create([
            'session_id' => $this->session->id,
            'statut' => 'absent',
        ]);

        $result = $this->service->justifierAbsence($presence->id, 'Maladie');

        $this->assertEquals('justifie', $result->statut);
        
        $presence->refresh();
        $this->assertEquals('justifie', $presence->statut);
    }

    /** @test */
    public function getSynthesePresences_returns_summary()
    {
        Presence::factory()->count(10)->create([
            'session_id' => $this->session->id,
        ]);

        $synthese = $this->service->getSynthesePresences($this->session->id);

        $this->assertIsArray($synthese);
        $this->assertNotEmpty($synthese);
        $this->assertArrayHasKey('total_jours', $synthese[0]);
        $this->assertArrayHasKey('jours_presentes', $synthese[0]);
    }

    /** @test */
    public function getTauxPresence_returns_zero_when_no_presences()
    {
        $taux = $this->service->getTauxPresence($this->inscription->id, $this->session->id);

        $this->assertEquals(0.0, $taux);
    }
}
