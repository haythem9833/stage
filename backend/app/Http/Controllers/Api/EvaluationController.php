<?php

namespace App\Http\Controllers\Api;

use App\Models\Evaluation;
use App\Models\Formation;
use App\Models\Inscription;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EvaluationController extends ApiController
{
    /**
     * Récupérer l'évaluation d'une inscription
     */
    public function getEvaluation(Inscription $inscription): JsonResponse
    {
        $this->authorize('view', $inscription);

        $evaluation = $inscription->evaluation;

        if (!$evaluation) {
            return response()->json(['message' => 'Aucune évaluation trouvée'], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $evaluation->id,
                'formation_id' => $evaluation->formation_id,
                'environnement_note' => $evaluation->environnement_note,
                'environnement_commentaire' => $evaluation->environnement_commentaire,
                'formateur_note' => $evaluation->formateur_note,
                'formateur_commentaire' => $evaluation->formateur_commentaire,
                'formation_note' => $evaluation->formation_note,
                'formation_commentaire' => $evaluation->formation_commentaire,
                'services_note' => $evaluation->services_note,
                'services_commentaire' => $evaluation->services_commentaire,
                'suggestions' => $evaluation->suggestions,
                'status' => $evaluation->status,
                'submitted_at' => $evaluation->submitted_at,
                'note' => $evaluation->note,
            ],
        ]);
    }

    /**
     * Créer une nouvelle évaluation
     */
    public function createEvaluation(Inscription $inscription): JsonResponse
    {
        $this->authorize('view', $inscription);

        if (!$inscription->formation->isEvaluationOpen()) {
            return response()->json([
                'success' => false,
                'message' => 'La période d\'évaluation n\'est pas ouverte',
            ], 403);
        }

        if ($inscription->evaluation()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Vous avez déjà soumis une évaluation',
            ], 409);
        }

        $evaluation = Evaluation::create([
            'inscrit_id' => $inscription->id,
            'formation_id' => $inscription->formation_id,
            'status' => 'incomplete',
        ]);

        return response()->json([
            'success' => true,
            'data' => ['id' => $evaluation->id],
            'message' => 'Évaluation créée',
        ], 201);
    }

    /**
     * Mettre à jour une évaluation (brouillon)
     */
    public function updateEvaluation(Request $request, Evaluation $evaluation): JsonResponse
    {
        $this->authorize('update', $evaluation);

        if ($evaluation->status === 'completed') {
            return response()->json([
                'success' => false,
                'message' => 'Cette évaluation a déjà été soumise',
            ], 403);
        }

        $validated = $request->validate([
            'environnement_note' => 'nullable|integer|min:0|max:5',
            'environnement_commentaire' => 'nullable|string|max:1000',
            'formateur_note' => 'nullable|integer|min:0|max:5',
            'formateur_commentaire' => 'nullable|string|max:1000',
            'formation_note' => 'nullable|integer|min:0|max:5',
            'formation_commentaire' => 'nullable|string|max:1000',
            'services_note' => 'nullable|integer|min:0|max:5',
            'services_commentaire' => 'nullable|string|max:1000',
            'suggestions' => 'nullable|string|max:2000',
        ]);

        $evaluation->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Évaluation mise à jour',
            'data' => $evaluation,
        ]);
    }

    /**
     * Soumettre une évaluation
     */
    public function submitEvaluation(Request $request, Evaluation $evaluation): JsonResponse
    {
        $this->authorize('update', $evaluation);

        if ($evaluation->status === 'completed') {
            return response()->json([
                'success' => false,
                'message' => 'Cette évaluation a déjà été soumise',
            ], 403);
        }

        $request->validate([
            'environnement_note' => 'required|integer|min:0|max:5',
            'formateur_note' => 'required|integer|min:0|max:5',
            'formation_note' => 'required|integer|min:0|max:5',
            'services_note' => 'required|integer|min:0|max:5',
        ]);

        $evaluation->update($request->only([
            'environnement_note',
            'environnement_commentaire',
            'formateur_note',
            'formateur_commentaire',
            'formation_note',
            'formation_commentaire',
            'services_note',
            'services_commentaire',
            'suggestions',
        ]));

        $evaluation->markAsCompleted();

        return response()->json([
            'success' => true,
            'message' => 'Évaluation soumise avec succès',
            'data' => $evaluation,
        ]);
    }

    /**
     * Récupérer les formations disponibles pour évaluation
     */
    public function getFormationsForEvaluation(): JsonResponse
    {
        $user = auth()->user();

        $formations = Inscription::where('etudiant_id', $user->id)
            ->with(['formation', 'evaluation'])
            ->get()
            ->filter(function ($inscription) {
                return $inscription->formation->isEvaluationOpen();
            });

        return response()->json([
            'success' => true,
            'data' => $formations->map(fn ($inscription) => [
                'id' => $inscription->id,
                'formation' => [
                    'id' => $inscription->formation->id,
                    'titre' => $inscription->formation->titre,
                    'description' => $inscription->formation->description,
                    'formateur' => $inscription->formation->formateur->name,
                    'date_debut_evaluation' => $inscription->formation->date_debut_evaluation,
                    'date_fin_evaluation' => $inscription->formation->date_fin_evaluation,
                ],
                'evaluation' => $inscription->evaluation ? [
                    'id' => $inscription->evaluation->id,
                    'status' => $inscription->evaluation->status,
                ] : null,
                'can_evaluate' => $inscription->canEvaluate(),
            ])->values(),
        ]);
    }

    /**
     * Obtenir les statistiques d'évaluation pour une formation
     */
    public function getFormationEvaluationStats(Formation $formation): JsonResponse
    {
        $this->authorize('viewStats', [Evaluation::class, $formation]);

        $evaluations = $formation->evaluations()
            ->where('status', 'completed')
            ->get();

        if ($evaluations->isEmpty()) {
            return response()->json([
                'success' => true,
                'data' => [
                    'total_responses' => 0,
                    'average_scores' => null,
                    'participation_rate' => 0,
                ],
            ]);
        }

        $averageEnvironnement = round($evaluations->avg('environnement_note'), 2);
        $averageFormateur = round($evaluations->avg('formateur_note'), 2);
        $averageFormation = round($evaluations->avg('formation_note'), 2);
        $averageServices = round($evaluations->avg('services_note'), 2);

        $totalInscriptions = $formation->inscriptions()->count();
        $participationRate = $totalInscriptions > 0 
            ? round(($evaluations->count() / $totalInscriptions) * 100, 2)
            : 0;

        return response()->json([
            'success' => true,
            'data' => [
                'total_responses' => $evaluations->count(),
                'participation_rate' => $participationRate . '%',
                'average_scores' => [
                    'environnement' => $averageEnvironnement,
                    'formateur' => $averageFormateur,
                    'formation' => $averageFormation,
                    'services' => $averageServices,
                    'global' => round(
                        ($averageEnvironnement + $averageFormateur + $averageFormation + $averageServices) / 4,
                        2
                    ),
                ],
            ],
        ]);
    }
}
