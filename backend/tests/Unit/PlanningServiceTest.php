<?php

namespace Tests\Unit;

use App\Models\Formateur;
use App\Models\DisponibiliteFormateur;
use App\Models\SessionFormation;
use App\Services\PlanningService;
use Carbon\Carbon;
use Tests\TestCase;

class PlanningServiceTest extends TestCase
{
    protected PlanningService $service;
    protected Formateur $formateur;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->service = app(PlanningService::class);
        $this->formateur = Formateur::factory()->create(['role' => 'formateur']);
    }

    /** @test */
    public function estDisponible_returns_true_when_available()
    {
        $dateDebut = Carbon::now()->addDay();
        $dateFin = $dateDebut->clone()->addHours(2);

        $result = $this->service->estDisponible($this->formateur, $dateDebut, $dateFin);

        $this->assertTrue($result);
    }

    /** @test */
    public function estDisponible_returns_false_when_has_unavailability()
    {
        $dateDebut = Carbon::now()->addDay();
        $dateFin = $dateDebut->clone()->addHours(2);

        DisponibiliteFormateur::create([
            'formateur_id' => $this->formateur->id,
            'date_debut' => $dateDebut,
            'date_fin' => $dateFin,
            'type' => 'indisponibilite',
            'raison' => 'Congé',
        ]);

        $result = $this->service->estDisponible($this->formateur, $dateDebut, $dateFin);

        $this->assertFalse($result);
    }

    /** @test */
    public function detecterConflits_returns_empty_when_no_conflicts()
    {
        $dateDebut = Carbon::now()->addDay();
        $dateFin = $dateDebut->clone()->addHours(2);

        $conflicts = $this->service->detecterConflits($this->formateur, $dateDebut, $dateFin);

        $this->assertIsArray($conflicts);
        $this->assertEmpty($conflicts);
    }

    /** @test */
    public function detecterConflits_detects_indisponibilite()
    {
        $dateDebut = Carbon::now()->addDay();
        $dateFin = $dateDebut->clone()->addHours(2);

        DisponibiliteFormateur::create([
            'formateur_id' => $this->formateur->id,
            'date_debut' => $dateDebut,
            'date_fin' => $dateFin,
            'type' => 'indisponibilite',
            'raison' => 'Congé',
        ]);

        $conflicts = $this->service->detecterConflits($this->formateur, $dateDebut->addMinutes(30), $dateFin);

        $this->assertNotEmpty($conflicts);
    }

    /** @test */
    public function ajouterIndisponibilite_creates_record()
    {
        $dateDebut = Carbon::now()->addDay();
        $dateFin = $dateDebut->clone()->addHours(2);

        $indispo = $this->service->ajouterIndisponibilite($this->formateur, $dateDebut, $dateFin, 'Congé');

        $this->assertDatabaseHas('disponibilites_formateurs', [
            'formateur_id' => $this->formateur->id,
            'raison' => 'Congé',
        ]);
        
        $this->assertNotNull($indispo->id);
    }

    /** @test */
    public function trouverProchainCreneau_finds_available_slot()
    {
        $dateDebut = Carbon::now()->addDay();
        $dateFin = $dateDebut->clone()->addHours(2);

        DisponibiliteFormateur::create([
            'formateur_id' => $this->formateur->id,
            'date_debut' => $dateDebut,
            'date_fin' => $dateFin,
            'type' => 'indisponibilite',
            'raison' => 'Busy',
        ]);

        $creneau = $this->service->trouverProchainCreneau($this->formateur, $dateDebut);

        $this->assertIsArray($creneau);
        $this->assertArrayHasKey('date_debut', $creneau);
    }
}
