<?php

namespace App\Http\Controllers;

use App\Models\Formation;
use App\Models\SessionFormation;
use App\Models\User;
use App\Models\Certificat;
use App\Models\Inscription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class DashboardController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/admin/dashboard",
     *     tags={"Dashboard"},
     *     summary="Get dashboard overview",
     *     security={{"bearer": {}}},
     *     @OA\Response(response=200, description="Dashboard data retrieved")
     * )
     */
    public function index()
    {
        return response()->json([
            'formations' => Formation::count(),
            'sessions_total' => SessionFormation::count(),
            'sessions_valides' => SessionFormation::where('statut', 'valide')->count(),
            'etudiants' => User::where('role', 'etudiant')->count(),
            'certificats' => Certificat::count(),
        ]);
    }

    /**
     * @OA\Get(
     *     path="/api/users",
     *     tags={"Users"},
     *     summary="Get all users",
     *     security={{"bearer": {}}},
     *     @OA\Response(response=200, description="Users list retrieved")
     * )
     */
    public function getUsers()
    {
        return response()->json(User::all());
    }

    /**
     * Pending role upgrade requests (admin only)
     */
    public function getPendingRoleRequests()
    {
        $pending = User::query()
            ->where('account_status', 'pending')
            ->whereNotNull('requested_role')
            ->orderByDesc('created_at')
            ->get();

        return response()->json($pending);
    }

    /**
     * Approve a pending role request (admin only)
     */
    public function approveRoleRequest(Request $request, $id)
    {
        $target = User::findOrFail($id);

        if ($target->account_status !== 'pending' || !$target->requested_role) {
            return response()->json(['message' => 'Aucune demande en attente pour cet utilisateur'], 400);
        }

        $target->update([
            'role' => $target->requested_role,
            'account_status' => 'approved',
            'requested_role' => null,
            'approved_at' => now(),
            'approved_by' => $request->user()->id,
        ]);

        return response()->json([
            'message' => 'Demande approuvée',
            'user' => $target,
        ]);
    }

    /**
     * Reject a pending role request (admin only)
     */
    public function rejectRoleRequest(Request $request, $id)
    {
        $target = User::findOrFail($id);

        if ($target->account_status !== 'pending' || !$target->requested_role) {
            return response()->json(['message' => 'Aucune demande en attente pour cet utilisateur'], 400);
        }

        $target->update([
            'account_status' => 'rejected',
            'requested_role' => null,
            'approved_at' => null,
            'approved_by' => $request->user()->id,
            // keep role as etudiant
        ]);

        return response()->json([
            'message' => 'Demande refusée',
            'user' => $target,
        ]);
    }

    /**
     * @OA\Get(
     *     path="/api/users/{id}",
     *     tags={"Users"},
     *     summary="Get a user by ID",
     *     security={{"bearer": {}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="User retrieved")
     * )
     */
    public function getUser($id)
    {
        $user = User::findOrFail($id);
        return response()->json($user);
    }

    /**
     * @OA\Post(
     *     path="/api/users",
     *     tags={"Users"},
     *     summary="Create a new user",
     *     security={{"bearer": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent()
     *     ),
     *     @OA\Response(response=201, description="User created")
     * )
     */
    public function createUser(Request $request)
    {
        $user = User::create([
            'nom' => $request->nom,
            'prenom' => $request->prenom,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role ?? 'etudiant',
        ]);

        return response()->json($user, 201);
    }

    /**
     * @OA\Put(
     *     path="/api/users/{id}",
     *     tags={"Users"},
     *     summary="Update a user",
     *     security={{"bearer": {}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="User updated")
     * )
     */
    public function updateUser(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $user->update($request->except('password'));

        if ($request->has('password')) {
            $user->update(['password' => Hash::make($request->password)]);
        }

        return response()->json($user);
    }

    /**
     * @OA\Delete(
     *     path="/api/users/{id}",
     *     tags={"Users"},
     *     summary="Delete a user",
     *     security={{"bearer": {}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="User deleted")
     * )
     */
    public function deleteUser($id)
    {
        User::destroy($id);
        return response()->json(['message' => 'Utilisateur supprimé']);
    }

    /**
     * @OA\Get(
     *     path="/api/stats",
     *     tags={"Dashboard"},
     *     summary="Get global statistics",
     *     security={{"bearer": {}}},
     *     @OA\Response(response=200, description="Statistics retrieved")
     * )
     */
    public function getStats()
    {
        return response()->json([
            'total_users' => User::count(),
            'total_formations' => Formation::count(),
            'total_sessions' => SessionFormation::count(),
            'total_inscriptions' => Inscription::count(),
            'total_certificats' => Certificat::count(),
            'admins' => User::where('role', 'admin')->count(),
            'formateurs' => User::where('role', 'formateur')->count(),
            'etudiants' => User::where('role', 'etudiant')->count(),
        ]);
    }
}
