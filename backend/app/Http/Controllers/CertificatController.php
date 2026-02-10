<?php

namespace App\Http\Controllers;

use App\Models\Certificat;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CertificatController extends Controller
{
    
    public function index()
    {
        try {
            return response()->json(Certificat::with('etudiant', 'formation')->get());
        } catch (\Exception $e) {
            \Log::error('Erreur index certificats: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erreur lors de la récupération des certificats',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    
    public function show($id)
    {
        try {
            $certificat = Certificat::with('etudiant', 'formation')->findOrFail($id);
            return response()->json($certificat);
        } catch (\Exception $e) {
            \Log::error('Erreur show certificat: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erreur lors de la récupération du certificat',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    
    public function mesCertificats()
    {
        try {
            $etudiant_id = Auth::id();
            $certificats = Certificat::where('etudiant_id', $etudiant_id)
                ->with('formation', 'etudiant')
                ->get();
            return response()->json($certificats);
        } catch (\Exception $e) {
            \Log::error('Erreur mesCertificats: ' . $e->getMessage() . ' - ' . $e->getFile() . ':' . $e->getLine());
            return response()->json([
                'message' => 'Erreur lors de la récupération des certificats',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    
    public function generer($id)
    {
        try {
            $inscription = \App\Models\Inscription::findOrFail($id);
            
            $certificat = Certificat::create([
                'etudiant_id' => $inscription->etudiant_id,
                'formation_id' => $inscription->formation_id,
                'numero_certificat' => 'CERT-' . strtoupper(substr(md5(time() . $inscription->id), 0, 8)),
                'date_emission' => now(),
                'chemin_fichier' => 'certificates/' . time() . '-' . $inscription->etudiant_id . '.pdf',
            ]);

            return response()->json($certificat, 201);
        } catch (\Exception $e) {
            \Log::error('Erreur generer certificat: ' . $e->getMessage() . ' - ' . $e->getFile() . ':' . $e->getLine());
            return response()->json([
                'message' => 'Erreur lors de la génération du certificat',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    
    public function store(Request $request)
    {
        try {
            $certificat = Certificat::create($request->all());
            return response()->json($certificat, 201);
        } catch (\Exception $e) {
            \Log::error('Erreur store certificat: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erreur lors de la création du certificat',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    
    public function mesFormationsCertificats()
    {
        try {
            $formateur_id = Auth::id();
            if (!$formateur_id) {
                return response()->json(['error' => 'Not authenticated'], 401);
            }
            
            // Get all certificats with their formation and etudiant data
            $certificats = Certificat::with(['formation' => function ($q) {
                $q->select('id', 'formateur_id', 'nom', 'description');
            }, 'etudiant'])->get();
            
            // Filter to only those for trainer's formations
            $certificats = $certificats->filter(function ($cert) use ($formateur_id) {
                return $cert->formation && 
                       $cert->formation->formateur_id == $formateur_id;
            })->values();
            
            return response()->json($certificats);
        } catch (\Exception $e) {
            \Log::error('Error in mesFormationsCertificats: ' . $e->getMessage() . ' - ' . $e->getFile() . ':' . $e->getLine());
            return response()->json([
                'message' => 'Erreur lors de la récupération des certificats',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a certificat
     */
    public function destroy($id)
    {
        try {
            Certificat::destroy($id);
            return response()->json(['message' => 'Certificat supprimé'], 200);
        } catch (\Exception $e) {
            \Log::error('Erreur destroy certificat: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erreur lors de la suppression du certificat',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Download a certificat as PDF
     */
    public function download($id)
    {
        try {
            $certificat = Certificat::with('etudiant', 'formation')->findOrFail($id);
            
            // Generate PDF using DomPDF
            $pdf = \App::make('dompdf.wrapper');
            $html = \view('certificats.template', ['certificat' => $certificat])->render();
            $pdf->loadHTML($html);
            
            $filename = 'Certificat_' . $certificat->numero_certificat . '.pdf';
            
            return $pdf->download($filename);
        } catch (\Exception $e) {
            \Log::error('Erreur download certificat: ' . $e->getMessage() . ' - ' . $e->getFile() . ':' . $e->getLine());
            return response()->json([
                'message' => 'Erreur lors du téléchargement du certificat',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
