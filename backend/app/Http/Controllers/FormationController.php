<?php

namespace App\Http\Controllers;

use App\Models\Formation;
use App\Models\User;
use App\Models\Certificat;
use App\Models\Presence;
use Illuminate\Http\Request;

class FormationController extends Controller
{
    /**
     * GET /api/formations
     * Retrieve all formations
     */
    public function index()
    {
        $formations = Formation::with('formateur:id,nom,prenom,email,role', 'inscriptions.user:id,nom,prenom,email')->get();
        
        // Ajouter le nombre d'inscrits pour chaque formation
        $formations->each(function($formation) {
            $formation->inscrits = $formation->inscriptions()->count();
            $formation->statut_formation = $formation->inscrits >= 2 ? 'commencee' : 'ouverte';
        });
        
        return response()->json($formations);
    }

    /**
     * GET /api/formations/{id}
     * Retrieve a specific formation
     */
    public function show(Formation $formation)
    {
        $formation->load('formateur:id,nom,prenom,email,role');
        $formation->load('inscriptions.user:id,nom,prenom,email');
        
        // Ajouter le nombre d'inscrits
        $formation->inscrits = $formation->inscriptions()->count();
        $formation->statut_formation = $formation->inscrits >= 2 ? 'commencee' : 'ouverte';
        $formation->inscrit = auth()->check() && $formation->inscriptions()
            ->where('etudiant_id', auth()->id())
            ->exists();
        
        return response()->json($formation);
    }

