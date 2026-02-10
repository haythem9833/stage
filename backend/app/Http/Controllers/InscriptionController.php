<?php

namespace App\Http\Controllers;

use App\Models\Inscription;
use App\Models\Formation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class InscriptionController extends Controller
{
    /**
     * Get all inscriptions (admin only)
     */
    public function index()
    {
        return response()->json(Inscription::with('etudiant', 'formation')->get());
    }

    /**
     * Get current user inscriptions
     */
    public function mesInscriptions()
    {
        $etudiant_id = Auth::id();
        $inscriptions = Inscription::where('etudiant_id', $etudiant_id)
            ->with('formation', 'formation.formateur')
            ->get();
        return response()->json($inscriptions);
    }

    /**
     * Subscribe to a formation
     */
    public function store(Request $request)
    {
        // Validate data
        $validated = $request->validate([
            'formation_id' => 'required|integer|exists:formations,id',
        ], [
            'formation_id.required' => 'La formation est obligatoire',
            'formation_id.integer' => 'L\'identifiant de formation doit être un nombre',
            'formation_id.exists' => 'La formation n\'existe pas',
        ]);

        $etudiant_id = Auth::id();
        $formation_id = $validated['formation_id'];

        // Check if student is already subscribed
        $existingInscription = Inscription::where('etudiant_id', $etudiant_id)
            ->where('formation_id', $formation_id)
            ->first();

        if ($existingInscription) {
            return response()->json([
                'message' => 'Vous êtes déjà inscrit à cette formation'
            ], 422);
        }

        // Create inscription
        $inscription = Inscription::create([
            'etudiant_id' => $etudiant_id,
            'formation_id' => $formation_id,
            'statut' => 'en_attente',
            'date_inscription' => now(),
        ]);

        $inscription->load('formation');

        return response()->json([
            'message' => 'Inscription enregistrée avec succès',
            'data' => $inscription
        ], 201);
    }

    /**
     * Get inscriptions for formations of current trainer
     */
    public function mesFormationsInscriptions()
    {
        try {
            $formateur_id = Auth::id();
            if (!$formateur_id) {
                return response()->json(['error' => 'Not authenticated'], 401);
            }
            
            // Get all inscriptions with their formations
            $inscriptions = Inscription::with(['formation' => function ($q) use ($formateur_id) {
                $q->where('formateur_id', $formateur_id);
            }, 'etudiant'])->get();
            
            // Filter to only inscriptions for trainer's formations
            $inscriptions = $inscriptions->filter(function ($inscription) use ($formateur_id) {
                return $inscription->formation && $inscription->formation->formateur_id == $formateur_id;
            })->values();

            return response()->json($inscriptions);
        } catch (\Exception $e) {
            \Log::error('Error in mesFormationsInscriptions: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Cancel an inscription
     */
    public function destroy($id)
    {
        $inscription = Inscription::findOrFail($id);

        // Only the student or admin can cancel
        if (Auth::id() != $inscription->etudiant_id && Auth::user()->role !== 'admin') {
            return response()->json([
                'message' => 'Non autorisé'
            ], 403);
        }

        $inscription->delete();

        return response()->json([
            'message' => 'Inscription annulée'
        ]);
    }

    /**
     * Mark inscription as completed and generate certificate
     */
    public function completer($id)
    {
        $inscription = Inscription::findOrFail($id);

        // Only trainer or admin can mark as completed
        if (Auth::user()->role !== 'admin' && Auth::user()->role !== 'formateur') {
            return response()->json([
                'message' => 'Non autorisé'
            ], 403);
        }

        // If formateur, check if it's their formation
        if (Auth::user()->role === 'formateur') {
            $formation = $inscription->formation;
            if ($formation->formateur_id !== Auth::id()) {
                return response()->json([
                    'message' => 'Vous ne pouvez terminer que les inscriptions à vos propres formations'
                ], 403);
            }
        }

        // Update status to terminez (only this inscription, not the formation)
        $inscription->update([
            'statut' => 'terminez'
        ]);

        // Generate certificate
        $certificat = \App\Models\Certificat::create([
            'etudiant_id' => $inscription->etudiant_id,
            'formation_id' => $inscription->formation_id,
            'numero_certificat' => 'CERT-' . strtoupper(substr(md5(time()), 0, 8)),
            'date_emission' => now(),
            'chemin_fichier' => 'certificates/' . time() . '-' . $inscription->etudiant_id . '.pdf',
        ]);

        return response()->json([
            'message' => 'Inscription marquée comme terminée et certificat généré',
            'data' => $inscription,
            'certificat' => $certificat
        ], 200);
    }
}
