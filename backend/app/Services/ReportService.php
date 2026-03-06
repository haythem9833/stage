<?php

namespace App\Services;

use App\Models\SessionFormation;
use App\Models\Inscription;
use App\Models\Presence;
use App\Models\Formation;
use Carbon\Carbon;

class ReportService
{
    /**
     * Génère un CSV des présences pour une session
     */
    public function generatePresencesCSV(int $sessionId): string
    {
        $session = SessionFormation::with(['inscriptions.user', 'presences'])
            ->findOrFail($sessionId);

        $output = "sep=,\n";
        $output .= "RAPPORT DE PRÉSENCE\n";
        $output .= "Session:," . $session->titre . "\n";
        $output .= "Formation:," . $session->formation->titre . "\n";
        $output .= "Date:," . $session->date_debut->format('d/m/Y') . " - " . $session->date_fin->format('d/m/Y') . "\n";
        $output .= "\n";

        $output .= "Nom,Email,Date,Statut,Observations\n";

        foreach ($session->inscriptions as $inscription) {
            $presences = $session->presences()
                ->where('inscription_id', $inscription->id)
                ->get();

            foreach ($presences as $presence) {
                $output .= sprintf(
                    "%s,%s,%s,%s,%s\n",
                    $inscription->user->name,
                    $inscription->user->email,
                    $presence->date->format('d/m/Y'),
                    $presence->statut === 'present' ? 'Présent' : 'Absent',
                    $presence->justification ?? ''
                );
            }
        }

        return $output;
    }

    /**
     * Génère un CSV des formations
     */
    public function generateFormationsCSV(): string
    {
        $formations = Formation::with('sessions')->get();

        $output = "sep=,\n";
        $output .= "RAPPORT DES FORMATIONS\n";
        $output .= "Date d'export:," . now()->format('d/m/Y H:i') . "\n";
        $output .= "\n";

        $output .= "ID,Titre,Durée (h),Statut,Sessions,Total Inscrits\n";

        foreach ($formations as $formation) {
            $output .= sprintf(
                "%d,%s,%d,%s,%d,%d\n",
                $formation->id,
                $formation->titre,
                $formation->duree,
                $formation->statut,
                $formation->sessions->count(),
                $formation->sessions->sum(fn($s) => $s->inscriptions->count())
            );
        }

        return $output;
    }

    /**
     * Génère un CSV des inscriptions
     */
    public function generateInscriptionsCSV(int $sessionId = null): string
    {
        $query = Inscription::with(['user', 'sessionFormation.formation']);

        if ($sessionId) {
            $query->where('session_formation_id', $sessionId);
        }

        $inscriptions = $query->get();

        $output = "sep=,\n";
        $output .= "RAPPORT DES INSCRIPTIONS\n";
        $output .= "Date d'export:," . now()->format('d/m/Y H:i') . "\n";
        $output .= "\n";

        $output .= "ID,Participant,Email,Formation,Session,Date Inscription,Statut,Note\n";

        foreach ($inscriptions as $inscription) {
            $output .= sprintf(
                "%d,%s,%s,%s,%s,%s,%s,%s\n",
                $inscription->id,
                $inscription->user->name,
                $inscription->user->email,
                $inscription->sessionFormation?->formation?->titre ?? 'N/A',
                $inscription->sessionFormation?->titre ?? 'N/A',
                $inscription->created_at->format('d/m/Y'),
                ucfirst($inscription->statut),
                $inscription->note ?? ''
            );
        }

        return $output;
    }

    /**
     * Génère un bilan complet d'une session
     */
    public function generateSessionBilan(int $sessionId): array
    {
        $session = SessionFormation::with([
            'formation',
            'inscriptions.user',
            'presences'
        ])->findOrFail($sessionId);

        $inscriptions = $session->inscriptions;
        $totalInscrits = $inscriptions->count();
        $validees = $inscriptions->where('statut', 'validee')->count();
        $abandonnees = $inscriptions->where('statut', 'abandonnee')->count();

        // Calcul présences
        $totalJours = $session->date_debut->diffInDays($session->date_fin) + 1;
        $presences = $session->presences;
        $presentCount = $presences->where('statut', 'present')->count();
        $absentCount = $presences->where('statut', 'absent')->count();
        $tauxPresence = $totalInscrits > 0 ? round(($presentCount / ($totalInscrits * $totalJours)) * 100) : 0;

        return [
            'session' => [
                'id' => $session->id,
                'titre' => $session->titre,
                'formation' => $session->formation->titre,
                'date_debut' => $session->date_debut,
                'date_fin' => $session->date_fin,
                'lieu' => $session->lieu,
                'statut' => $session->statut,
            ],
            'statistiques' => [
                'total_inscrits' => $totalInscrits,
                'validees' => $validees,
                'abandonnees' => $abandonnees,
                'en_cours' => $totalInscrits - $validees - $abandonnees,
            ],
            'presences' => [
                'total_seances' => $totalJours,
                'presents' => $presentCount,
                'absents' => $absentCount,
                'taux_presence' => $tauxPresence . '%',
            ],
            'notes' => [
                'moyenne' => $inscriptions->avg('note') ?? 0,
                'minimum' => $inscriptions->min('note') ?? 0,
                'maximum' => $inscriptions->max('note') ?? 0,
            ],
            'participants' => $inscriptions->map(fn($i) => [
                'nom' => $i->user->name,
                'email' => $i->user->email,
                'statut' => $i->statut,
                'note' => $i->note,
            ])->toArray(),
        ];
    }

    /**
     * Génère un bilan sur une période
     */
    public function generatePeriodBilan(string $dateDebut, string $dateFin): array
    {
        $start = Carbon::parse($dateDebut);
        $end = Carbon::parse($dateFin);

        $sessions = SessionFormation::whereBetween('date_debut', [$start, $end])
            ->with(['formation', 'inscriptions', 'presences'])
            ->get();

        $totalSessions = $sessions->count();
        $totalInscrits = $sessions->sum(fn($s) => $s->inscriptions->count());
        $totalValidees = $sessions->sum(fn($s) => $s->inscriptions->where('statut', 'validee')->count());

        return [
            'periode' => [
                'date_debut' => $start->format('d/m/Y'),
                'date_fin' => $end->format('d/m/Y'),
            ],
            'resume' => [
                'total_sessions' => $totalSessions,
                'total_inscrits' => $totalInscrits,
                'validees' => $totalValidees,
                'taux_validation' => $totalInscrits > 0 ? round(($totalValidees / $totalInscrits) * 100) : 0,
            ],
            'sessions' => $sessions->map(fn($s) => [
                'titre' => $s->titre,
                'formation' => $s->formation->titre,
                'inscrits' => $s->inscriptions->count(),
                'validees' => $s->inscriptions->where('statut', 'validee')->count(),
            ])->toArray(),
        ];
    }
}
