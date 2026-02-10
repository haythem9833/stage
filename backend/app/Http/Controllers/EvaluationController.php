<?php

namespace App\Http\Controllers;

use App\Models\Evaluation;
use App\Models\Inscription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class EvaluationController extends Controller
{
    /**
     * Créer une évaluation de formation
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'inscription_id' => 'required|integer|exists:inscriptions,id',
            'note' => 'required|integer|between:0,5',
            'commentaire' => 'nullable|string|max:1000',
        ], [
            'inscription_id.required' => 'L\'inscription est obligatoire',
            'inscription_id.exists' => 'L\'inscription n\'existe pas',
            'note.required' => 'La note est obligatoire',
            'note.between' => 'La note doit être entre 0 et 5',
        ]);

        $etudiant_id = Auth::id();
        $inscription = Inscription::findOrFail($validated['inscription_id']);
        
        // Vérifier que l'inscription appartient à l'utilisateur
        if ($inscription->etudiant_id !== $etudiant_id) {
            return response()->json([
                'message' => 'Non autorisé'
            ], 403);
        }

        // Vérifier qu'il n'existe pas déjà une évaluation
        $existing = Evaluation::where('inscrit_id', $validated['inscription_id'])
            ->where('formation_id', $inscription->formation_id)
            ->exists();
        
        if ($existing) {
            return response()->json([
                'message' => 'Vous avez déjà évalué cette formation'
            ], 422);
        }

        // Créer l'évaluation
        // Vérifier que l'inscription a bien une session associée (champ requis en base)
        if (empty($inscription->session_formation_id)) {
            return response()->json([
                'message' => 'Impossible de créer l\'évaluation : session de formation introuvable pour cette inscription'
            ], 422);
        }

        $evaluation = Evaluation::create([
            'inscrit_id' => $validated['inscription_id'],
            'formation_id' => $inscription->formation_id,
            'session_formation_id' => $inscription->session_formation_id,
            'note' => $validated['note'],
            'commentaire' => $validated['commentaire'] ?? null,
        ]);

        return response()->json([
            'message' => 'Évaluation enregistrée avec succès',
            'data' => $evaluation
        ], 201);
    }

    /**
     * Récupérer les évaluations d'une session
     */
    public function showSessionEvaluations($session_id)
    {
        $evaluations = Evaluation::where('session_formation_id', $session_id)
            ->with('inscription.etudiant')
            ->get();
        
        // Calculer la note moyenne
        $moyenneNote = $evaluations->avg('note');
        
        return response()->json([
            'evaluations' => $evaluations,
            'nombre_evaluations' => $evaluations->count(),
            'moyenne_note' => round($moyenneNote, 2)
        ]);
    }
}
