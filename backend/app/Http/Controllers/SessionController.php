<?php

namespace App\Http\Controllers;

use App\Models\SessionFormation;
use Illuminate\Http\Request;

class SessionController extends Controller
{
    
    public function index()
    {
        return response()->json(SessionFormation::with('formation')->get());
    }

    
    public function show($id)
    {
        $session = SessionFormation::with('formation')->findOrFail($id);
        return response()->json($session);
    }

    
    public function store(Request $request)
    {
        $session = SessionFormation::create([
            'formation_id' => $request->formation_id,
            'date_debut'   => $request->date_debut,
            'date_fin'     => $request->date_fin,
            'statut'       => 'en_attente'
        ]);

        return response()->json($session, 201);
    }

    
    public function update(Request $request, $id)
    {
        $session = SessionFormation::findOrFail($id);
        $session->update($request->all());
        return response()->json($session);
    }

    
    public function destroy($id)
    {
        SessionFormation::destroy($id);
        return response()->json(['message' => 'Session supprimée']);
    }

    
    public function valider($id)
    {
        $session = SessionFormation::findOrFail($id);
        $session->update(['statut' => 'valide']);
        return response()->json($session);
    }

    
    public function terminer($id)
    {
        $session = SessionFormation::findOrFail($id);
        $session->update(['statut' => 'terminee']);
        return response()->json($session);
    }

    public function mesSessions()
    {
        try {
            $user = auth()->user();
            if (!$user) {
                return response()->json(['error' => 'Not authenticated'], 401);
            }
            
            // Get all sessions for formations owned by this trainer
            $sessions = SessionFormation::with(['formation' => function ($q) use ($user) {
                $q->where('formateur_id', $user->id);
            }])->get();
            
            // Filter to only those belonging to trainer's formations
            $sessions = $sessions->filter(function ($session) use ($user) {
                return $session->formation && $session->formation->formateur_id == $user->id;
            })->values();
            
            return response()->json($sessions);
        } catch (\Exception $e) {
            \Log::error('Error in mesSessions: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