    /**
     * POST /api/formations
     * Create a new formation
     */
    public function store(Request $request)
    {
        try {
            $authUser = $request->user();
            $isAdmin = $authUser && $authUser->role === 'admin';
            $isFormateur = $authUser && $authUser->role === 'formateur';

            $rules = [
                'titre' => 'required|string|max:255',
                'description' => 'required|string',
                'duree' => 'required|integer|min:1',
            ];

            // Admin must assign a formateur; formateur is auto-assigned.
            if ($isAdmin) {
                $rules['formateur_id'] = 'required|integer|exists:users,id';
            }

            $validated = $request->validate($rules);

            if ($isFormateur) {
                $validated['formateur_id'] = $authUser->id;
            } elseif ($isAdmin) {
                $candidate = User::find($validated['formateur_id']);
                if (!$candidate || $candidate->role !== 'formateur') {
                    return response()->json([
                        'message' => 'Le formateur sélectionné est invalide',
                        'errors' => ['formateur_id' => ['Le compte choisi doit avoir le rôle formateur']]
                    ], 422);
                }
            }

            $formation = Formation::create($validated);

            return response()->json([
                'message' => 'Formation créée avec succès',
                'data' => $formation->load('formateur:id,nom,prenom,email,role')
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Erreur de validation',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la création',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * PUT/PATCH /api/formations/{id}
     * Update a formation
     */
    public function update(Request $request, Formation $formation)
    {
        try {
            $authUser = $request->user();
            $isAdmin = $authUser && $authUser->role === 'admin';
            $isFormateur = $authUser && $authUser->role === 'formateur';

            // Formateur can only edit their own formations
            if ($isFormateur && (int) $formation->formateur_id !== (int) $authUser->id) {
                return response()->json([
                    'message' => 'Accès refusé - vous ne pouvez modifier que vos formations'
                ], 403);
            }

            $rules = [
                'titre' => 'sometimes|required|string|max:255',
                'description' => 'sometimes|required|string',
                'duree' => 'sometimes|required|integer|min:1',
            ];

            // Admin may reassign; formateur cannot change formateur_id
            if ($isAdmin) {
                $rules['formateur_id'] = 'sometimes|required|integer|exists:users,id';
            }

            $validated = $request->validate($rules);

            if ($isFormateur) {
                unset($validated['formateur_id']);
            } elseif ($isAdmin && array_key_exists('formateur_id', $validated)) {
                $candidate = User::find($validated['formateur_id']);
                if (!$candidate || $candidate->role !== 'formateur') {
                    return response()->json([
                        'message' => 'Le formateur sélectionné est invalide',
                        'errors' => ['formateur_id' => ['Le compte choisi doit avoir le rôle formateur']]
                    ], 422);
                }
            }

            $formation->update($validated);

            return response()->json([
                'message' => 'Formation mise à jour avec succès',
                'data' => $formation->load(['formateur:id,nom,prenom,email,role'])
            ], 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Erreur de validation',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la mise à jour',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * POST /api/formations/{formation}/start
     * Start a formation - sets date_debut to now and marks presences as active
     */
    public function start(Formation $formation)
    {
        try {
            $authUser = request()->user();
            $isAdmin = $authUser && $authUser->role === 'admin';
            $isFormateur = $authUser && $authUser->role === 'formateur';

            // Only trainer or admin can start
            if (!$isAdmin && !$isFormateur) {
                return response()->json([
                    'message' => 'Non autorisé'
                ], 403);
            }

            // If formateur, check if it's their formation
            if ($isFormateur && (int) $formation->formateur_id !== (int) $authUser->id) {
                return response()->json([
                    'message' => 'Vous ne pouvez démarrer que vos propres formations'
                ], 403);
            }

            // Update formation status and set date_debut if not set
            $formation->update([
                'statut' => 'en_cours',
                'date_debut' => $formation->date_debut ?: now(),
            ]);

            return response()->json([
                'message' => 'Formation démarrée - Prise de présence activée',
                'formation' => $formation
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors du démarrage de la formation',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * POST /api/formations/{id}/complete-all
     * Mark all inscriptions for a formation as completed
     * Generates certificates for all students at once
     */
    public function completerTous(Formation $formation)
    {
        try {
            \Log::info('=== DEBUT COMPLETERTOUS ===');
            \Log::info('Formation ID: ' . $formation->id);
            
            $authUser = request()->user();
            \Log::info('Auth User: ' . ($authUser ? $authUser->id : 'null'));
            
            $isAdmin = $authUser && $authUser->role === 'admin';
            $isFormateur = $authUser && $authUser->role === 'formateur';
            
            \Log::info('isAdmin: ' . ($isAdmin ? 'true' : 'false') . ', isFormateur: ' . ($isFormateur ? 'true' : 'false'));

            // Only trainer or admin can complete
            if (!$isAdmin && !$isFormateur) {
                \Log::warning('Accès refusé - ni admin ni formateur');
                return response()->json([
                    'message' => 'Non autorisé'
                ], 403);
            }

            // If formateur, check if it's their formation
            if ($isFormateur && (int) $formation->formateur_id !== (int) $authUser->id) {
                \Log::warning('Accès refusé - formation_id mismatch');
                return response()->json([
                    'message' => 'Vous ne pouvez terminer que vos propres formations'
                ], 403);
            }

            // Get all inscriptions for this formation
            $inscriptions = $formation->inscriptions()->get();
            \Log::info('Inscriptions trouvées: ' . $inscriptions->count());

            if ($inscriptions->isEmpty()) {
                \Log::warning('Aucune inscription pour cette formation');
                return response()->json([
                    'message' => 'Aucune inscription à terminer pour cette formation'
                ], 400);
            }

            // Mark all as completed and generate certificates (only for those with good attendance)
            $certificats = [];
            $certificatsNonGeneres = [];
            $minPresenceRate = 70; // 70% minimum attendance required for certificate
            
            foreach ($inscriptions as $inscription) {
                try {
                    \Log::info('Traitement inscription ' . $inscription->id . ' (étudiant: ' . $inscription->etudiant_id . ')');
                    
                    $inscription->update([
                        'statut' => 'terminez'
                    ]);
                    \Log::info('Inscription ' . $inscription->id . ' marquée comme terminez');

                    // Calculate presence rate for this student
                    $presences = Presence::where('inscription_id', $inscription->id)
                        ->where('formation_id', $inscription->formation_id)
                        ->get();
                    
                    $present = $presences->whereIn('statut', ['present', 'justifie'])->count();
                    $total = $presences->count();
                    $presenceRate = $total > 0 ? ($present / $total) * 100 : 0;
                    
                    \Log::info('Étudiant ' . $inscription->etudiant_id . ' - Taux de présence: ' . $presenceRate . '% (Present: ' . $present . '/' . $total . ')');
                    
                    // Only generate certificate if presence rate meets minimum requirement
                    if ($presenceRate >= $minPresenceRate) {
                        $certificat = Certificat::create([
                            'etudiant_id' => $inscription->etudiant_id,
                            'formation_id' => $inscription->formation_id,
                            'numero_certificat' => 'CERT-' . strtoupper(substr(md5(time() . $inscription->id), 0, 8)),
                            'date_emission' => now(),
                            'chemin_fichier' => 'certificates/' . time() . '-' . $inscription->etudiant_id . '.pdf',
                        ]);
                        
                        \Log::info('Certificat créé pour étudiant ' . $inscription->etudiant_id . ': ' . $certificat->id);
                        $certificats[] = $certificat;
                    } else {
                        \Log::info('Certificat NON généré pour étudiant ' . $inscription->etudiant_id . ' (présence insuffisante: ' . $presenceRate . '%)');
                        $certificatsNonGeneres[] = [
                            'etudiant_id' => $inscription->etudiant_id,
                            'presence_rate' => $presenceRate,
                            'reason' => 'Taux de présence insuffisant (' . round($presenceRate, 2) . '%)'
                        ];
                    }
                } catch (\Exception $certError) {
                    // Continue avec les autres inscriptions même si une échoue
                    \Log::error('Erreur traitement inscription ' . $inscription->id . ': ' . $certError->getMessage() . ' - ' . $certError->getFile() . ':' . $certError->getLine());
                }
            }

            // Update formation status
            $formation->update([
                'statut' => 'terminee'
            ]);
            \Log::info('Formation marquée comme terminee');

            \Log::info('=== FIN COMPLETERTOUS - SUCCESS ===');
            return response()->json([
                'message' => 'Formation terminée - Certificats générés selon le taux de présence',
                'inscrits_termines' => $inscriptions->count(),
                'certificats_generes' => count($certificats),
                'certificats_non_generes' => count($certificatsNonGeneres),
                'min_presence_required' => $minPresenceRate . '%',
                'data' => [
                    'formation' => $formation,
                    'inscriptions' => $inscriptions,
                    'certificats' => $certificats,
                    'certificats_non_generes' => $certificatsNonGeneres
                ]
            ], 200);
        } catch (\Exception $e) {
            \Log::error('Erreur completerTous: ' . $e->getMessage() . ' - ' . $e->getFile() . ':' . $e->getLine());
            return response()->json([
                'message' => 'Erreur lors de la terminaison de la formation',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * DELETE /api/formations/{id}
     * Delete a formation
     */
    public function destroy(Formation $formation)
    {
        try {
            $authUser = request()->user();
            $isAdmin = $authUser && $authUser->role === 'admin';
            $isFormateur = $authUser && $authUser->role === 'formateur';

            if ($isFormateur && (int) $formation->formateur_id !== (int) $authUser->id) {
                return response()->json([
                    'message' => 'Accès refusé - vous ne pouvez supprimer que vos formations'
                ], 403);
            }

            $formation->delete();
            
            return response()->json([
                'message' => 'Formation supprimée avec succès'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la suppression',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}