<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class AdminUserController extends Controller
{
    // 1. View all users on the platform (Admin Only)
    public function index(Request $request)
    {
        // Security: Must be an admin
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized. Only Admins can manage accounts.'], 403);
        }

        // Fetch all users, ordered by newest first
        $users = User::orderBy('created_at', 'desc')->get();
        
        return response()->json($users, 200);
    }

    // 2. Delete a specific user (Admin Only)
    public function destroy(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        // Safety Check: Prevent the admin from accidentally deleting themselves!
        if ($request->user()->id == $id) {
            return response()->json(['message' => 'You cannot delete your own admin account.'], 400);
        }

        $user = User::findOrFail($id);
        $user->delete();

        return response()->json([
            'message' => 'User account deleted successfully'
        ], 200);
    }
}